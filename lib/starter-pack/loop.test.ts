import { describe, expect, it } from "vitest";
import { advance, MAX_STEPS } from "./loop";

describe("fixed-step loop", () => {
  it("clamps catch-up steps after a long pause", () => {
    expect(advance(0, 60000).steps).toBe(MAX_STEPS);
    expect(MAX_STEPS).toBe(6);
  });

  it("runs one step per 1/120 s frame", () => {
    expect(advance(0, 1000 / 120).steps).toBe(1);
  });
});
