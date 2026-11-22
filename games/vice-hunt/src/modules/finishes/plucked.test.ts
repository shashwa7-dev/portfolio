import { describe, expect, it } from "vitest";
import type { GameEvent } from "../../events";
import { resolveFinish } from "../index";
import { CROUCH_TIME, GENTLE_FADE, SHOCK_TIME, plucked } from "./plucked";
import { H, W, begin, runToEnd } from "./testkit";

describe("plucked", () => {
  it("shouts, shivers in place, then rushes off in its facing direction, accelerating", () => {
    const { s } = begin(plucked, "ostrich");
    s.dir = 1;
    const out: GameEvent[] = [];
    plucked.step(s, 1 / 60, out);
    expect(out.filter((e) => e.type === "callout").map((e) => (e as { text: string }).text)).toEqual(["!!"]);
    const x0 = s.x0;
    let t = 1 / 60;
    while (t < SHOCK_TIME + CROUCH_TIME - 0.02) {
      plucked.step(s, 1 / 60, out);
      t += 1 / 60;
      expect(Math.abs(s.x - x0)).toBeLessThan(4); // a shiver, no travel
    }
    const speeds: number[] = [];
    let last = s.x;
    for (let i = 0; i < 20; i++) {
      plucked.step(s, 1 / 60, out);
      speeds.push(s.x - last);
      last = s.x;
    }
    expect(speeds[19]).toBeGreaterThan(speeds[5]);
    expect(speeds[5]).toBeGreaterThan(0);
  });

  it("bursts its feathers at the start", () => {
    const { s } = begin(plucked, "ostrich");
    plucked.step(s, 1 / 60, []);
    expect(s.parts.filter((p) => p.kind === "dot" && p.spin !== 0).length).toBeGreaterThanOrEqual(40);
  });

  it("a left-facing bird leaves through the left edge; done once off screen and every particle is gone", () => {
    const { s } = begin(plucked, "ostrich");
    s.dir = -1;
    let offAt = -1;
    runToEnd(plucked, s, 1 / 60, 20, (now) => {
      if (offAt < 0 && s.x + s.w < 0) offAt = now;
      if (s.x + s.w >= 0) expect(plucked.done(s)).toBe(false);
    });
    expect(offAt).toBeGreaterThan(0);
    expect(s.x).toBeLessThan(0);
    expect(plucked.done(s)).toBe(true);
    expect(s.parts).toHaveLength(0);
    expect(s.x).toBeGreaterThan(-W * 10);
  });

  it("the gentle version never travels and fades out", () => {
    const { s } = begin(plucked, "ostrich");
    const gentle = resolveFinish("plucked", true);
    expect(gentle).not.toBe(plucked);
    const x0 = s.x;
    const t = runToEnd(gentle, s);
    expect(s.x).toBe(x0);
    expect(s.alpha).toBe(0);
    expect(t).toBeLessThanOrEqual(GENTLE_FADE + 3.6); // its feathers settle within their life
    expect(H).toBeGreaterThan(0);
  });
});
