import { describe, expect, it } from "vitest";
import { MAX_DT } from "../config";
import { CREATURES, KINDS } from "../creatures";
import { DEATHS } from "../death";
import { mulberry32 } from "../rng";
import { createWorld, shoot, spawn } from "../world";
import { FINISHES, HIT_REACTIONS, MOVES, THREATS, stepFinishing } from "./index";

describe("registries", () => {
  it("every FinishId, MoveId, HitReactionId and ThreatId used in CREATURES has a module", () => {
    for (const k of KINDS) {
      const c = CREATURES[k];
      expect(FINISHES[c.finish], `${k} finish`).toBeDefined();
      expect(MOVES[c.move], `${k} move`).toBeDefined();
      expect(HIT_REACTIONS[c.hit], `${k} hit`).toBeDefined();
      if ("threat" in c && c.threat) expect(THREATS[c.threat.attack], `${k} threat`).toBeDefined();
    }
  });
});

function finishedRabbit() {
  const rng = mulberry32(1);
  const world = createWorld(1000, 500, rng);
  const a = spawn(world, rng, "rabbit");
  const { finished } = shoot(world, a.x + a.w / 2, a.y + a.h / 2, rng);
  expect(finished).toBe(true);
  return world;
}

describe("stepFinishing", () => {
  it("shoot moves a finished animal into world.finishing", () => {
    const world = finishedRabbit();
    expect(world.animals).toHaveLength(0);
    expect(world.finishing).toHaveLength(1);
    expect(world.finishing[0]).toMatchObject({ kind: "rabbit", id: "falls" });
  });

  it("removes a falls entry after DEATHS[kind].duration", () => {
    const world = finishedRabbit();
    const steps = Math.round(DEATHS.rabbit.duration / 0.02);
    for (let i = 0; i < steps - 2; i++) stepFinishing(world, 0.02, false);
    expect(world.finishing).toHaveLength(1);
    for (let i = 0; i < 5; i++) stepFinishing(world, 0.02, false);
    expect(world.finishing).toHaveLength(0);
  });

  it("with dt 1.0 advances by MAX_DT only", () => {
    const world = finishedRabbit();
    stepFinishing(world, 1.0, false);
    expect((world.finishing[0].state as { age: number }).age).toBeCloseTo(MAX_DT);
  });

  it("the generic fade finish ends after 0.6 s", () => {
    const world = finishedRabbit();
    const fake = { kind: "cow", x: 0, y: 0, w: 1, h: 1, vx: 1, pause: 0, age: 0, flash: 0 };
    world.finishing[0].id = "deflates";
    world.finishing[0].state = FINISHES.deflates.start(fake as never, world, mulberry32(1));
    for (let i = 0; i < 11; i++) stepFinishing(world, 0.05, false);
    expect(world.finishing).toHaveLength(1);
    for (let i = 0; i < 2; i++) stepFinishing(world, 0.05, false);
    expect(world.finishing).toHaveLength(0);
  });
});
