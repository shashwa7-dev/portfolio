import { describe, expect, it } from "vitest";
import { parsePlaylist, playlistChanges, renderPlaylist, validTracks, youTubeId } from "./playlistFile";

describe("youTubeId", () => {
  it("reads the id from the usual link shapes", () => {
    expect(youTubeId("https://www.youtube.com/watch?v=xAgUYyosqVM")).toBe("xAgUYyosqVM");
    expect(youTubeId("https://www.youtube.com/watch?v=5dPwBWvmcbQ&list=RD5dPwBWvmcbQ")).toBe("5dPwBWvmcbQ");
    expect(youTubeId("https://youtu.be/xAgUYyosqVM?si=abc")).toBe("xAgUYyosqVM");
    expect(youTubeId("https://music.youtube.com/watch?v=_K6MoWuAXjQ")).toBe("_K6MoWuAXjQ");
    expect(youTubeId("https://www.youtube.com/shorts/2-V8kYT1pvE")).toBe("2-V8kYT1pvE");
    expect(youTubeId("xAgUYyosqVM")).toBe("xAgUYyosqVM");
  });
  it("is null for anything else", () => {
    expect(youTubeId("https://example.com/watch?v=xAgUYyosqVM")).toBeNull();
    expect(youTubeId("not a link")).toBeNull();
    expect(youTubeId("")).toBeNull();
  });
});

describe("renderPlaylist", () => {
  const source = `/** header */
export type Track = { id: string; title: string; artist: string };

export const PLAYLIST: readonly Track[] = [
  { id: "aaaaaaaaaaa", title: "Old", artist: "Someone" },
];
`;
  it("replaces only the list, keeping the rest of the file", () => {
    const out = renderPlaylist(source, [
      { id: "xAgUYyosqVM", title: "Love Is A Long Road", artist: "Tom Petty" },
      { id: "5dPwBWvmcbQ", title: 'Say "Hi"', artist: "A & B" },
    ]);
    expect(out).toBe(`/** header */
export type Track = { id: string; title: string; artist: string };

export const PLAYLIST: readonly Track[] = [
  { id: "xAgUYyosqVM", title: "Love Is A Long Road", artist: "Tom Petty" },
  { id: "5dPwBWvmcbQ", title: "Say \\"Hi\\"", artist: "A & B" },
];
`);
  });
  it("refuses a file without the list rather than writing a broken one", () => {
    expect(() => renderPlaylist("export const X = 1;\n", [])).toThrow();
  });
});

describe("renderPlaylist on the real track.ts", () => {
  it("writing the current list back changes nothing", async () => {
    const { readFileSync } = await import("node:fs");
    const { PLAYLIST } = await import("../../components/gta6/track");
    const file = readFileSync(new URL("../../components/gta6/track.ts", import.meta.url), "utf8");
    expect(renderPlaylist(file, PLAYLIST)).toBe(file);
  });
  it("parsePlaylist reads the same list the module exports", async () => {
    const { readFileSync } = await import("node:fs");
    const { PLAYLIST } = await import("../../components/gta6/track");
    const file = readFileSync(new URL("../../components/gta6/track.ts", import.meta.url), "utf8");
    expect(parsePlaylist(file)).toEqual(PLAYLIST);
  });
});

describe("playlistChanges", () => {
  const a = { id: "aaaaaaaaaaa", title: "A", artist: "x" };
  const b = { id: "bbbbbbbbbbb", title: "B", artist: "y" };
  const c = { id: "ccccccccccc", title: "C", artist: "z" };
  it("names what was added, removed, edited and whether the theme changed", () => {
    const ch = playlistChanges([a, b], [c, { ...a, title: "A2" }]);
    expect(ch.added).toEqual([c]);
    expect(ch.removed).toEqual([b]);
    expect(ch.edited).toEqual([{ ...a, title: "A2" }]);
    expect(ch.theme).toEqual(c);
  });
  it("is empty for the same list", () => {
    expect(playlistChanges([a, b], [a, b])).toEqual({ added: [], removed: [], edited: [], reordered: false, theme: null });
  });
  it("notices a reorder", () => {
    expect(playlistChanges([a, b, c], [a, c, b]).reordered).toBe(true);
  });
});

describe("validTracks", () => {
  it("returns the tracks trimmed when every one has a YouTube id and a title", () => {
    expect(validTracks([{ id: "xAgUYyosqVM", title: " Love ", artist: " Tom " }])).toEqual([
      { id: "xAgUYyosqVM", title: "Love", artist: "Tom" },
    ]);
  });
  it("is null for anything malformed, without throwing", () => {
    expect(validTracks([])).toBeNull();
    expect(validTracks("nope")).toBeNull();
    expect(validTracks([null])).toBeNull();
    expect(validTracks([{ title: "No id", artist: "" }])).toBeNull();
    expect(validTracks([{ id: 42, title: "Bad id", artist: "" }])).toBeNull();
    expect(validTracks([{ id: "xAgUYyosqVM", title: "  ", artist: "" }])).toBeNull();
    expect(validTracks([{ id: "https://youtu.be/xAgUYyosqVM", title: "Link not id", artist: "" }])).toBeNull();
  });
});
