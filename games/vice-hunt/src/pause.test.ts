import { describe, expect, it } from "vitest";
import { createClock, escapeAction } from "./pause";

describe("createClock", () => {
  it("the first tick steps by 0, then by the seconds since the last", () => {
    const c = createClock();
    expect(c.tick(1000)).toBe(0);
    expect(c.tick(1016)).toBeCloseTo(0.016, 6);
  });

  it("steps by 0 while paused", () => {
    const c = createClock();
    c.tick(1000);
    c.pause();
    expect(c.paused).toBe(true);
    expect(c.tick(5000)).toBe(0);
  });

  it("the first tick after a long pause steps by 0, not by the pause", () => {
    const c = createClock();
    c.tick(1000);
    c.pause();
    c.tick(5000);
    c.resume();
    expect(c.paused).toBe(false);
    expect(c.tick(9000)).toBe(0);
    expect(c.tick(9020)).toBeCloseTo(0.02, 6);
  });
});

describe("escapeAction", () => {
  it("pauses a round in play", () => {
    expect(escapeAction({ paused: false, wasted: false })).toBe("pause");
  });
  it("does nothing while already paused, so Esc on the menu resumes only once", () => {
    expect(escapeAction({ paused: true, wasted: false })).toBe("none");
  });
  it("does nothing during WASTED", () => {
    expect(escapeAction({ paused: false, wasted: true })).toBe("none");
  });
});
