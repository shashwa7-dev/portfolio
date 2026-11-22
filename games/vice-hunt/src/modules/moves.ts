// Movement modules: pure functions of the animal's age (and the merman's
// surface state), so the lane's resting y can be recovered by subtracting y.
import { IGUANA_PAUSE } from "../config";
import type { Rng } from "../rng";
import { sinkOffset } from "../surface";
import type { Animal, World } from "../world";
import { frameOf } from "./draw";
import { SKATE_EASE, SKATE_SPEED, STRIDE } from "./ostrich";
import type { MoveModule } from "./types";

const RAD = Math.PI / 180;
const FLAMINGO_BOB = 10;
const RABBIT_HOP = 14;
// Per-second chance a dashing iguana stops, giving irregular dash lengths.
const IGUANA_STOP_RATE = 1.2;
const STRUT_STEP = 0.72;

const hop: MoveModule = { y: (a) => -Math.abs(Math.sin(a.age * 7)) * RABBIT_HOP, frame: frameOf };
const glide: MoveModule = { y: (a) => Math.sin(a.age * 2.2) * FLAMINGO_BOB, frame: frameOf };

const dash: MoveModule = {
  y: () => 0,
  frame: frameOf,
  // Dashes and pauses; false while standing still.
  advance(a: Animal, dt: number, rng: Rng) {
    if (a.pause > 0) {
      a.pause = Math.max(0, a.pause - dt);
      return false;
    }
    if (rng() < IGUANA_STOP_RATE * dt) {
      a.pause = IGUANA_PAUSE[0] + rng() * (IGUANA_PAUSE[1] - IGUANA_PAUSE[0]);
      return false;
    }
    return true;
  },
};

const float: MoveModule = {
  y: (a) => Math.sin(a.age * 2.4) * 0.018 * a.h,
  frame: frameOf,
  tilt: (a) => 5 * RAD * Math.sin(a.age * 2.4),
};

const swoop: MoveModule = {
  y: (a) => Math.sin(a.age * 1.6) * 0.06 * a.h,
  frame: frameOf,
  tilt: (a) => -9 * RAD * Math.cos(a.age * 1.6),
};

const strut: MoveModule = {
  y: (a) => -Math.abs(Math.sin((Math.PI * a.age) / STRUT_STEP)) * 5,
  frame: (a) => (Math.floor(a.age / (STRUT_STEP / 2)) % 2) as 0 | 1,
  tilt: (a) => 3 * RAD * Math.sin((2 * Math.PI * a.age) / STRUT_STEP),
};

const surface: MoveModule = {
  y: (a) => (a.surface ? sinkOffset(a.surface, a.h) : 0), // src/surface.ts owns the cycle
  frame: frameOf,
};

/** The UFO's wobble: 5 degrees, 1.5 more per hit taken. */
export const hoverTilt = (a: Animal): number => (5 + 1.5 * a.hits) * RAD * Math.sin(a.age * 2.1);

// The tractor beam, just for looks: on for BEAM_ON s out of every BEAM_EVERY s
// (offset per animal id so two never sync), off for BEAM_QUIET s after a hit.
export const BEAM_EVERY = 5;
export const BEAM_ON = 1.6;
export const BEAM_QUIET = 2.5;
export function beamOn(a: Animal, time: number): boolean {
  if (time - a.lastHitAt < BEAM_QUIET) return false;
  return (a.age + (a.id % 5) * 0.7) % BEAM_EVERY < BEAM_ON;
}

function drawBeam(ctx: CanvasRenderingContext2D, a: Animal, world: World): void {
  if (!beamOn(a, world.time)) return;
  const phase = (a.age + (a.id % 5) * 0.7) % BEAM_EVERY;
  const fade = Math.min(1, phase / 0.25, (BEAM_ON - phase) / 0.25); // ease in and out
  const pulse = 1 + 0.08 * Math.sin(a.age * 12);
  const cx = a.x + a.w / 2;
  const top = a.y + a.h * 0.8;
  const bottom = Math.max(top + 10, world.sea);
  const half = a.w * 0.5 * pulse;
  ctx.save();
  ctx.globalAlpha = 0.22 * fade;
  ctx.fillStyle = "#5ad1d6";
  ctx.beginPath();
  ctx.moveTo(cx - a.w * 0.12, top);
  ctx.lineTo(cx + a.w * 0.12, top);
  ctx.lineTo(cx + half, bottom);
  ctx.lineTo(cx - half, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const hover: MoveModule = {
  y: (a) => Math.sin(a.age * 1.3) * 0.02 * a.h,
  frame: frameOf,
  tilt: hoverTilt,
  draw: drawBeam,
};

// Bigfoot is drawn by his rig (Task 9).
const stomp: MoveModule = { y: () => 0, frame: frameOf };

// The roller ostrich: faster with every hit (SKATE_SPEED), easing up to the
// new pace. Its bob and push phase live on the animal and are drawn, not
// added to y, so the lane's resting y stays recoverable.
const skate: MoveModule = {
  y: () => 0,
  frame: frameOf,
  advance(a: Animal, dt: number) {
    const target = SKATE_SPEED[Math.min(a.hits, SKATE_SPEED.length - 1)];
    const mul = (a.speedMul ??= 1);
    a.speedMul = mul + (target - mul) * Math.min(1, dt * SKATE_EASE);
    a.phase = (a.phase ?? 0) + ((dt * Math.pow(a.speedMul, 0.8)) / STRIDE) * Math.PI * 2;
    a.x += a.vx * (a.speedMul - 1) * dt;
    return true;
  },
};

// Placeholder until its own module lands (plan Task 5).
export const moves = { hop, dash, glide, float, swoop, strut, surface, hover, stomp, skate, swagger: stomp };
