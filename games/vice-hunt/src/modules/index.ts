// Exhaustive registries over the id unions. Ids whose real module has not
// landed point at a harmless generic one (Tasks 6 to 9 replace them).
import type { FinishId, HitReactionId, MoveId, ThreatId } from "../creatures";
import { MAX_DT } from "../config";
import type { World } from "../world";
import { frameOf } from "./draw";
import { fade } from "./finishes/fade";
import { falls } from "./finishes/falls";
import type { FinishModule, HitReactionModule, MoveModule, ThreatModule } from "./types";

export type { Finishing } from "./types";

const none = () => {};

// Placeholder: the world still moves animals itself (today's bob and lane
// logic); Task 6 moves that behaviour in here, id by id.
const still: MoveModule = { y: () => 0, frame: frameOf };

export const MOVES: Record<MoveId, MoveModule> = {
  hop: still,
  dash: still,
  glide: still,
  float: still,
  swoop: still,
  strut: still,
  surface: still,
  hover: still,
  stomp: still,
};

const noReaction: HitReactionModule<null> = { start: () => null, step: none, draw: none };
export const HIT_REACTIONS: Record<HitReactionId, HitReactionModule<any>> = {
  none: noReaction,
  flinch: noReaction,
  garland: noReaction,
};

const noThreat: ThreatModule<null> = { start: () => null, step: none, draw: none };
export const THREATS: Record<ThreatId, ThreatModule<any>> = {
  "claw-swipe": noThreat,
  throw: noThreat,
};

export const FINISHES: Record<FinishId, FinishModule<any>> = {
  falls,
  deflates: fade,
  pounces: fade,
  rocket: fade,
  fountain: fade,
  crashes: fade,
  jet: fade,
};

// Steps every finishing entry by at most MAX_DT, pushes their events, drops
// the done ones. Under reduced motion a module's `reduced` variant steps.
export function stepFinishing(world: World, dt: number, reduced: boolean): void {
  const d = Math.min(dt, MAX_DT);
  world.finishing = world.finishing.filter((f) => {
    const base = FINISHES[f.id];
    const mod = reduced && base.reduced ? FINISHES[base.reduced] : base;
    mod.step(f.state, d, world.events);
    return !mod.done(f.state);
  });
}
