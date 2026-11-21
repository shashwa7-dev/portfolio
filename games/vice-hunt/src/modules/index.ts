// Exhaustive registries over the id unions. Ids whose real module has not
// landed point at a harmless generic one (Tasks 6 to 9 replace them).
import type { FinishId, HitReactionId, MoveId, ThreatId } from "../creatures";
import { MAX_DT } from "../config";
import { CREATURES } from "../creatures";
import type { Rng } from "../rng";
import type { World } from "../world";
import { crashes, crashesGentle } from "./finishes/crashes";
import { deflates, deflatesGentle } from "./finishes/deflates";
import { fade } from "./finishes/fade";
import { falls } from "./finishes/falls";
import { fountain, fountainGentle } from "./finishes/fountain";
import { pounces, pouncesGentle } from "./finishes/pounces";
import { rocket, rocketGentle } from "./finishes/rocket";
import { moves } from "./moves";
import { flinch, garland, noReaction } from "./reactions";
import { clawSwipe } from "./threats/clawSwipe";
import type { FinishModule, HitReactionModule, MoveModule, Origin, ThreatModule } from "./types";

export type { Finishing } from "./types";

const none = () => {};

export const MOVES: Record<MoveId, MoveModule> = moves;

export const HIT_REACTIONS: Record<HitReactionId, HitReactionModule<any>> = { none: noReaction, flinch, garland };

const noThreat: ThreatModule<null> = { start: () => null, step: none, done: () => true, draw: none };
export const THREATS: Record<ThreatId, ThreatModule<any>> = {
  "claw-swipe": clawSwipe,
  throw: noThreat,
};

export const FINISHES: Record<FinishId, FinishModule<any>> = {
  falls,
  deflates,
  pounces,
  rocket,
  fountain,
  crashes,
  jet: fade,
  "deflates-gentle": deflatesGentle,
  "pounces-gentle": pouncesGentle,
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
// the done ones. Under reduced motion a module's `reduced` variant steps. A
// creature that retaliates (the tiger) starts its attack where its finish
// left it. Nothing advances once the world is wasted.
export function stepFinishing(world: World, dt: number, reduced: boolean, rng: Rng): void {
  if (world.wasted) return;
  const d = Math.min(dt, MAX_DT);
  const ended: Origin[] = [];
  world.finishing = world.finishing.filter((f) => {
    const mod = resolveFinish(f.id, reduced);
    mod.step(f.state, d, world.events);
    if (!mod.done(f.state)) return true;
    ended.push(f.state as Origin); // every finish's state is a Body
    return false;
  });
  for (const at of ended) {
    const threat = (CREATURES[at.kind] as { threat?: { kind: string; attack: ThreatId } }).threat;
    if (threat?.kind === "retaliates") startThreat(world, at, threat.attack, rng, reduced);
  }
}

export function startThreat(world: World, at: Origin, id: ThreatId, rng: Rng, reduced: boolean): void {
  world.threats.push({ kind: at.kind, id, state: THREATS[id].start(at, world, rng, reduced) });
}

// Steps every threat by at most MAX_DT (they may damage the world and mark
// the glass) and drops the done ones. Nothing runs once the world is wasted.
export function stepThreats(world: World, dt: number, rng: Rng): void {
  if (world.wasted) return;
  const d = Math.min(dt, MAX_DT);
  world.threats = world.threats.filter((t) => {
    const mod = THREATS[t.id];
    mod.step(t.state, d, world, rng, world.events);
    return !mod.done(t.state);
  });
}
