import { describe, expect, it } from "vitest";
import { pointsFor } from "../../creatures";
import { stepGlass } from "../../fx/glass";
import { mulberry32 } from "../../rng";
import { LAUNCH_AT } from "../../rig/rig";
import { createWorld, shoot, spawn, type World } from "../../world";
import { stepFinishing, stepThreats } from "../index";
import type { JetState } from "./jet";

const DT = 1 / 60;

function finishedBigfoot(): { world: World; rng: () => number } {
  const rng = mulberry32(11);
  const world = createWorld(1000, 500, rng);
  const a = spawn(world, rng, "bigfoot");
  a.x = 450;
  for (let i = 0; i < a.hp; i++) shoot(world, a.x + a.w / 2, a.y + a.h / 2, rng);
  expect(world.finishing).toHaveLength(1);
  expect(world.finishing[0].id).toBe("jet");
  return { world, rng };
}

function run(world: World, rng: () => number, reduced: boolean, max = 12): number {
  let t = 0;
  while (world.finishing.length && t < max) {
    stepFinishing(world, DT, reduced, rng);
    stepThreats(world, DT, rng, reduced);
    stepGlass(world.glass, DT);
    t += DT;
  }
  return t;
}

describe("Bigfoot's jet", () => {
  it("jet emits a kill event with 3000 base exactly once and is done off screen", () => {
    const { world, rng } = finishedBigfoot();
    const s = world.finishing[0].state as JetState;
    let offAt = -1;
    let t = 0;
    while (world.finishing.length && t < 12) {
      stepFinishing(world, DT, false, rng);
      stepGlass(world.glass, DT);
      t += DT;
      if (offAt < 0 && s.gone) offAt = t;
    }
    const kills = world.events.filter((e) => e.type === "kill");
    expect(kills).toEqual([expect.objectContaining({ kind: "bigfoot" })]);
    expect(pointsFor("bigfoot")).toBe(3000);
    expect(world.finishing).toHaveLength(0);
    expect(offAt).toBeGreaterThan(LAUNCH_AT);
    expect(s.x + s.w < 0 || s.x > world.width || s.jy < -world.height).toBe(true);
  });

  it("drops the pile with PFFT!, flings it as the main SPLAT!, then three more globs", () => {
    const { world, rng } = finishedBigfoot();
    run(world, rng, false);
    const callouts = world.events.filter((e) => e.type === "callout").map((e) => (e as { text: string }).text);
    expect(callouts.filter((c) => c === "PFFT!")).toHaveLength(1);
    expect(callouts.filter((c) => c === "SPLAT!")).toHaveLength(1);
    expect(callouts.indexOf("PFFT!")).toBeLessThan(callouts.indexOf("SPLAT!"));
  });

  it("splats the glass four times, one of them the big main one, and costs no hearts", () => {
    const { world, rng } = finishedBigfoot();
    const hearts = world.hearts;
    let most = 0;
    let t = 0;
    while (world.finishing.length && t < 12) {
      stepFinishing(world, DT, false, rng);
      t += DT;
      most = Math.max(most, world.glass.marks.length); // no stepGlass: nothing fades
    }
    const splats = world.glass.marks.filter((m) => m.kind === "splat");
    expect(most).toBe(4);
    expect(splats.filter((m) => m.main)).toHaveLength(1);
    expect(splats.find((m) => m.main)!.r).toBeCloseTo(0.13 * 500);
    expect(world.hearts).toBe(hearts);
  });

  it("reduced: fades after the squat, splats appear in place, done in a few seconds", () => {
    const { world, rng } = finishedBigfoot();
    const t = run(world, rng, true);
    expect(world.finishing).toHaveLength(0);
    expect(t).toBeLessThan(3);
    const splats = world.glass.marks.filter((m) => m.kind === "splat");
    expect(splats.length).toBeGreaterThan(0);
    expect(splats.every((m) => m.gentle)).toBe(true);
  });
});
