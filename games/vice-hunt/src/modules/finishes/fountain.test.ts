import { describe, expect, it } from "vitest";
import { SEA_LINE } from "../../config";
import { resolveFinish } from "../index";
import { RING_LIFE } from "../../fx/particles";
import { FISH_COUNT, fountain } from "./fountain";
import { H, begin, runToEnd } from "./testkit";

describe("fountain", () => {
  it("fountain emits 26 fish and is done when the last one re-enters", () => {
    expect(FISH_COUNT).toBe(26);
    const { s } = begin(fountain, "merman");
    expect(s.fish).toHaveLength(26);
    let lastIn = -1;
    let airborne = 26;
    const t = runToEnd(fountain, s, 1 / 60, 20, (now) => {
      const n = s.fish.filter((f) => f.age < f.life).length;
      if (n > 0) expect(fountain.done(s)).toBe(false);
      if (n === 0 && airborne > 0) lastIn = now;
      airborne = n;
    });
    expect(fountain.done(s)).toBe(true);
    expect(lastIn).toBeGreaterThan(0);
    // Done once the last fish is back in and its splash has played.
    expect(t - lastIn).toBeLessThanOrEqual(RING_LIFE + 0.02);
  });

  it("each fish splashes on re-entry at SEA_LINE", () => {
    const { s } = begin(fountain, "merman");
    runToEnd(fountain, s);
    const sea = SEA_LINE * H;
    expect(s.rings.length).toBeGreaterThanOrEqual(26 + 1);
    expect(s.rings.every((r) => r.y === sea)).toBe(true);
  });

  it("the reduced variant is done in at most 0.8 s", () => {
    const { s } = begin(fountain, "merman");
    const gentle = resolveFinish("fountain", true);
    expect(gentle).not.toBe(fountain);
    expect(runToEnd(gentle, s)).toBeLessThanOrEqual(0.8);
  });
});
