import { describe, expect, it } from "vitest";
import { MAX_ALIVE, MAX_DT, SEA_LINE, SPOTTED_PER_MINUTE } from "./config";
import { CREATURES, KINDS, isRare, pointsFor } from "./creatures";
import type { GameEvent } from "./events";
import { mulberry32 } from "./rng";
import { type Animal, type World, createWorld, damage, drain, rareRate, resize, shoot as shootWith, spawn, step } from "./world";
import type { Kind } from "./types";

const DT = 1 / 60;
const shoot = (world: World, x: number, y: number) => shootWith(world, x, y, mulberry32(7));
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

  it("never more than 6 commons alive over 120 s (rares come on top)", () => {
    const { rng, world } = make();
    for (let i = 0; i < 120 * 60; i++) {
      step(world, DT, rng);
      expect(world.animals.filter((a) => !isRare(a.kind)).length).toBeLessThanOrEqual(MAX_ALIVE);
      expect(world.animals.length).toBeLessThanOrEqual(MAX_ALIVE + 2);
    }
  });

  it("no bigfoot before 30 s; never two alive at once", () => {
    for (let seed = 1; seed <= 5; seed++) {
      const rng = mulberry32(seed);
      const world = createWorld(1000, 400, rng);
      for (let i = 0; i < 600 * 60; i++) {
        step(world, DT, rng);
        const bigs = world.animals.filter((a) => a.kind === "bigfoot").length;
        if (world.time < 30) expect(bigs).toBe(0);
        expect(bigs).toBeLessThanOrEqual(1);
      }
    }
  });

  it("hit counts per kind", () => {
    const { rng, world } = make();
    const seen = Object.fromEntries(KINDS.map((k) => [k, new Set<number>()])) as Record<Kind, Set<number>>;
    for (let i = 0; i < 2000; i++) {
      for (const k of Object.keys(seen) as Kind[]) {
        seen[k].add(spawn(world, rng, k).hp);
      }
      world.animals = [];
    }
    expect([...seen.rabbit]).toEqual([1]);
    expect([...seen.iguana]).toEqual([1]);
    expect([...seen.flamingo]).toEqual([1]);
    expect([...seen.bigfoot]).toEqual([20]);
  });

  it("speed ranges match the spec", () => {
    expect(CREATURES.rabbit.speed).toEqual([0.33, 0.45]);
    expect(CREATURES.iguana.speed).toEqual([0.15, 0.36]);
    expect(CREATURES.flamingo.speed).toEqual([0.12, 0.18]);
    expect(CREATURES.bigfoot.speed).toEqual([0.05, 0.075]);
  });

  it("speeds stay within the configured ranges", () => {
    const { rng, world } = make();
    for (let i = 0; i < 500; i++) {
      for (const k of KINDS) {
        const a = spawn(world, rng, k);
        const s = Math.abs(a.vx) / world.width;
        expect(s).toBeGreaterThanOrEqual(CREATURES[k].speed[0]);
        expect(s).toBeLessThanOrEqual(CREATURES[k].speed[1]);
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
    expect(shoot(world, 500, 200)).toEqual({ hit: null, finished: false });
  });

  it("one shot kills a rabbit, an iguana or a flamingo", () => {
    for (const k of ["rabbit", "iguana", "flamingo"] as Kind[]) {
      const { rng, world } = make();
      const a = spawn(world, rng, k);
      a.x = 400;
      expect(shoot(world, a.x + a.w / 2, a.y + a.h / 2)).toEqual({ hit: a, finished: true });
      expect(world.kills[k]).toBe(1);
    }
  });

  it("shooting a bigfoot twenty times kills it once", () => {
    const { rng, world } = make();
    const a = spawn(world, rng, "bigfoot");
    a.x = 400;
    const cx = () => a.x + a.w / 2;
    const cy = a.y + a.h / 2;
    for (let i = 0; i < 19; i++) expect(shoot(world, cx(), cy).finished).toBe(false);
    expect(shoot(world, cx(), cy).finished).toBe(true);
    expect(world.kills.bigfoot).toBe(1);
    expect(world.animals).not.toContain(a);
  });

  it("streak counts kills within 1.5 s of the previous one", () => {
    const { rng, world } = make();
    world.nextSpawn = Infinity;
    const killOne = () => {
      const a = spawn(world, rng, "rabbit");
      a.x = 400;
      expect(shoot(world, a.x + a.w / 2, a.y + a.h / 2).finished).toBe(true);
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
    const { hit, finished } = shoot(world, a.x + a.w / 2, a.y + a.h / 2);
    expect(hit).toBe(a);
    expect(finished).toBe(false);
    expect(a.flash).toBe(0.12);
    expect(a.hits).toBe(1);
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

// Shoots an animal's centre (or `fy` of the way down its box).
const hitAt = (world: World, a: Animal, fy = 0.5) => shoot(world, a.x + a.w / 2, a.y + a.h * fy);
const ofType = <T extends GameEvent["type"]>(events: GameEvent[], type: T) =>
  events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);
const quiet = () => {
  const { rng, world } = make();
  world.nextSpawn = Infinity;
  return { rng, world };
};
// A merman fully up out of the water.
const surfaced = (world: World, a: Animal) => {
  a.surface = { phase: "up", t: 0, cycle: 0, from: 0 };
  a.y = world.sea - a.h * 0.78;
};
const run = (world: World, rng: () => number, seconds: number) => {
  for (let i = 0; i < Math.round(seconds / DT); i++) step(world, DT, rng);
};

describe("world rules", () => {
  it("cow two hits emit two penalty events of -500 and no kill event", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "cow");
    a.x = 400;
    expect(hitAt(world, a).finished).toBe(false);
    expect(hitAt(world, a).finished).toBe(true);
    const events = drain(world);
    expect(ofType(events, "penalty").map((e) => e.points)).toEqual([-500, -500]);
    expect(ofType(events, "kill")).toEqual([]);
    expect(world.kills.cow).toBe(0);
  });

  it("a cow hit resets the streak", () => {
    const { rng, world } = quiet();
    const killRabbit = () => {
      const r = spawn(world, rng, "rabbit");
      r.x = 100;
      expect(hitAt(world, r).finished).toBe(true);
    };
    killRabbit();
    world.time += 1;
    killRabbit();
    expect(world.streak).toBe(2);
    const cow = spawn(world, rng, "cow");
    cow.x = 600;
    hitAt(world, cow);
    expect(world.streak).toBe(0);
    expect(world.lastKill).toBe(-Infinity);
    world.time += 0.5;
    killRabbit();
    expect(world.streak).toBe(1);
    expect(ofType(drain(world), "kill").map((e) => e.streak)).toEqual([1, 2, 1]);
  });

  it("tiger: hits 1 and 2 emit hit events n=1,of=3 and n=2,of=3; hit 3 emits penalty -250 and no kill", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "tiger");
    a.x = 400;
    hitAt(world, a);
    hitAt(world, a);
    let events = drain(world);
    expect(ofType(events, "hit").map(({ n, of }) => ({ n, of }))).toEqual([
      { n: 1, of: 3 },
      { n: 2, of: 3 },
    ]);
    expect(ofType(events, "penalty")).toEqual([]);
    expect(hitAt(world, a).finished).toBe(true);
    events = drain(world);
    expect(ofType(events, "penalty").map((e) => e.points)).toEqual([-250]);
    expect(ofType(events, "kill")).toEqual([]);
  });

  it('ufo spawned with rng giving 7 takes 7 hits; hit events have no "of"', () => {
    const { world } = quiet();
    const a = spawn(world, () => 0.99, "ufo");
    a.x = 400;
    for (let i = 0; i < 6; i++) expect(hitAt(world, a).finished).toBe(false);
    expect(hitAt(world, a).finished).toBe(true);
    const hits = ofType(drain(world), "hit");
    expect(hits.map((e) => e.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const e of hits) expect("of" in e).toBe(false);
  });

  it("merman: three hits within 1.1 s finish him (kill event, 600 base)", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "merman");
    surfaced(world, a);
    expect(hitAt(world, a, 0.2).finished).toBe(false);
    run(world, rng, 0.3);
    expect(hitAt(world, a, 0.2).finished).toBe(false);
    run(world, rng, 0.3);
    expect(hitAt(world, a, 0.2).finished).toBe(true);
    const kills = ofType(drain(world), "kill");
    expect(kills.map((e) => e.kind)).toEqual(["merman"]);
    expect(pointsFor("merman")).toBe(600);
  });

  it("merman: second hit after 1.2 s does not finish; an escaped event follows when the window lapses", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "merman");
    surfaced(world, a);
    hitAt(world, a, 0.2);
    expect(a.surface?.phase).toBe("duck");
    run(world, rng, 1.2);
    expect(hitAt(world, a, 0.2).finished).toBe(false);
    const events = drain(world);
    expect(ofType(events, "escaped").map((e) => e.kind)).toEqual(["merman"]);
    expect(a.hits).toBe(0);
  });

  it("a flamingo in front of the cow takes the shot", () => {
    const { rng, world } = quiet();
    const f = spawn(world, rng, "flamingo");
    const c = spawn(world, rng, "cow");
    f.x = c.x = 400;
    f.y = c.y = 60;
    expect(shoot(world, 450, 85).hit?.kind).toBe("flamingo");
  });

  it("a shot at the water over a ducking merman misses", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "merman");
    surfaced(world, a);
    hitAt(world, a, 0.2);
    drain(world);
    run(world, rng, 0.5);
    const y = SEA_LINE * world.height + 10;
    expect(y).toBeGreaterThan(a.y + a.h * 0.15);
    expect(y).toBeLessThan(a.y + a.h * 0.85);
    expect(shoot(world, a.x + a.w / 2, y)).toEqual({ hit: null, finished: false });
    expect(drain(world)).toEqual([]);
  });

  it("first hit on bigfoot sets provoked and emits rare met", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "bigfoot");
    a.x = 400;
    expect(ofType(drain(world), "rare")).toEqual([{ type: "rare", kind: "bigfoot", event: "appeared" }]);
    expect(a.provoked).toBe(false);
    hitAt(world, a);
    expect(a.provoked).toBe(true);
    expect(world.met.has("bigfoot")).toBe(true);
    hitAt(world, a);
    const events = drain(world);
    expect(ofType(events, "rare")).toEqual([{ type: "rare", kind: "bigfoot", event: "met" }]);
    expect(ofType(events, "callout").map((e) => e.text)).toEqual(["ANGRY!"]);
    expect(ofType(events, "hit").every((e) => !("of" in e))).toBe(true);
  });

  it("the gator shows its hit total, is provoked, and only Bigfoot shouts ANGRY!", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "gator");
    a.x = 400;
    drain(world);
    hitAt(world, a);
    expect(a.provoked).toBe(true);
    const events = drain(world);
    expect(ofType(events, "hit")).toMatchObject([{ kind: "gator", n: 1, of: a.hp }]);
    expect(ofType(events, "callout")).toEqual([]);
  });

  it("only a boss shares the screen with another rare", () => {
    const zero = () => 0;
    const world = createWorld(1000, 400, zero);
    world.nextSpawn = Infinity;
    world.time = 31;
    const g = spawn(world, zero, "gator");
    g.vx = 0; // stays on screen
    g.x = 400;
    for (let i = 0; i < 10 * 60; i++) {
      step(world, DT, zero);
      expect(world.animals.filter((a) => isRare(a.kind) && a.kind !== "bigfoot" && a.kind !== "gator")).toEqual([]);
    }
    expect(world.animals.some((a) => a.kind === "bigfoot")).toBe(true);
  });

  it("damage clamps at 0 and emits wasted once", () => {
    const { world } = quiet();
    expect(world.hearts).toBe(3);
    damage(world, 1.5, "tiger", 0, 0);
    expect(world.hearts).toBe(1.5);
    damage(world, 1.5, "tiger", 0, 0);
    expect(world.hearts).toBe(0);
    expect(world.wasted).toBe(true);
    damage(world, 1.5, "tiger", 0, 0);
    expect(world.hearts).toBe(0);
    const events = drain(world);
    expect(ofType(events, "damage").map((e) => e.hearts)).toEqual([1.5, 0]);
    expect(ofType(events, "wasted")).toHaveLength(1);
  });

  it("wasted freezes the world", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "rabbit");
    a.x = 400;
    damage(world, 3, "bigfoot", 0, 0);
    drain(world);
    const t = world.time;
    const x = a.x;
    step(world, DT, rng);
    expect(world.time).toBe(t);
    expect(a.x).toBe(x);
    expect(hitAt(world, a)).toEqual({ hit: null, finished: false });
    expect(drain(world)).toEqual([]);
  });

  it("rares respect one-at-a-time and bigfoot's 30 s floor", () => {
    const zero = () => 0;
    const world = createWorld(1000, 400, zero);
    world.nextSpawn = Infinity;
    spawn(world, zero, "shark");
    for (let i = 0; i < 29.9 * 60; i++) {
      step(world, DT, zero);
      expect(world.animals.some((a) => a.kind === "bigfoot")).toBe(false);
      const rares = world.animals.filter((a) => isRare(a.kind) && a.kind !== "bigfoot");
      expect(rares.length).toBeLessThanOrEqual(1);
      if (world.animals.some((a) => a.kind === "shark")) {
        expect(world.animals.some((a) => a.kind === "cow")).toBe(false);
      }
    }
    expect(ofType(drain(world), "rare").length).toBeGreaterThan(1); // others came once the shark left
    run(world, zero, 0.2);
    expect(world.animals.filter((a) => a.kind === "bigfoot")).toHaveLength(1);
    run(world, zero, 1);
    expect(world.animals.filter((a) => a.kind === "bigfoot")).toHaveLength(1);
  });

  it("resize keeps the merman on the sea line", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "merman");
    expect(a.x).toBeGreaterThanOrEqual(0.15 * 1000);
    expect(a.x).toBeLessThanOrEqual(0.7 * 1000);
    expect(a.vx).toBe(0);
    surfaced(world, a);
    resize(world, 500, 800);
    expect(a.y).toBeCloseTo(SEA_LINE * 800 - a.h * 0.78);
    run(world, rng, 0.1);
    expect(a.y).toBeCloseTo(SEA_LINE * 800 - a.h * 0.78);
  });

  it("the merman follows the host's water line, through a resize", () => {
    const rng = mulberry32(1);
    const world = createWorld(1000, 400, rng, 250);
    world.nextSpawn = Infinity;
    const a = spawn(world, rng, "merman");
    surfaced(world, a);
    expect(a.y).toBeCloseTo(250 - a.h * 0.78);
    expect(shoot(world, a.x + a.w / 2, 260).hit).toBeNull(); // under the water
    resize(world, 1200, 500, 300);
    expect(world.sea).toBe(300);
    expect(a.y).toBeCloseTo(300 - a.h * 0.78);
  });

  it("a disabled creature never spawns on its own", () => {
    expect(CREATURES.tiger.enabled).toBe(false);
    const rng = mulberry32(3);
    const world = createWorld(1000, 400, rng);
    const seen = new Set<Kind>();
    for (let i = 0; i < 60 * 60 * 20; i++) {
      step(world, DT, rng);
      for (const x of world.animals) seen.add(x.kind);
      world.animals = world.animals.filter((x) => !isRare(x.kind)); // let the next rare roll
    }
    expect(seen.has("tiger")).toBe(false);
    for (const k of KINDS) if (CREATURES[k].enabled) expect(seen.has(k), k).toBe(true);
  });

  it("an explicit spawn still makes a disabled creature (dev page, tests)", () => {
    const { rng, world } = make();
    expect(spawn(world, rng, "tiger").kind).toBe("tiger");
  });

  it("the merman surfaces, dives and leaves after three cycles", () => {
    const { rng, world } = quiet();
    const a = spawn(world, rng, "merman");
    expect(a.y).toBeGreaterThan(SEA_LINE * world.height); // starts under water
    run(world, rng, 1.2 + 0.55 + 0.1);
    expect(a.surface?.phase).toBe("up");
    expect(a.y).toBeCloseTo(SEA_LINE * world.height - a.h * 0.78);
    run(world, rng, 3 * 4.8);
    expect(world.animals).not.toContain(a);
  });
});

