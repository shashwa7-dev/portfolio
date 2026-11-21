import { describe, expect, it } from "vitest";
import { CREATURES } from "../creatures";
import { mulberry32 } from "../rng";
import { createWorld, spawn } from "../world";
import { MOVES } from "./index";
import { hoverTilt } from "./moves";

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
});
