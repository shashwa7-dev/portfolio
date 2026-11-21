import { describe, expect, it } from "vitest";
import { playOrder, stepTrack, trackTitle } from "./radio";

describe("stepTrack", () => {
  it("moves forward and back by one", () => {
    expect(stepTrack(0, 1, 30)).toBe(1);
    expect(stepTrack(5, -1, 30)).toBe(4);
  });
  it("wraps past the last track to the first, and before the first to the last", () => {
    expect(stepTrack(29, 1, 30)).toBe(0);
    expect(stepTrack(0, -1, 30)).toBe(29);
  });
  it("wraps steps longer than the list", () => {
    expect(stepTrack(28, 5, 30)).toBe(3);
    expect(stepTrack(1, -33, 30)).toBe(28);
  });
  it("stays at 0 for an empty list", () => {
    expect(stepTrack(0, 1, 0)).toBe(0);
  });
});

describe("trackTitle", () => {
  it("uses the player's title once known", () => {
    expect(trackTitle(0, "Vice City Nights")).toBe("Vice City Nights");
  });
  it("falls back to the track's number, counted from one", () => {
    expect(trackTitle(0)).toBe("Track 1");
    expect(trackTitle(29, undefined)).toBe("Track 30");
  });
  it("treats a blank title as unknown", () => {
    expect(trackTitle(2, "  ")).toBe("Track 3");
  });
  it("trims the title", () => {
    expect(trackTitle(2, "  Song  ")).toBe("Song");
  });
});

/** A seeded source (mulberry32), so shuffles repeat. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("playOrder", () => {
  it("always starts with the first entry", () => {
    for (let seed = 1; seed < 50; seed++) expect(playOrder(31, seeded(seed))[0]).toBe(0);
    expect(playOrder(31)[0]).toBe(0);
  });
  it("plays every other entry exactly once", () => {
    const order = playOrder(31, seeded(7));
    expect(order).toHaveLength(31);
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 31 }, (_, i) => i));
  });
  it("is deterministic for a given random source", () => {
    expect(playOrder(31, seeded(42))).toEqual(playOrder(31, seeded(42)));
    expect(playOrder(31, seeded(42))).not.toEqual(playOrder(31, seeded(43)));
  });
  it("actually shuffles the rest", () => {
    const identity = Array.from({ length: 31 }, (_, i) => i);
    expect(playOrder(31, seeded(3))).not.toEqual(identity);
  });
  it("handles tiny lists", () => {
    expect(playOrder(0)).toEqual([]);
    expect(playOrder(1)).toEqual([0]);
    expect(playOrder(2)).toEqual([0, 1]);
  });
});
