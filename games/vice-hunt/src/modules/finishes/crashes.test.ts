import { describe, expect, it } from "vitest";
import { SEA_LINE } from "../../config";
import { resolveFinish } from "../index";
import { ALIEN_AT, crashes } from "./crashes";
import { H, begin, runToEnd } from "./testkit";

describe("crashes", () => {
  it("crashes switches to ufoEmpty when the alien appears; both splash events land on SEA_LINE", () => {
    expect(ALIEN_AT).toBe(0.38);
    const { s } = begin(crashes, "ufo");
    expect(s.empty).toBe(false);
    expect(s.alien).toBeNull();
    let seenAt = -1;
    runToEnd(crashes, s, 1 / 60, 30, (now) => {
      expect(s.empty).toBe(s.alien !== null);
      if (seenAt < 0 && s.alien) seenAt = now;
    });
    expect(crashes.done(s)).toBe(true);
    expect(seenAt).toBeGreaterThanOrEqual(0.38);
    expect(seenAt).toBeLessThan(0.4);
    expect(s.rings).toHaveLength(2);
    expect(s.rings.map((r) => r.big)).toEqual([true, false]); // the saucer lands first, then the alien
    for (const r of s.rings) expect(r.y).toBe(SEA_LINE * H);
  });

  it("the reduced variant is done in at most 0.8 s", () => {
    const { s } = begin(crashes, "ufo");
    const gentle = resolveFinish("crashes", true);
    expect(gentle).not.toBe(crashes);
    expect(runToEnd(gentle, s)).toBeLessThanOrEqual(0.8);
  });
});
