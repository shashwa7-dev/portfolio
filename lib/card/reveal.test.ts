import { describe, it, expect } from "vitest";
import { prefersReducedMotion } from "./reveal";

describe("prefersReducedMotion", () => {
  it("returns true when matchMedia reports the preference", () => {
    const win = {
      matchMedia: (query: string) => ({ matches: query.includes("reduce") }),
    } as unknown as Window;
    expect(prefersReducedMotion(win)).toBe(true);
  });

  it("returns false when matchMedia reports no preference", () => {
    const win = {
      matchMedia: () => ({ matches: false }),
    } as unknown as Window;
    expect(prefersReducedMotion(win)).toBe(false);
  });

  it("returns false, not a throw, when matchMedia is entirely absent", () => {
    const win = {} as unknown as Window;
    expect(() => prefersReducedMotion(win)).not.toThrow();
    expect(prefersReducedMotion(win)).toBe(false);
  });

  it("returns false when window itself is undefined", () => {
    expect(prefersReducedMotion(undefined)).toBe(false);
  });
});
