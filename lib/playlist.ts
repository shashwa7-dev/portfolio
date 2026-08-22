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
 * The feed carries the video's own upload date rather than the date it was
 * added to the playlist, so there is no way to sort by "recently added" from
 * here. Items arrive in playlist order, which makes the top of the playlist the
 * place to put a new song.
 */

const FEED = "https://www.youtube.com/feeds/videos.xml?playlist_id=";

/** Public, so it is not a secret, but it is configuration rather than content. */
export const PLAYLIST_ID = "PLJhr-KnGsmsE";

export const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

/**
 * Five, out of the fifteen the feed will hand over.
 *
 * The section is a taste and not a catalogue, and the whole playlist is linked
 * directly underneath for anyone who wants the rest. Fifteen rows would make
 * this the longest thing on the shelf, which is more than a list of songs has
 * earned next to everything else on the page.
 */
const LIMIT = 5;

export type Track = {
  title: string;
  artist: string;
  /** The video, for anyone who wants to actually watch it. */
  url: string;
  /** Album art where it was found, the video still otherwise. */
  artwork: string;
  /** A 30 second clip, or null when the track could not be matched. */
  preview: string | null;
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
 *
 * No rule for a trailing `| something`. It looks like the same kind of junk and
 * is not: "Tere Bina | Guru | A.R. Rahman" carries the film and the composer
 * after the pipe, and stripping there would throw away the half that says what
 * the song is. Parentheses are reliably decoration. Pipes are not.
 */
const SUFFIX =
  /\s*[([]\s*(?:official\s*)?(?:music\s*)?(?:lyric\s*)?(?:video|audio|visualizer|visualiser|version|hd|4k|mv)\s*[)\]]\s*$/i;

/**
 * Built from the video id rather than taken from the feed, and the difference
 * is visible.
 *
 * The feed's `media:thumbnail` points at `hqdefault.jpg`, which is 480x360.
 * That is 4:3, and every 16:9 video is padded into it with black bars: the top
 * row of that file reads (0,0,0) all the way across.
 *
 * `mqdefault.jpg` is 320x180, genuinely 16:9, always present, and a third of
 * the weight. It is only reached for when Apple has no sleeve for the track,
 * since a video still cropped to a circle is a poor substitute for one.
 */
const thumbnailFor = (id: string) =>
  `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

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

  /* Split the title on a dash before trusting the channel name.
     "Artist - Song" is what uploaders overwhelmingly write, and the channel is
     frequently not the artist in any usable form: a label account, or a VEVO
     one, where "John Mayer - Something Like Olivia" arrives from a channel
     called `johnmayerVEVO`. Matching the channel against the front of the
     title, which is what this used to do, fails on exactly that, and then the
     artist stays "johnmayerVEVO" and the song keeps its own name glued to the
     front of it. Both halves have to be non-empty, so a title that merely ends
     in a dash does not blank itself. */
  const split = title.match(/^(.{2,60}?)\s+[-–—]\s+(.+)$/);
  if (split) return { title: split[2].trim(), artist: split[1].trim() };

  // No dash: the channel is the best guess at the artist. `VEVO` is a
  // distributor's suffix rather than part of anybody's name.
  const artist = channel.trim().replace(/VEVO$/i, "").trim() || channel.trim();
  const prefix = new RegExp(`^${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-–—:]\\s*`, "i");
  const stripped = title.replace(prefix, "").trim();

  // Only take the stripped version if something is left of it. A title that is
  // exactly the channel name would otherwise render as a blank row.
  return { title: stripped || title.trim() || rawTitle.trim(), artist };
}

/** Case, punctuation and accents off, so two spellings of one title compare equal. */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/**
 * The same, with any trailing bracketed clause taken off first.
 *
 * Catalogues and uploaders disagree about these constantly, and in both
 * directions. Apple files most Indian film music with the picture attached,
 * so a playlist entry called "Pal Pal Dil Ke Paas" has to reach a track called
 * `Pal Pal Dil Ke Paas (From "Blackmail")`. Going the other way, a video
 * titled "Someone Like You (Live)" has to reach a plain "Someone Like You".
 *
 * Deliberately not a substring test, which is the obvious way to do this and
 * is wrong: "Stronger" is a substring of "Stronger Than Me", and a play button
 * that quietly serves a different song is worse than one that is missing.
 * Dropping the bracket and then requiring the rest to match exactly keeps both
 * of those apart.
 */
const BRACKETED = /\s*[([][^()[\]]*[)\]]\s*$/;
const core = (s: string) => {
  let previous: string;
  do {
    previous = s;
    s = s.replace(BRACKETED, "").trim();
  } while (s !== previous);
  return fold(s);
};

/**
 * The clip and the sleeve, from Apple's public search endpoint.
 *
 * Apple rather than YouTube for the audio, and it is not a close call. Playing
 * a preview through YouTube means their iframe player, which means a
 * third-party script on a page that currently has none, cookies with it, and a
 * real chance of serving an advert to somebody who asked for fifteen seconds of
 * a song. This endpoint needs no key, returns a plain audio file, and sends
 * `access-control-allow-origin: *`, which is the header that lets the waveform
 * read the actual audio instead of miming to it.
 *
 * Apple also has the album art, which is square and drawn to be looked at. A
 * video still cropped to a circle is not.
 *
 * The match is checked rather than trusted. Taking the first result on faith
 * puts a covers-band recording, or an unrelated song that happens to share a
 * word, behind a play button labelled with the real one. If no result folds
 * down to the same title, the track keeps its video still and gets no preview,
 * which the row already knows how to render.
 */
async function findPreview(
  title: string,
  artist: string
): Promise<{ artwork: string; preview: string } | null> {
  try {
    const term = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&limit=5`,
      // A song's clip and sleeve do not change. Only the playlist does.
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;

    const { results } = (await res.json()) as {
      results?: {
        trackName?: string;
        previewUrl?: string;
        artworkUrl100?: string;
      }[];
    };

    /* Exact first, across every result, and only then the relaxed pass.
       One combined test would take whichever result came back first, and a
       search for "The Less I Know The Better" returns a Club Edit above the
       original often enough to matter. */
    const playable = (results ?? []).filter((r) => r.previewUrl && r.trackName);
    const want = fold(title);
    const wantCore = core(title);
    const hit =
      playable.find((r) => fold(r.trackName!) === want) ??
      playable.find((r) => core(r.trackName!) === wantCore);
    if (!hit?.previewUrl || !hit.artworkUrl100) return null;

    return {
      // The size sits in the filename, so a bigger sleeve is a string swap.
      // 200 covers a 44px record at any pixel density worth serving.
      artwork: hit.artworkUrl100.replace("100x100", "200x200"),
      preview: hit.previewUrl,
    };
  } catch {
    return null;
  }
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

    const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
      .flatMap(([, entry]) => {
        const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
        const rawTitle = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
        const channel = entry.match(/<name>([\s\S]*?)<\/name>/)?.[1];
        if (!id || !rawTitle) return [];
        return [{ id, ...parseTrack(decode(rawTitle), decode(channel ?? "")) }];
      })
      .slice(0, LIMIT);

    // Looked up together rather than one after another. Five sequential round
    // trips to Apple would be five times the wait on a cold render, and they
    // have nothing to say to one another.
    return await Promise.all(
      entries.map(async ({ id, title, artist }) => {
        const found = await findPreview(title, artist);
        return {
          title,
          artist,
          url: `https://www.youtube.com/watch?v=${id}`,
          artwork: found?.artwork || thumbnailFor(id),
          preview: found?.preview ?? null,
        };
      })
    );
  } catch {
    return [];
  }
}
