import { describe, expect, it } from "vitest";
import { HEARTS } from "../../config";
import { SCRATCH_DRAW, SCRATCH_FADE_AT, SCRATCH_FADE_FOR, stepGlass } from "../../fx/glass";
import { mulberry32 } from "../../rng";
import { createWorld, shoot, spawn, type World } from "../../world";
import { stepFinishing, stepThreats } from "../index";
import { POUNCE_TIME } from "../finishes/pounces";
import { CLAW_TIME, GENTLE_CLAW_TIME, SCRATCH_AT, type ClawState } from "./clawSwipe";

const DT = 1 / 60;

// A tiger shot three times: its pounce is under way.
function poundedTiger(): { world: World; rng: () => number } {
  const rng = mulberry32(5);
  const world = createWorld(1000, 500, rng);
  const a = spawn(world, rng, "tiger");
  a.x = 400;
  for (let i = 0; i < 3; i++) shoot(world, a.x + a.w / 2, a.y + a.h / 2, rng);
  expect(world.finishing).toHaveLength(1);
  expect(world.finishing[0].id).toBe("pounces");
  return { world, rng };
}

function tick(world: World, rng: () => number, reduced = false): void {
  stepFinishing(world, DT, reduced, rng);
  stepThreats(world, DT, rng);
  stepGlass(world.glass, DT);
}

const damages = (world: World) => world.events.filter((e) => e.type === "damage");

describe("the tiger's pounce and claw", () => {
  it("pounce damages 1.5 exactly once, at the scratches", () => {
    const { world, rng } = poundedTiger();
    let t = 0;
    let threatAt = -1;
    let hitAt = -1;
    while (t < POUNCE_TIME + CLAW_TIME + 1) {
      tick(world, rng);
      t += DT;
      if (threatAt < 0 && world.threats.length) threatAt = t;
      if (hitAt < 0 && damages(world).length) {
        hitAt = t;
        expect(world.glass.marks.filter((m) => m.kind === "scratch")).toHaveLength(3); // with the scratches
      }
    }
    expect(threatAt).toBeGreaterThanOrEqual(POUNCE_TIME - DT);
    expect(hitAt - threatAt).toBeGreaterThanOrEqual(SCRATCH_AT - DT);
    expect(hitAt - threatAt).toBeLessThan(SCRATCH_AT + 2 * DT);
    expect(damages(world)).toEqual([{ type: "damage", hearts: HEARTS - 1.5, source: "tiger", x: 500, y: 150 }]);
    expect(world.hearts).toBe(HEARTS - 1.5);
    expect(world.events.some((e) => e.type === "callout" && e.text === "HSSSS!")).toBe(true);
    expect(world.finishing).toHaveLength(0);
    expect(world.threats).toHaveLength(0); // done once the face is gone
  });

  it("pounce during wasted does nothing further", () => {
    const { world, rng } = poundedTiger();
    for (let t = 0; t < POUNCE_TIME + 0.2; t += DT) tick(world, rng);
    expect(world.threats).toHaveLength(1);
    world.wasted = true;
    const state = JSON.stringify(world.threats[0].state);
    for (let t = 0; t < 3; t += DT) tick(world, rng);
    expect(damages(world)).toHaveLength(0);
    expect(world.glass.marks).toHaveLength(0);
    expect(JSON.stringify(world.threats[0].state)).toBe(state); // frozen, not advanced
  });

  it("wasted freezes the finishes too", () => {
    const { world, rng } = poundedTiger();
    world.wasted = true;
    const age = (world.finishing[0].state as { age: number }).age;
    for (let t = 0; t < 2; t += DT) tick(world, rng);
    expect(world.finishing).toHaveLength(1);
    expect((world.finishing[0].state as { age: number }).age).toBe(age);
    expect(world.threats).toHaveLength(0);
  });

  it("scratches fade and are removed", () => {
    const { world, rng } = poundedTiger();
    while (!damages(world).length) tick(world, rng);
    expect(world.glass.marks).toHaveLength(3);
    const life = SCRATCH_DRAW + SCRATCH_FADE_AT + SCRATCH_FADE_FOR;
    for (let t = 0; t < life - 0.2; t += DT) tick(world, rng);
    expect(world.glass.marks.length).toBeGreaterThan(0);
    for (let t = 0; t < 0.4; t += DT) tick(world, rng);
    expect(world.glass.marks).toHaveLength(0);
  });

  it("reduced variant: no leap, the face fades in, damage still 1.5", () => {
    const { world, rng } = poundedTiger();
    while (!world.threats.length) tick(world, rng, true);
    const s = world.threats[0].state as ClawState;
    const { x, y, scale } = s.face;
    expect(scale).toBe(1); // full size from the start
    const alphas: number[] = [];
    let t = 0;
    while (world.threats.length && t < 3) {
      tick(world, rng, true);
      t += DT;
      alphas.push(s.face.alpha);
      expect(s.face).toMatchObject({ x, y, scale: 1 }); // it never moves
      expect(s.paw).toBeNull();
    }
    expect(t).toBeLessThanOrEqual(GENTLE_CLAW_TIME + DT);
    expect(alphas[0]).toBeLessThan(0.2);
    expect(Math.max(...alphas)).toBe(1);
    expect(damages(world).map((e) => e.type === "damage" && e.hearts)).toEqual([HEARTS - 1.5]);
    expect(world.glass.shakes).toHaveLength(0);
    expect(world.glass.marks.every((m) => m.gentle)).toBe(true);
  });
});
