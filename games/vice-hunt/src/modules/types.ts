// Interfaces for the behaviour modules. Registries (modules/index.ts) are
// exhaustive Records over the id unions in creatures.ts. Modules are pure
// (no DOM) except `draw`, which takes a canvas context and keeps no state.
import type { FinishId, Kind, ThreatId } from "../creatures";
import type { GameEvent } from "../events";
import type { Rng } from "../rng";
import type { Glass } from "../fx/glass";
import type { Art } from "../sprites";
import type { Animal, World } from "../world";

export interface FinishModule<S> {
  start(c: Animal, world: World, rng: Rng): S; // pure
  // World time only; pushes events. A finish never damages the player, but
  // it may mark the glass (Bigfoot's jet splats it): `glass` is the world's.
  step(s: S, dt: number, out: GameEvent[], glass?: Glass): void;
  done(s: S): boolean;
  // `scratch` is the scene's offscreen canvas, for the white hit flash.
  draw(ctx: CanvasRenderingContext2D, s: S, art: Art, scratch: HTMLCanvasElement): void; // no module state
  // Drawn on the glass layer, above the gun (globs flying at the camera).
  drawGlass?(ctx: CanvasRenderingContext2D, s: S, art: Art): void;
  reduced?: FinishId; // the gentle version to use under reduced motion (must share this module's state)
}

export interface MoveModule {
  y(a: Animal, world: World): number; // vertical offset from the lane's resting y
  frame(a: Animal): number; // sprite frame, 0 or 1
  // Drawn under the sprite, in world px (the UFO's tractor beam).
  draw?(ctx: CanvasRenderingContext2D, a: Animal, world: World): void;
  tilt?(a: Animal): number; // radians about the sprite's centre
  // Per-tick horizontal movement; false when the animal stands still (the iguana's pauses).
  advance?(a: Animal, dt: number, rng: Rng): boolean;
}

export interface HitReactionModule<S> {
  start(a: Animal): S;
  step(s: S, dt: number): void;
  pose?(s: S): { dx: number; dy: number }; // jolt applied to the body, in sprite px
  // Drawn over the body, in sprite space.
  draw(ctx: CanvasRenderingContext2D, s: S, art: Art): void;
}

// Where a threat comes from: a live animal (Bigfoot's throws) or a finished
// body (the tiger, once its pounce has landed). `id` names a live animal.
export type Origin = { kind: Kind; x: number; y: number; w: number; h: number; dir: 1 | -1; id?: number };

// Attacks on the player. Threats may change the world (damage, glass marks),
// so their step gets it; they never run while the world is wasted. `draw`
// paints on the glass layer, above the gun.
export interface ThreatModule<S> {
  start(at: Origin, world: World, rng: Rng, reduced: boolean): S;
  step(s: S, dt: number, world: World, rng: Rng, out: GameEvent[]): void;
  done(s: S): boolean;
  draw(ctx: CanvasRenderingContext2D, s: S, art: Art): void;
}

// `from`: the animal it belongs to (one throw threat per provoked Bigfoot).
export type Threatening = { kind: Kind; id: ThreatId; state: unknown; from?: number };

// A finished animal playing out its finish; its module's state rides along.
export type Finishing = {
  kind: Animal["kind"];
  id: FinishId;
  state: unknown;
  x: number;
  y: number;
  w: number;
  h: number;
  dir: 1 | -1;
};
