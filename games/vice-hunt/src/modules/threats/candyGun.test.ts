import { describe, expect, it } from "vitest";
import type { GameEvent } from "../../events";
import type { Candy } from "../../fx/glass";
import { mulberry32 } from "../../rng";
import { type Animal, createWorld, drain, resize, shoot, spawn, type World } from "../../world";
import { stepThreats } from "../index";
import { CANDY_FLIGHT, type CandyGunState, shotTimeline } from "./candyGun";

const DT = 1 / 60;

function setup(hp = 6) {
  const rng = mulberry32(9);
  const world = createWorld(1280, 720, rng);
  world.nextSpawn = Infinity;
  const a = spawn(world, rng, "gator");
  a.hp = hp;
  a.vx = 0;
  a.x = 500;
  return { rng, world, a };
}
const hit = (world: World, a: Animal, rng: () => number) => shoot(world, a.x + a.w / 2, a.y + a.h / 2, rng);
const run = (world: World, rng: () => number, seconds: number, events: GameEvent[] = []) => {
  for (let i = 0; i < Math.round(seconds / DT); i++) {
    stepThreats(world, DT, rng);
    events.push(...drain(world));
  }
  return events;
};
const words = (events: GameEvent[]) => events.flatMap((e) => (e.type === "callout" ? [e.text] : []));
const candies = (world: World) => world.glass.marks.filter((m): m is Candy => m.kind === "candy");

describe("candy gun", () => {
  it("answers each hit with one spray, shouting its lines in order", () => {
    const { rng, world, a } = setup();
    hit(world, a, rng);
    const events = run(world, rng, 0.1);
    hit(world, a, rng); // lands while he is shooting: queues a second spray
    run(world, rng, 6, events);
    expect(words(events).filter((w) => w === "FWUMP!")).toHaveLength(2);
    expect(words(events).filter((w) => w !== "FWUMP!")).toEqual(["YO!?", "BACK OFF!"]);
  });

  it("sprays round(10 + 10 x anger): 12 after the first of six hits, 20 furious", () => {
    const calm = setup();
    hit(calm.world, calm.a, calm.rng);
    run(calm.world, calm.rng, 2);
    expect(candies(calm.world)).toHaveLength(12); // anger 1/5 already
    const mad = setup(6);
    mad.a.hits = 4;
    hit(mad.world, mad.a, mad.rng); // the fifth of six: anger 1
    run(mad.world, mad.rng, 2);
    expect(candies(mad.world)).toHaveLength(20);
  });

  it("stands still with the gun up while shooting, then lowers it", () => {
    const { rng, world, a } = setup();
    hit(world, a, rng);
    const tl = shotTimeline(0.2);
    run(world, rng, (tl.aim + tl.fire) / 2);
    expect(a.shootK).toBeGreaterThan(0);
    expect(a.aim).toBeGreaterThan(0.9);
    run(world, rng, tl.end);
    expect(a.shootK).toBeUndefined();
    expect(a.aim ?? 0).toBe(0);
  });

  it("costs half a heart per spray, never more than 1.5 from one gator", () => {
    const { rng, world, a } = setup(6);
    hit(world, a, rng);
    run(world, rng, 3);
    expect(world.hearts).toBe(2.5);
    for (let i = 0; i < 3; i++) {
      world.glass.marks = []; // clear the candies so the next hit lands on him
      hit(world, a, rng);
      run(world, rng, 3);
    }
    expect(world.hearts).toBe(1.5);
  });

  it("no new spray once he is finished; candies in flight still land, then it is done", () => {
    const { rng, world, a } = setup(5);
    a.hits = 3;
    hit(world, a, rng); // 4 of 5: he starts a spray
    run(world, rng, shotTimeline(1).fire + CANDY_FLIGHT * 0.3);
    expect(world.threats[0]).toBeDefined();
    const flying = (world.threats[0].state as CandyGunState).flights.length;
    expect(flying).toBeGreaterThan(0);
    expect(hit(world, a, rng).finished).toBe(true);
    const events = run(world, rng, 3);
    expect(words(events)).not.toContain("FWUMP!");
    expect(candies(world).length).toBe(20);
    expect(world.threats).toHaveLength(0);
  });

  it("gentle: the candies land at once, no flight", () => {
    const { rng, world, a } = setup();
    hit(world, a, rng);
    for (let t = 0; t < shotTimeline(0.2).fire + 2 * DT; t += DT) stepThreats(world, DT, rng, true);
    expect(candies(world).length).toBe(12);
    expect(candies(world).every((c) => c.gentle)).toBe(true);
    expect((world.threats[0].state as CandyGunState).flights).toHaveLength(0);
  });

  it("candies in flight land on screen after the window shrinks", () => {
    const { rng, world, a } = setup();
    hit(world, a, rng);
    run(world, rng, shotTimeline(0.2).fire + 0.02);
    resize(world, 400, 300);
    run(world, rng, 2);
    for (const c of candies(world)) {
      expect(c.x).toBeLessThanOrEqual(400);
      expect(c.y).toBeLessThanOrEqual(300);
    }
  });
});
