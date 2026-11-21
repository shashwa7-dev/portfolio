import { describe, expect, it } from "vitest";
import { resolveFinish } from "../index";
import { CROUCH_TIME, ROCKET_FRAME_AT, rocket } from "./rocket";
import { begin, runToEnd } from "./testkit";

describe("rocket", () => {
  it("rocket switches to the rocket frame before lift-off and is done once y < -h", () => {
    expect(CROUCH_TIME).toBe(0.45);
    expect(ROCKET_FRAME_AT).toBe(0.2);
    const { s } = begin(rocket, "shark");
    const y0 = s.y;
    let switchedAt = -1;
    let liftAt = -1;
    let offAt = -1;
    const t = runToEnd(rocket, s, 1 / 60, 20, (now) => {
      if (switchedAt < 0 && s.rocket) switchedAt = now;
      if (liftAt < 0 && s.y < y0) liftAt = now;
      if (offAt < 0 && s.y < -s.h) offAt = now;
      if (s.y >= -s.h) expect(rocket.done(s)).toBe(false);
    });
    expect(switchedAt).toBeGreaterThan(0.19);
    expect(switchedAt).toBeLessThan(0.22);
    expect(liftAt).toBeGreaterThan(switchedAt);
    expect(liftAt).toBeGreaterThan(CROUCH_TIME);
    expect(offAt).toBeGreaterThan(0);
    expect(rocket.done(s)).toBe(true);
    // Nothing is emitted once off the top; the last smoke (0.9 s) burns out.
    expect(t - offAt).toBeLessThanOrEqual(0.95);
  });

  it("sprays fireworks under it", () => {
    const { s } = begin(rocket, "shark");
    for (let i = 0; i < 40; i++) rocket.step(s, 1 / 60, []);
    expect(s.parts.some((p) => p.kind === "dot")).toBe(true);
    expect(s.parts.some((p) => p.kind === "smoke")).toBe(true);
  });

  it("the reduced variant is done in at most 0.8 s", () => {
    const { s } = begin(rocket, "shark");
    const gentle = resolveFinish("rocket", true);
    expect(gentle).not.toBe(rocket);
    expect(runToEnd(gentle, s)).toBeLessThanOrEqual(0.8);
  });
});
