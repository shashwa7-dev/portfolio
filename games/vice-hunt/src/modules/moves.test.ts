import { describe, expect, it } from "vitest";
import { CREATURES } from "../creatures";
import { mulberry32 } from "../rng";
import { createWorld, spawn } from "../world";
import { MOVES } from "./index";
import { BEAM_QUIET, beamOn, hoverTilt } from "./moves";

function make(kind: Parameters<typeof spawn>[2]) {
  const rng = mulberry32(3);
  const world = createWorld(1000, 500, rng);
  return { world, a: spawn(world, rng, kind) };
}

describe("moves", () => {
  it("float: y offset is 0 at t=0 and 0.018*height a quarter period in", () => {
    const { world, a } = make("cow");
    a.age = 0;
    expect(MOVES.float.y(a, world)).toBeCloseTo(0, 9);
    a.age = Math.PI / (2 * 2.4);
    expect(MOVES.float.y(a, world)).toBeCloseTo(0.018 * a.h, 9);
  });

  it("hover: tilt amplitude grows by 1.5 degrees per hit", () => {
    const { a } = make("ufo");
    const peak = (hits: number) => {
      a.hits = hits;
      let m = 0;
      for (let t = 0; t < 3; t += 0.001) {
        a.age = t;
        m = Math.max(m, Math.abs(hoverTilt(a)));
      }
      return m;
    };
    const deg = (r: number) => (r * 180) / Math.PI;
    expect(deg(peak(0))).toBeCloseTo(5, 1);
    expect(deg(peak(1)) - deg(peak(0))).toBeCloseTo(1.5, 1);
    expect(deg(peak(3)) - deg(peak(2))).toBeCloseTo(1.5, 1);
  });

  it("surface reads the merman's surface state", () => {
    const { world, a } = make("merman");
    expect(MOVES.surface.y(a, world)).toBeGreaterThan(0); // starts under
  });

  it("hop and glide keep the old prey bob", () => {
    const r = make("rabbit");
    r.a.age = 0.3;
    expect(MOVES.hop.y(r.a, r.world)).toBeCloseTo(-Math.abs(Math.sin(2.1)) * 14, 9);
    const f = make("flamingo");
    f.a.age = 0.5;
    expect(MOVES.glide.y(f.a, f.world)).toBeCloseTo(Math.sin(1.1) * 10, 9);
  });

  it("every creature's frame is 0 or 1", () => {
    const { a } = make("tiger");
    expect([0, 1]).toContain(MOVES[CREATURES.tiger.move].frame(a));
  });

  it("ufo beam: on now and then, off for 2.5 s after any hit", () => {
    const { a } = make("ufo");
    a.lastHitAt = -Infinity;
    a.age = 0;
    const seen = new Set<boolean>();
    for (let t = 0; t < 12; t += 0.1) {
      a.age = t;
      seen.add(beamOn(a, t));
    }
    expect(seen).toEqual(new Set([true, false]));
    // find an instant the beam would be on, then hit just before it
    a.age = 0;
    let t0 = 0;
    while (!beamOn(a, t0)) a.age = t0 += 0.1;
    a.lastHitAt = t0 - 0.1;
    expect(beamOn(a, t0)).toBe(false);
    expect(beamOn(a, a.lastHitAt + BEAM_QUIET - 0.01)).toBe(false);
  });

  it("iguana dash pauses and resumes, moving only while not paused", () => {
    const { a } = make("iguana");
    const rng = mulberry32(1);
    let pauses = 0;
    let wasPaused = false;
    let resumed = false;
    for (let i = 0; i < 300; i++) {
      const x0 = a.x;
      const moves = MOVES.dash.advance!(a, 1 / 60, rng);
      if (moves) a.x += a.vx / 60;
      expect(a.x !== x0).toBe(moves);
      if (!moves && !wasPaused) pauses++;
      if (moves && wasPaused) resumed = true;
      wasPaused = !moves;
    }
    expect(pauses).toBeGreaterThanOrEqual(1);
    expect(resumed).toBe(true);
  });
});
