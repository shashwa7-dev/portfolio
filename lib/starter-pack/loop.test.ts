import { describe, expect, it } from "vitest";
import { advance, createFrameClock, MAX_STEPS } from "./loop";

describe("fixed-step loop", () => {
  it("clamps catch-up steps after a long pause", () => {
    expect(advance(0, 60000).steps).toBe(MAX_STEPS);
    expect(MAX_STEPS).toBe(6);
  });

  it("runs one step per 1/120 s frame", () => {
    expect(advance(0, 1000 / 120).steps).toBe(1);
  });
});

describe("frame clock", () => {
  it("keeps real time across 60 Hz frames, carrying the remainder", () => {
    const clock = createFrameClock();
    clock.wake(0);
    let steps = 0;
    for (let i = 1; i <= 60; i++) steps += clock.tick((i * 1000) / 60);
    // One second of 60 Hz frames is 120 physics steps, give or take one.
    expect(Math.abs(steps - 120)).toBeLessThanOrEqual(1);
  });

  it("starts fresh after waking, with no jump for the time asleep", () => {
    const clock = createFrameClock();
    clock.wake(0);
    clock.tick(16);
    clock.wake(60000);
    expect(clock.tick(60000 + 1000 / 120)).toBe(1);
  });
});
