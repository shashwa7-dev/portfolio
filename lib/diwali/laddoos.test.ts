import { describe, it, expect } from "vitest";
import { LADDOO_SPOTS, spotBox } from "./laddoos";

describe("laddoo spots", () => {
  it("has nine, all inside the plate", () => {
    expect(LADDOO_SPOTS.length).toBe(9);
    for (const s of LADDOO_SPOTS) {
      expect(s.x - s.r).toBeGreaterThanOrEqual(0);
      expect(s.x + s.r).toBeLessThanOrEqual(100);
      expect(s.y).toBeGreaterThan(0);
      expect(s.y).toBeLessThan(100);
      expect(s.r).toBeGreaterThan(3);
    }
  });
  it("spotBox converts radius to a percent box", () => {
    expect(spotBox({ x: 50, y: 50, r: 10 })).toEqual({ left: 40, width: 20, height: 30, top: 35 });
  });
  it("every box stays inside the plate vertically", () => {
    for (const s of LADDOO_SPOTS) {
      const b = spotBox(s);
      expect(b.top).toBeGreaterThanOrEqual(0);
      expect(b.top + b.height).toBeLessThanOrEqual(100);
    }
  });
});
