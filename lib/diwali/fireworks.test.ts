import { describe, it, expect } from "vitest";
import { burstTier, emberCount } from "./fireworks";

describe("burstTier", () => {
  it("splits at 0.22 and 0.65", () => {
    expect(burstTier(0)).toBe("huge");
    expect(burstTier(0.219)).toBe("huge");
    expect(burstTier(0.22)).toBe("medium");
    expect(burstTier(0.649)).toBe("medium");
    expect(burstTier(0.65)).toBe("small");
    expect(burstTier(0.999)).toBe("small");
  });
  it("gives huge bursts about 22 percent", () => {
    const n = 10000;
    let huge = 0;
    for (let i = 0; i < n; i++) if (burstTier(i / n) === "huge") huge++;
    expect(huge / n).toBeCloseTo(0.22, 1);
    expect(Math.abs(huge / n - 0.22)).toBeLessThanOrEqual(0.01);
  });
});

describe("emberCount", () => {
  it("scales with size", () => {
    expect(emberCount(1, 0.5)).toBe(240);
    expect(emberCount(0.28, 0)).toBe(93);
  });
});
