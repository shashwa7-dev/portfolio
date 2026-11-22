import { describe, expect, it } from "vitest";
import { BEACH_WATER_LINE, artY, beachSeaLine } from "./sea";

const SAND_TOP = 0.694; // the sand's highest point in land.webp
const SEA_TOP = 0.52; // where the sea layer's mask lets the water show

describe("beachSeaLine", () => {
  it("is in open water at every window shape", () => {
    for (const [w, h] of [
      [1280, 800],
      [1440, 900],
      [1920, 1080],
      [1920, 900],
      [2560, 1080],
      [3440, 1440],
      [1024, 768],
    ]) {
      const y = beachSeaLine(w, h);
      expect(y, `${w}x${h}`).toBeLessThan(artY(SAND_TOP, w, h));
      expect(y, `${w}x${h}`).toBeGreaterThan(artY(SEA_TOP, w, h));
    }
  });

  it("rises on a wide window, where a fixed 0.69 would be on the sand", () => {
    const [w, h] = [1920, 900];
    expect(artY(SAND_TOP, w, h)).toBeLessThan(0.69 * h);
    expect(beachSeaLine(w, h)).toBeLessThan(beachSeaLine(1440, 900) * (900 / 900));
  });

  it("maps the art's bottom to the layer's bottom edge", () => {
    expect(artY(1, 1000, 500)).toBeCloseTo(510);
    expect(BEACH_WATER_LINE).toBeLessThan(SAND_TOP);
  });
});
