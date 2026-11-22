import { describe, expect, it } from "vitest";
import { starsFor } from "./stars";

describe("starsFor", () => {
  it("is empty before the first half second", () => {
    expect(starsFor(0, 2.5)).toBe(0);
    expect(starsFor(0.49, 2.5)).toBe(0);
  });

  it("lights one star per fifth of the time", () => {
    expect(starsFor(0.5, 2.5)).toBe(1);
    expect(starsFor(1.6, 2.5)).toBe(3);
  });

  it("fills at the full time and never goes past five", () => {
    expect(starsFor(2.5, 2.5)).toBe(5);
    expect(starsFor(9, 2.5)).toBe(5);
  });
});
