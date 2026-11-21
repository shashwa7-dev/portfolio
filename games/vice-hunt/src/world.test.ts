import { describe, expect, it } from "vitest";
import { ANIMALS, MAX_ALIVE, MAX_DT } from "./config";
import { mulberry32 } from "./rng";
import { createWorld, resize, shoot, spawn, step } from "./world";
import type { Kind } from "./types";

const DT = 1 / 60;
const make = () => {
  const rng = mulberry32(1);
  return { rng, world: createWorld(1000, 400, rng) };
};

describe("world", () => {
  it("first animal spawns within 1.6 s", () => {
    const { rng, world } = make();
    for (let i = 0; i < Math.ceil(1.6 / DT) + 1; i++) step(world, DT, rng);
    expect(world.animals.length).toBeGreaterThan(0);
  });

  it("never more than 6 alive over 120 s", () => {
    const { rng, world } = make();
    for (let i = 0; i < 120 * 60; i++) {
      step(world, DT, rng);
      expect(world.animals.length).toBeLessThanOrEqual(MAX_ALIVE);
    }
  });

  it("no bigfoot before 8 s; never two alive at once", () => {
    let seen = false;
    for (let seed = 1; seed <= 5; seed++) {
      const rng = mulberry32(seed);
      const world = createWorld(1000, 400, rng);
      for (let i = 0; i < 600 * 60; i++) {
        step(world, DT, rng);
        const bigs = world.animals.filter((a) => a.kind === "bigfoot").length;
        if (world.time < 8) expect(bigs).toBe(0);
        expect(bigs).toBeLessThanOrEqual(1);
        if (bigs) seen = true;
      }
    }
    expect(seen).toBe(true);
  });

  it("hit counts per kind", () => {
    const { rng, world } = make();
    const seen: Record<Kind, Set<number>> = { rabbit: new Set(), iguana: new Set(), flamingo: new Set(), bigfoot: new Set() };
    for (let i = 0; i < 2000; i++) {
      for (const k of Object.keys(seen) as Kind[]) {
        seen[k].add(spawn(world, rng, k).maxHp);
      }
      world.animals = [];
    }
    expect([...seen.rabbit]).toEqual([1]);
    expect([...seen.iguana]).toEqual([1]);
    expect([...seen.flamingo]).toEqual([1]);
    expect([...seen.bigfoot]).toEqual([3]);
  });

  it("speed ranges match the spec", () => {
    expect(ANIMALS.rabbit.speed).toEqual([0.33, 0.45]);
    expect(ANIMALS.iguana.speed).toEqual([0.15, 0.36]);
    expect(ANIMALS.flamingo.speed).toEqual([0.12, 0.18]);
    expect(ANIMALS.bigfoot.speed).toEqual([0.05, 0.075]);
  });

  it("speeds stay within the configured ranges", () => {
    const { rng, world } = make();
    for (let i = 0; i < 500; i++) {
      for (const k of Object.keys(ANIMALS) as Kind[]) {
        const a = spawn(world, rng, k);
        const s = Math.abs(a.vx) / world.width;
        expect(s).toBeGreaterThanOrEqual(ANIMALS[k].speed[0]);
        expect(s).toBeLessThanOrEqual(ANIMALS[k].speed[1]);
      }
      world.animals = [];
    }
  });

  it("spawns on the right lanes", () => {
    const { rng, world } = make();
    for (let i = 0; i < 200; i++) {
      const f = spawn(world, rng, "flamingo");
      expect(f.y).toBeGreaterThanOrEqual(0.12 * 400 - 10);
      expect(f.y).toBeLessThanOrEqual(0.3 * 400 + 10);
      const g = spawn(world, rng, "bigfoot");
      expect(g.y + g.h).toBeCloseTo(0.94 * 400);
    }
  });

  it("shoot misses empty space", () => {
    const { world } = make();
    expect(shoot(world, 500, 200)).toEqual({ hit: null, killed: false });
  });

  it("one shot kills a rabbit, an iguana or a flamingo", () => {
    for (const k of ["rabbit", "iguana", "flamingo"] as Kind[]) {
      const { rng, world } = make();
      const a = spawn(world, rng, k);
      a.x = 400;
      expect(shoot(world, a.x + a.w / 2, a.y + a.h / 2)).toEqual({ hit: a, killed: true });
      expect(world.kills[k]).toBe(1);
    }
  });

  it("shooting a bigfoot three times kills it once", () => {
    const { rng, world } = make();
    const a = spawn(world, rng, "bigfoot");
    a.x = 400;
    const cx = () => a.x + a.w / 2;
    const cy = a.y + a.h / 2;
    expect(shoot(world, cx(), cy).killed).toBe(false);
    expect(shoot(world, cx(), cy).killed).toBe(false);
    expect(shoot(world, cx(), cy).killed).toBe(true);
    expect(world.kills.bigfoot).toBe(1);
    expect(world.animals).not.toContain(a);
  });

  it("streak counts kills within 1.5 s of the previous one", () => {
    const { rng, world } = make();
    world.nextSpawn = Infinity;
    const killOne = () => {
      const a = spawn(world, rng, "rabbit");
      a.x = 400;
      expect(shoot(world, a.x + a.w / 2, a.y + a.h / 2).killed).toBe(true);
      return world.streak;
    };
    expect(world.streak).toBe(0);
    expect(killOne()).toBe(1);
    world.time += 1.5;
    expect(killOne()).toBe(2);
    world.time += 1.0;
    expect(killOne()).toBe(3);
    world.time += 1.51;
    expect(killOne()).toBe(1);
    // A non-lethal hit or a miss leaves the streak alone.
    const b = spawn(world, rng, "bigfoot");
    b.x = 400;
    shoot(world, b.x + b.w / 2, b.y + b.h / 2);
    shoot(world, 5, 5);
    expect(world.streak).toBe(1);
  });

  it("hit boxes are inset and the later animal wins", () => {
    const { rng, world } = make();
    const a = spawn(world, rng, "bigfoot");
    const b = spawn(world, rng, "bigfoot");
    a.x = b.x = 400;
    a.y = b.y = 100;
    expect(shoot(world, 400 + 1, 100 + 1).hit).toBeNull();
    expect(shoot(world, 400 + a.w / 2, 100 + a.h / 2).hit).toBe(b);
  });

  it("a non-lethal hit flashes and knocks back", () => {
    const { rng, world } = make();
    const a = spawn(world, rng, "bigfoot");
    a.x = 400;
    const dir = Math.sign(a.vx);
    const { hit, killed } = shoot(world, a.x + a.w / 2, a.y + a.h / 2);
    expect(hit).toBe(a);
    expect(killed).toBe(false);
    expect(a.flash).toBe(0.12);
    expect(a.hp).toBe(2);
    expect(a.x).toBe(400 - 6 * dir);
  });

  it("animals leave and are removed", () => {
    const { rng, world } = make();
    const a = spawn(world, rng, "rabbit");
    a.x = a.vx > 0 ? world.width + 1 : -a.w - 1;
    world.nextSpawn = Infinity;
    step(world, DT, rng);
    expect(world.animals).not.toContain(a);
  });

  it("step clamps dt to 0.05", () => {
    const { rng, world } = make();
    const a = spawn(world, rng, "bigfoot");
    a.x = 400;
    world.nextSpawn = Infinity;
    step(world, 5, rng);
    expect(Math.abs(a.x - 400)).toBeLessThanOrEqual(MAX_DT * Math.abs(a.vx) + 1e-9);
    expect(world.time).toBeCloseTo(MAX_DT);
  });

  it("resize keeps animals on their lanes", () => {
    const { rng, world } = make();
    const g = spawn(world, rng, "bigfoot");
    const f = spawn(world, rng, "flamingo");
    const fFrac = f.y / 400;
    g.x = 500;
    resize(world, 500, 800);
    expect(g.x).toBeCloseTo(250);
    expect(g.y + g.h).toBeCloseTo(0.94 * 800);
    expect(f.y / 800).toBeCloseTo(fFrac);
    expect(world.width).toBe(500);
    expect(world.height).toBe(800);
  });

  it("iguana pauses", () => {
    const { rng, world } = make();
    const a = spawn(world, rng, "iguana");
    a.x = 400;
    a.vx = Math.abs(a.vx) * 0.001; // stay on screen for the whole run
    world.nextSpawn = Infinity;
    let paused = false;
    for (let i = 0; i < 600; i++) {
      const before = a.x;
      step(world, DT, rng);
      if (a.pause > 0) {
        paused = true;
        expect(a.x).toBe(before);
      }
    }
    expect(paused).toBe(true);
  });
});
