import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng";
import { createWorld, spawn } from "../world";
import { MOVES } from "./index";
import { SKATE_SPEED, ostrichParts, skatePose } from "./ostrich";

const DT = 1 / 60;
const travel = (hits: number) => {
  const rng = mulberry32(5);
  const world = createWorld(1000, 500, rng);
  const a = spawn(world, rng, "ostrich");
  a.hits = hits;
  let x = 0;
  for (let i = 0; i < 120; i++) MOVES.skate.advance?.(a, DT, rng); // ease up to speed
  const before = a.x;
  MOVES.skate.advance?.(a, DT, rng);
  x = a.x - before + a.vx * DT; // advance adds the extra; the world adds vx * dt
  return x / (a.vx * DT);
};

describe("roller ostrich", () => {
  it("skates faster with every hit: x1, x1.7, x2.6", () => {
    expect(SKATE_SPEED).toEqual([1, 1.7, 2.6]);
    expect(travel(0)).toBeCloseTo(1, 3);
    expect(travel(1)).toBeCloseTo(1.7, 2);
    expect(travel(2)).toBeCloseTo(2.6, 2);
  });

  it("loses the tail on hit 1, then the wing and the neck fluff on hit 2", () => {
    expect(ostrichParts(0)).toEqual({ tail: true, wing: true, collar: true });
    expect(ostrichParts(1)).toEqual({ tail: false, wing: true, collar: true });
    expect(ostrichParts(2)).toEqual({ tail: false, wing: false, collar: false });
  });

  it("pushes off one leg at a time, wider and leaning further when fast", () => {
    for (let ph = 0; ph < Math.PI * 2; ph += 0.1) {
      const p = skatePose(ph, 1);
      expect(Math.min(p.lN, p.lF)).toBe(0); // one leg on the ground
      expect(Math.max(p.lN, p.lF)).toBeLessThanOrEqual(26);
      expect(p.bob).toBeLessThanOrEqual(0);
    }
    expect(skatePose(Math.PI / 2, 2.6).lN).toBeGreaterThan(skatePose(Math.PI / 2, 1).lN);
    expect(skatePose(0, 2.6).tilt).toBeGreaterThan(skatePose(0, 1).tilt);
  });
});