describe("spotted rares come back more often", () => {
  it("a rare not yet spotted keeps its own rate", () => {
    const world = createWorld(1000, 400, () => 0);
    expect(rareRate(world, "shark")).toBe(0.4);
  });

  it("a rare that has appeared comes back about once a minute", () => {
    const rng = mulberry32(1);
    const world = createWorld(1000, 400, rng);
    spawn(world, rng, "shark");
    expect(world.spotted.has("shark")).toBe(true);
    expect(rareRate(world, "shark")).toBe(SPOTTED_PER_MINUTE);
    expect(SPOTTED_PER_MINUTE).toBe(1);
  });

  it("a host can hand over the rares spotted in an earlier round", () => {
    const world = createWorld(1000, 400, () => 0, undefined, ["merman", "cow"]);
    expect(rareRate(world, "merman")).toBe(SPOTTED_PER_MINUTE);
    expect(rareRate(world, "cow")).toBe(SPOTTED_PER_MINUTE);
    expect(rareRate(world, "ufo")).toBe(1 / 3);
  });

  it("Bigfoot keeps his rate even once spotted", () => {
    const world = createWorld(1000, 400, () => 0, undefined, ["bigfoot"]);
    expect(rareRate(world, "bigfoot")).toBe(0.22);
  });
});
