import { describe, it, expect } from "vitest";
import { LADDOO_IMAGE, LADDOO_SPOTS, laddooImageBox, spotBox } from "./laddoos";

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
  it("laddooImageBox puts the image's ball on the given circle", () => {
    const b = laddooImageBox(100, 200, 73);
    const k = b.width / LADDOO_IMAGE.width;
    expect(b.left + LADDOO_IMAGE.cx * k).toBeCloseTo(100);
    expect(b.top + LADDOO_IMAGE.cy * k).toBeCloseTo(200);
    expect(2 * LADDOO_IMAGE.r * k).toBeCloseTo(73);
    expect(b.height / b.width).toBeCloseTo(LADDOO_IMAGE.height / LADDOO_IMAGE.width);
  });
});
