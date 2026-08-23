import { describe, it, expect } from "vitest";
import { hashStr, hashWith, mulberry32, weighted, serialFrom } from "./seed";

describe("hashStr", () => {
  it("is stable for the same input", () => {
    expect(hashStr("shashwa7")).toBe(hashStr("shashwa7"));
  });

  it("returns an unsigned 32 bit integer", () => {
    const h = hashStr("shashwa7");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it("separates inputs that differ by one character", () => {
    expect(hashStr("visitor-a")).not.toBe(hashStr("visitor-b"));
  });

  it("handles the empty string without throwing", () => {
    expect(() => hashStr("")).not.toThrow();
  });
});

describe("hashWith", () => {
  it("gives independent streams from one input", () => {
    expect(hashWith("abc", "face")).not.toBe(hashWith("abc", "issue"));
  });

  it("is stable per salt", () => {
    expect(hashWith("abc", "face")).toBe(hashWith("abc", "face"));
  });
});

describe("mulberry32", () => {
  it("replays the same sequence from the same seed", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("stays inside [0, 1)", () => {
    const R = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const v = R();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("weighted", () => {
  it("respects the weights within tolerance", () => {
    const R = mulberry32(7);
    const counts: Record<string, number> = { a: 0, b: 0 };
    for (let i = 0; i < 20000; i++) {
      counts[weighted(R, [["a", 3], ["b", 1]] as [string, number][])]++;
    }
    expect(counts.a / 20000).toBeGreaterThan(0.73);
    expect(counts.a / 20000).toBeLessThan(0.77);
  });

  it("never returns an item with zero weight", () => {
    const R = mulberry32(3);
    for (let i = 0; i < 500; i++) {
      expect(weighted(R, [["keep", 1], ["never", 0]] as [string, number][])).toBe("keep");
    }
  });
});

describe("serialFrom", () => {
  it("matches the A-XXXX-XX shape", () => {
    expect(serialFrom("some-uuid-here")).toMatch(/^A-[0-9A-F]{4}-[0-9A-F]{2}$/);
  });

  it("is stable for the same id", () => {
    expect(serialFrom("abc")).toBe(serialFrom("abc"));
  });
});

/**
 * Golden-value tests. These are frozen on purpose.
 *
 * If one of these fails, the correct response is almost always to revert the
 * change to seed.ts, not to update the expected value. Changing these values
 * silently invalidates every card already in the wild.
 */
describe("golden values", () => {
  it("hashStr produces stable output for shashwa7", () => {
    expect(hashStr("shashwa7")).toBe(3578769521);
  });

  it("hashWith produces stable output for shashwa7 with face salt", () => {
    expect(hashWith("shashwa7", "face")).toBe(3417900067);
  });

  it("mulberry32 produces stable sequences", () => {
    const R = mulberry32(12345);
    expect(R()).toBe(0.9797282677609473);
    expect(R()).toBe(0.3067522644996643);
    expect(R()).toBe(0.484205421525985);
  });

  it("serialFrom produces stable output for a uuid", () => {
    expect(serialFrom("11111111-2222-3333-4444-555555555555")).toBe("A-B755-D3");
  });
});
