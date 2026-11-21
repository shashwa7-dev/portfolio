import { describe, expect, it } from "vitest";
import { cubicBezier, keyframes } from "./ease";

describe("ease", () => {
  it("cubicBezier matches the ends and a linear curve", () => {
    const lin = cubicBezier(0.25, 0.25, 0.75, 0.75);
    expect(lin(0)).toBe(0);
    expect(lin(1)).toBe(1);
    expect(lin(0.3)).toBeCloseTo(0.3, 3);
    const easeIn = cubicBezier(0.42, 0, 1, 1);
    expect(easeIn(0.5)).toBeLessThan(0.5);
  });

  it("keyframes blend linearly between offsets", () => {
    const keys = [
      { at: 0, v: 0 },
      { at: 0.5, v: 10 },
      { at: 1, v: 0 },
    ];
    expect(keyframes(keys, 0.25).v).toBeCloseTo(5);
    expect(keyframes(keys, 0.75).v).toBeCloseTo(5);
    expect(keyframes(keys, 1).v).toBeCloseTo(0);
  });
});
