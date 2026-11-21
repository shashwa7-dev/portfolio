// Test helpers for the finish modules: a real animal of `kind`, finished in a
// seeded world, and a stepper that runs a module to the end.
import type { Kind } from "../../creatures";
import type { GameEvent } from "../../events";
import { mulberry32 } from "../../rng";
import { createWorld, spawn, type World } from "../../world";
import type { FinishModule } from "../types";

export const W = 1000;
export const H = 500;

export function begin<S>(mod: FinishModule<S>, kind: Kind, seed = 7): { s: S; world: World } {
  const rng = mulberry32(seed);
  const world = createWorld(W, H, rng);
  const a = spawn(world, rng, kind);
  a.x = 400;
  return { s: mod.start(a, world, rng), world };
}

// Steps until done (or `max` seconds); returns the time it took.
export function runToEnd<S>(mod: FinishModule<S>, s: S, dt = 1 / 60, max = 20, each?: (t: number) => void): number {
  const out: GameEvent[] = [];
  let t = 0;
  while (!mod.done(s) && t < max) {
    mod.step(s, dt, out);
    t += dt;
    each?.(t);
  }
  return t;
}
