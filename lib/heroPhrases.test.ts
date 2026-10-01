import { describe, expect, it } from "vitest";
import { HERO_PHRASES, nextPhrase } from "./heroPhrases";

describe("HERO_PHRASES", () => {
  it("opens on ship and scale, then the mixed set", () => {
    expect(HERO_PHRASES).toEqual(["ship and scale", "feel effortless", "make AI usable", "feel instant"]);
  });

  it("has no em-dash", () => {
    for (const p of HERO_PHRASES) expect(p).not.toMatch(/—/);
  });
});

describe("nextPhrase", () => {
  it("steps forward and wraps back to the first", () => {
    expect(nextPhrase(0)).toBe(1);
    expect(nextPhrase(HERO_PHRASES.length - 1)).toBe(0);
  });
});
