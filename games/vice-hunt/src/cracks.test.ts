import { describe, expect, it } from "vitest";
import { crackPath } from "./cracks";
import { mulberry32 } from "./rng";

describe("crackPath", () => {
  const d = crackPath(100, 100, mulberry32(3));

  it("starts at the hole centre", () => {
    expect(d.startsWith("M100 100")).toBe(true);
  });

  it("has 7 to 11 spokes", () => {
    const spokes = d.split("M100 100").length - 1;
    expect(spokes).toBeGreaterThanOrEqual(7);
    expect(spokes).toBeLessThanOrEqual(11);
  });

  it("keeps every point within 80px of the centre", () => {
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(nums.length % 2).toBe(0);
    for (let i = 0; i < nums.length; i += 2) {
      expect(Math.hypot(nums[i] - 100, nums[i + 1] - 100)).toBeLessThanOrEqual(80);
    }
  });

  it("differs between seeds", () => {
    expect(crackPath(100, 100, mulberry32(4))).not.toBe(d);
  });
});
