import { describe, expect, it } from "vitest";
import { stepTrack, trackTitle } from "./radio";

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
