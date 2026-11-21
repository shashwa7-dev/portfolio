// Exhaustive registries over the id unions. Ids whose real module has not
// landed point at a harmless generic one (Tasks 6 to 9 replace them).
import type { FinishId, HitReactionId, MoveId, ThreatId } from "../creatures";
import { MAX_DT } from "../config";
import type { World } from "../world";
import { crashes, crashesGentle } from "./finishes/crashes";
import { deflates, deflatesGentle } from "./finishes/deflates";
import { fade } from "./finishes/fade";
import { falls } from "./finishes/falls";
import { fountain, fountainGentle } from "./finishes/fountain";
import { rocket, rocketGentle } from "./finishes/rocket";
import { moves } from "./moves";
import { flinch, garland, noReaction } from "./reactions";
import type { FinishModule, HitReactionModule, MoveModule, ThreatModule } from "./types";

export type { Finishing } from "./types";

const none = () => {};

export const MOVES: Record<MoveId, MoveModule> = moves;

export const HIT_REACTIONS: Record<HitReactionId, HitReactionModule<any>> = { none: noReaction, flinch, garland };

const noThreat: ThreatModule<null> = { start: () => null, step: none, draw: none };
export const THREATS: Record<ThreatId, ThreatModule<any>> = {
  "claw-swipe": noThreat,
  throw: noThreat,
};

export const FINISHES: Record<FinishId, FinishModule<any>> = {
  falls,
  deflates,
  pounces: fade,
  rocket,
  fountain,
  crashes,
  jet: fade,
  "deflates-gentle": deflatesGentle,
  "rocket-gentle": rocketGentle,
  "fountain-gentle": fountainGentle,
  "crashes-gentle": crashesGentle,
};

// The one place `reduced` is resolved: step and draw both use it.
export function resolveFinish(id: FinishId, reduced: boolean): FinishModule<any> {
  const base = FINISHES[id];
  return reduced && base.reduced ? FINISHES[base.reduced] : base;
}

// Steps every finishing entry by at most MAX_DT, pushes their events, drops
// the done ones. Under reduced motion a module's `reduced` variant steps.
export function stepFinishing(world: World, dt: number, reduced: boolean): void {
  const d = Math.min(dt, MAX_DT);
  world.finishing = world.finishing.filter((f) => {
    const mod = resolveFinish(f.id, reduced);
    mod.step(f.state, d, world.events);
    return !mod.done(f.state);
  });
}
