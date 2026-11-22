import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng";
import { createWorld, spawn } from "../world";
import { HIT_REACTIONS } from "./index";
import { GARLAND_TIME, garlandScale } from "./reactions";

describe("hit reactions", () => {
  it("garland: scale is 0.2 at 0 and 1 at 0.45 s", () => {
    expect(GARLAND_TIME).toBe(0.45);
    expect(garlandScale(0)).toBeCloseTo(0.2, 9);
    expect(garlandScale(0.45)).toBeCloseTo(1, 9);
    expect(garlandScale(1)).toBeCloseTo(1, 9);
  });

  it("flinch: a 160 ms jolt of at most 4 px that settles to 0", () => {
    const rng = mulberry32(1);
    const a = spawn(createWorld(1000, 500, rng), rng, "tiger");
    const m = HIT_REACTIONS.flinch;
    const s = m.start(a);
    let peak = 0;
    for (let i = 0; i < 8; i++) {
      m.step(s, 0.02);
      peak = Math.max(peak, Math.abs(m.pose!(s).dx));
    }
    expect(peak).toBeLessThanOrEqual(4);
    expect(peak).toBeGreaterThan(3);
    m.step(s, 0.1);
    expect(m.pose!(s).dx).toBe(0);
  });
});
