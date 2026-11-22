import { describe, expect, it } from "vitest";
import { HEARTS } from "../../config";
import { stepGlass } from "../../fx/glass";
import { mulberry32 } from "../../rng";
import { RELEASE, THROW_TIME } from "../../rig/rig";
import { type Animal, createWorld, shoot, spawn, step, type World } from "../../world";
import { stepFinishing, stepThreats } from "../index";
import { GLOB_TIME } from "./glob";
import type { ThrowState } from "./throw";

const DT = 1 / 120;

function bigfootOnScreen(): { world: World; rng: () => number; a: Animal } {
  const rng = mulberry32(3);
  const world = createWorld(1000, 500, rng);
  const a = spawn(world, rng, "bigfoot");
  a.x = 450;
  a.vx = 0; // stands still for the test, wholly on screen
  return { world, rng, a };
}

function tick(world: World, rng: () => number): void {
  step(world, DT, rng);
  stepFinishing(world, DT, false, rng);
  stepThreats(world, DT, rng);
  stepGlass(world.glass, DT);
}

const throwState = (world: World) => world.threats.find((t) => t.id === "throw")?.state as ThrowState | undefined;
const hitHim = (world: World, a: Animal, rng: () => number) => shoot(world, a.x + a.w / 2, a.y + a.h / 2, rng);

describe("Bigfoot's throws", () => {
  it("an unprovoked bigfoot never throws", () => {
    const { world, rng } = bigfootOnScreen();
    for (let t = 0; t < 6; t += DT) tick(world, rng);
    expect(world.threats).toHaveLength(0);
    expect(world.glass.marks).toHaveLength(0);
  });

  it("throw cadence: provoked bigfoot throws at t≈0.5+0.34, then every 1.5 s", () => {
    const { world, rng, a } = bigfootOnScreen();
    hitHim(world, a, rng);
    const releases: number[] = [];
    let flying = 0;
    let t = 0;
    while (t < 5) {
      tick(world, rng);
      t += DT;
      const s = throwState(world);
      const n = s ? s.thrown : 0;
      if (n > flying) releases.push(t);
      flying = n;
    }
    const first = 0.5 + RELEASE * THROW_TIME;
    expect(releases.length).toBe(3); // 0.84, 2.34, 3.84
    expect(releases[0]).toBeCloseTo(first, 1);
    expect(releases[1] - releases[0]).toBeCloseTo(1.5, 1);
    expect(releases[2] - releases[1]).toBeCloseTo(1.5, 1);
  });

  it("each glob splats after its flight and costs half a heart", () => {
    const { world, rng, a } = bigfootOnScreen();
    hitHim(world, a, rng);
    for (let t = 0; t < 0.5 + RELEASE * THROW_TIME + GLOB_TIME + 0.05; t += DT) tick(world, rng);
    expect(world.glass.marks.filter((m) => m.kind === "splat")).toHaveLength(1);
    expect(world.hearts).toBe(HEARTS - 0.5);
    expect(world.events.some((e) => e.type === "callout" && e.text === "SPLAT!")).toBe(true);
  });

  it("does not throw while partly off screen", () => {
    const { world, rng, a } = bigfootOnScreen();
    hitHim(world, a, rng);
    a.x = -a.w / 2;
    for (let t = 0; t < 3; t += DT) tick(world, rng);
    expect(throwState(world)?.thrown).toBe(0);
  });

  it("damage from one bigfoot totals 1.5 even with 4 globs landing after he died", () => {
    const { world, rng, a } = bigfootOnScreen();
    hitHim(world, a, rng);
    for (let t = 0; t < 0.9; t += DT) tick(world, rng); // the first is in the air
    const s = throwState(world)!;
    expect(s.thrown).toBe(1);
    // Three more in flight at once (the cadence would space them out; the cap is what is under test).
    s.globs.push(...[0, 1, 2].map(() => ({ ...s.globs[0], age: 0 })));
    expect(s.globs).toHaveLength(4);
    // He dies before they land.
    for (let i = a.hits; i < a.hp; i++) hitHim(world, a, rng);
    expect(world.animals).toHaveLength(0);
    for (let t = 0; t < 4; t += DT) tick(world, rng);
    const dealt = world.events.filter((e) => e.type === "damage").length;
    expect(dealt).toBe(3);
    expect(world.hearts).toBe(HEARTS - 1.5);
    expect(world.glass.marks.filter((m) => m.kind === "splat").length).toBeGreaterThanOrEqual(4);
    expect(world.threats.find((t) => t.id === "throw")).toBeUndefined(); // done once they have all landed
  });

  it("drops globs in flight once wasted", () => {
    const { world, rng, a } = bigfootOnScreen();
    hitHim(world, a, rng);
    for (let t = 0; t < 0.9; t += DT) tick(world, rng);
    expect(throwState(world)?.globs).toHaveLength(1);
    world.hearts = 0;
    world.wasted = true;
    for (let t = 0; t < 1; t += DT) tick(world, rng);
    expect(world.glass.marks).toHaveLength(0);
  });
});
