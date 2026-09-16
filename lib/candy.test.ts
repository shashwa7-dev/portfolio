// lib/candy.test.ts
import { describe, it, expect } from "vitest";
import { TILT_CLASSES, TINT_CLASSES, tilt, tiltMd, tint } from "./candy";

describe("tilt", () => {
  it("has nine fixed slots", () => {
    expect(TILT_CLASSES).toEqual([
      "tilt-a", "tilt-b", "tilt-c", "tilt-d", "tilt-e", "tilt-f", "tilt-g", "tilt-h", "tilt-i",
    ]);
  });
  it("is deterministic and wraps", () => {
    expect(tilt(0)).toBe("tilt-a");
    expect(tilt(8)).toBe("tilt-i");
    expect(tilt(9)).toBe("tilt-a");
    expect(tilt(0)).toBe(tilt(0));
  });
  it("has a 640px-and-up variant with the same slots", () => {
    expect(tiltMd(1)).toBe("tilt-md-b");
    expect(tiltMd(10)).toBe("tilt-md-b");
  });
});

describe("tint", () => {
  it("cycles the five candy tints as full class strings", () => {
    expect(TINT_CLASSES).toEqual([
      "candy:bg-candy-pink",
      "candy:bg-candy-mint",
      "candy:bg-candy-butter",
      "candy:bg-candy-sky",
      "candy:bg-candy-lavender",
    ]);
    expect(tint(0)).toBe("candy:bg-candy-pink");
    expect(tint(5)).toBe("candy:bg-candy-pink");
    expect(tint(7)).toBe("candy:bg-candy-butter");
  });
});
