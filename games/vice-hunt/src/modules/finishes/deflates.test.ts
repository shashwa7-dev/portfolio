import { describe, expect, it } from "vitest";
import { resolveFinish } from "../index";
import { DEFLATE_TIME, deflates } from "./deflates";
import { begin, runToEnd } from "./testkit";

describe("deflates", () => {
  it("deflates done after 1.7 s", () => {
    expect(DEFLATE_TIME).toBe(1.7);
    const { s } = begin(deflates, "cow");
    for (let i = 0; i < 84; i++) deflates.step(s, 0.02, []); // 1.68 s
    expect(deflates.done(s)).toBe(false);
    deflates.step(s, 0.02, []);
    expect(deflates.done(s)).toBe(true);
  });

  it("shrinks, rises and blows white puffs behind her", () => {
    const { s } = begin(deflates, "cow");
    const y0 = s.y;
    for (let i = 0; i < 40; i++) deflates.step(s, 0.02, []);
    expect(s.scale).toBeLessThan(1);
    expect(s.y).toBeLessThan(y0);
    expect(s.parts.length).toBeGreaterThan(0);
    expect(s.parts.every((p) => p.color.startsWith("rgba(255,255,255"))).toBe(true);
  });

  it("the reduced variant is done in at most 0.8 s", () => {
    const { s } = begin(deflates, "cow");
    const gentle = resolveFinish("deflates", true);
    expect(gentle).not.toBe(deflates);
    expect(runToEnd(gentle, s)).toBeLessThanOrEqual(0.8);
  });
});
