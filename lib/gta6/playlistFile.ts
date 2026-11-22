// Pure helpers for the dev-only playlist editor (`/dev/radio`): read a
// YouTube id out of a pasted link, and rewrite the `PLAYLIST` array in
// `components/gta6/track.ts` without touching the rest of that file.

export type TrackEntry = { id: string; title: string; artist: string };

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]);

/** The 11-character video id from a YouTube link (watch, youtu.be, shorts)
 *  or a bare id; null for anything else. */
export function youTubeId(input: string): string | null {
  const s = input.trim();
  if (ID.test(s)) return s;
  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return null;
  }
  if (!HOSTS.has(url.hostname)) return null;
  const id =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url.pathname.startsWith("/shorts/")
        ? url.pathname.split("/")[2]
        : url.searchParams.get("v");
  return id && ID.test(id) ? id : null;
}

const LIST = /(export const PLAYLIST: readonly Track\[\] = \[\n)[\s\S]*?(\n\];)/;

/** `source` (track.ts) with its PLAYLIST array replaced by `tracks`, one
 *  entry a line. Throws if the array is not where it is expected, so a
 *  changed file is never overwritten with something broken. */
export function renderPlaylist(source: string, tracks: readonly TrackEntry[]): string {
  if (!LIST.test(source)) throw new Error("PLAYLIST array not found in track.ts");
  const q = (v: string) => JSON.stringify(v);
  const lines = tracks.map((t) => `  { id: ${q(t.id)}, title: ${q(t.title)}, artist: ${q(t.artist)} },`).join("\n");
  return source.replace(LIST, (_m, open: string, close: string) => `${open}${lines}${close}`);
}

const STR = String.raw`"(?:[^"\\]|\\.)*"`;
const ENTRY = new RegExp(String.raw`\{ id: (${STR}), title: (${STR}), artist: (${STR}) \}`, "g");

/** The PLAYLIST entries as written in `source` (track.ts), read from the
 *  file rather than the module so the editor always shows what is on disk. */
export function parsePlaylist(source: string): TrackEntry[] {
  const list = LIST.exec(source);
  if (!list) throw new Error("PLAYLIST array not found in track.ts");
  return [...list[0].matchAll(ENTRY)].map((m) => ({
    id: JSON.parse(m[1]) as string,
    title: JSON.parse(m[2]) as string,
    artist: JSON.parse(m[3]) as string,
  }));
}

export type PlaylistChanges = {
  added: TrackEntry[];
  removed: TrackEntry[];
  /** Kept songs whose title or artist changed (as they are now). */
  edited: TrackEntry[];
  /** The kept songs are in a different order. */
  reordered: boolean;
  /** The new theme, when the first song changed. */
  theme: TrackEntry | null;
};

/** What changed from `before` to `after`, for the update PR's description. */
export function playlistChanges(before: readonly TrackEntry[], after: readonly TrackEntry[]): PlaylistChanges {
  const was = new Map(before.map((t) => [t.id, t]));
  const now = new Set(after.map((t) => t.id));
  const kept = after.filter((t) => was.has(t.id));
  const keptBefore = before.filter((t) => now.has(t.id));
  return {
    added: after.filter((t) => !was.has(t.id)),
    removed: before.filter((t) => !now.has(t.id)),
    edited: kept.filter((t) => {
      const w = was.get(t.id)!;
      return w.title !== t.title || w.artist !== t.artist;
    }),
    reordered: kept.some((t, i) => keptBefore[i].id !== t.id),
    theme: after[0] && after[0].id !== before[0]?.id ? after[0] : null,
  };
}

/** A request body as a track list (trimmed), or null unless it is a
 *  non-empty array where every entry has a bare YouTube id and a title. */
export function validTracks(body: unknown): TrackEntry[] | null {
  if (!Array.isArray(body) || body.length === 0) return null;
  const out: TrackEntry[] = [];
  for (const t of body as unknown[]) {
    if (!t || typeof t !== "object") return null;
    const { id, title, artist } = t as Record<string, unknown>;
    if (typeof id !== "string" || youTubeId(id) !== id) return null;
    if (typeof title !== "string" || !title.trim() || typeof artist !== "string") return null;
    out.push({ id, title: title.trim(), artist: artist.trim() });
  }
  return out;
}
