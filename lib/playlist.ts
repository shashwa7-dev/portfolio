/**
 * What Shashwat is listening to, read from a YouTube playlist.
 *
 * The playlist is the source. Add a song there and it appears here; remove it
 * and it goes. Nothing in this repo lists a single track, which is the whole
 * point: a hardcoded list of songs is out of date the week after it ships, and
 * nobody opens a pull request to say they got bored of a song.
 *
 * Read through YouTube's RSS feed rather than the Data API. The API would need
 * a Google Cloud project, a key in the environment, and a quota to keep an eye
 * on, and it would buy nothing this page uses. The feed is a plain GET on a
 * public URL.
 *
 * What that costs: the feed returns at most 15 entries and no more, and it
 * carries the video's own upload date rather than the date it was added to the
 * playlist, so there is no way to sort by "recently added" from here. Items
 * arrive in playlist order, so putting new songs at the top of the playlist is
 * what makes them show first.
 */

const FEED = "https://www.youtube.com/feeds/videos.xml?playlist_id=";

/** Public, so it is not a secret, but it is configuration rather than content. */
export const PLAYLIST_ID = "PLJhr-KnGsmsE";

export const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

export type Track = {
  title: string;
  artist: string;
  url: string;
};

/** Entities, because the feed is XML and titles are full of `&amp;` and `&#39;`. */
function decode(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * The junk a music video title collects on the way to YouTube.
 *
 * Anchored to the end because these always trail the actual name. Run
 * repeatedly, since one title can carry several ("... (Official Video) [4K]").
 */
/* No rule for a trailing `| something`. It looks like the same kind of junk and
   is not: "Tere Bina | Guru | A.R. Rahman" carries the film and the composer
   after the pipe, and stripping there would throw away the half that says what
   the song is. Parentheses are reliably decoration, pipes are not. */
const SUFFIX =
  /\s*[([]\s*(?:official\s*)?(?:music\s*)?(?:lyric\s*)?(?:video|audio|visualizer|visualiser|version|hd|4k|mv)\s*[)\]]\s*$/i;

/**
 * A cleaner title and a real artist, from two fields that disagree about which
 * is which.
 *
 * YouTube auto-generates an "Artist - Topic" channel for licensed music, and
 * those entries are already tidy: the channel is the artist and the title is
 * just the song. That is the easy half, and it covers most of a music playlist.
 *
 * Everything else is somebody's upload, where the title tends to repeat the
 * artist ("Magic City Hippies - Enemies (Official Video)") and carries a
 * parenthetical or two. Stripping the channel name off the front only when it
 * is actually there is what stops "Enemies" turning into an empty string on a
 * title that never repeated the artist in the first place.
 */
function parseTrack(rawTitle: string, channel: string): { title: string; artist: string } {
  const topic = channel.match(/^(.*?)\s*-\s*Topic$/i);
  if (topic) return { title: rawTitle.trim(), artist: topic[1].trim() };

  let title = rawTitle;
  let previous: string;
  do {
    previous = title;
    title = title.replace(SUFFIX, "");
  } while (title !== previous);

  const artist = channel.trim();
  const prefix = new RegExp(`^${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-–—:]\\s*`, "i");
  const stripped = title.replace(prefix, "").trim();

  // Only take the stripped version if something is left of it. A title that is
  // exactly the channel name would otherwise render as a blank row.
  return { title: stripped || title.trim() || rawTitle.trim(), artist };
}

/**
 * The playlist, or nothing.
 *
 * Every failure returns an empty list rather than throwing: the feed is a third
 * party this page does not control, and a playlist being unreachable is not a
 * reason for the shelf to 500. The section renders nothing when this is empty.
 *
 * Revalidated hourly. The page is otherwise static, and this is the only thing
 * on it that changes without a deploy.
 */
export async function getPlaylist(): Promise<Track[]> {
  try {
    const res = await fetch(`${FEED}${PLAYLIST_ID}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    return Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).flatMap(
      ([, entry]) => {
        const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
        const rawTitle = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
        const channel = entry.match(/<name>([\s\S]*?)<\/name>/)?.[1];
        if (!id || !rawTitle) return [];

        const { title, artist } = parseTrack(decode(rawTitle), decode(channel ?? ""));
        return [{ title, artist, url: `https://www.youtube.com/watch?v=${id}` }];
      }
    );
  } catch {
    return [];
  }
}
