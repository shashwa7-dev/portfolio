// The tiger's finish: it pounces down onto the sand in an arc, lands with a
// squash and a puff of dust, holds a beat, then crouches. When it is done the
// world starts its `claw-swipe` threat (threats/clawSwipe.ts), which leaps at
// the screen from where it crouched.
// Gentle: it fades where it was hit; the threat plays its gentle version.
import { GROUND_LINE } from "../../config";
import { drift, driftDrag, drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import type { Animal, World } from "../../world";
import { type Body, bodyOf, drawPlaced } from "../draw";
import type { FinishModule } from "../types";

export const ARC_TIME = 0.6;
export const BEAT_TIME = 0.45;
export const CROUCH_TIME = 0.22;
export const POUNCE_TIME = ARC_TIME + BEAT_TIME + CROUCH_TIME;
export const GENTLE_POUNCE_TIME = 0.4;
const SQUASH_TIME = 0.32;
const DEG = Math.PI / 180;
const DUST = "rgba(240,220,170,.95)";
const STAGE = 1280; // the prototype's stage width; its px figures scale from it

export type PounceState = Body & {
  W: number;
  H: number;
  x0: number;
  y0: number;
  gy: number; // its y once on the sand
  rot: number;
  sx: number;
  sy: number;
  alpha: number;
  landed: boolean;
  parts: Particle[];
  rng: Rng;
};

function start(c: Animal, world: World, rng: Rng): PounceState {
  const b = bodyOf(c, world);
  return {
    ...b,
    W: world.width,
    H: world.height,
    x0: b.x,
    y0: b.y,
    gy: GROUND_LINE * world.height - b.h * 0.92,
    rot: 0,
    sx: 1,
    sy: 1,
    alpha: 1,
    landed: false,
    parts: [],
    rng,
  };
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function dust(s: PounceState, x: number, size: number, dy: number, life: number): void {
  const k = s.W / STAGE;
  for (let i = 0; i < 6; i++) {
    emit(s.parts, {
      kind: "smoke",
      x: x + (s.rng() - 0.5) * s.w * 0.5,
      y: GROUND_LINE * s.H - 6,
      vx: drift((s.rng() - 0.5) * 40 * k, life),
      vy: drift(dy * k, life),
      drag: driftDrag(life),
      life,
      size: ((size * k * 0.6) / 2) * (0.6 + s.rng() * 0.5),
      grow: 1.8,
      color: DUST,
    });
  }
}

function draw(ctx: CanvasRenderingContext2D, s: PounceState, art: Art, scratch: HTMLCanvasElement): void {
  drawPlaced(ctx, scratch, art.sprites.tiger[s.frame], {
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
    dir: s.dir,
    rot: s.rot,
    sx: s.sx,
    sy: s.sy,
    px: 0.5,
    py: 1, // squashes on its feet
    alpha: s.alpha,
    flash: s.flash,
  });
  drawParticles(ctx, s.parts, art);
}

export const pounces: FinishModule<PounceState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const t = s.age;
    if (t < ARC_TIME) {
      // Down in an arc, nose first, levelling out as it lands.
      const k = t / ARC_TIME;
      s.x = s.x0 + s.dir * 0.1 * s.W * k;
      s.y = s.y0 + (s.gy - s.y0) * k * k - Math.sin(k * Math.PI) * 0.06 * s.H;
      s.rot = s.dir * (10 - k * 10 + Math.sin(k * Math.PI) * 18) * DEG;
    } else {
      if (!s.landed) {
        s.landed = true;
        s.x = s.x0 + s.dir * 0.1 * s.W;
        s.y = s.gy;
        s.rot = 0;
        dust(s, s.x + s.w / 2, 34, -10, 0.7);
      }
      const after = t - ARC_TIME;
      if (after < SQUASH_TIME) {
        // Landing squash: (1.12, .82) → (.96, 1.05) → (1, 1), easing out.
        const q = 1 - (1 - after / SQUASH_TIME) ** 2;
        s.sx = q < 0.5 ? lerp(1.12, 0.96, q * 2) : lerp(0.96, 1, q * 2 - 1);
        s.sy = q < 0.5 ? lerp(0.82, 1.05, q * 2) : lerp(1.05, 1, q * 2 - 1);
      } else if (t >= ARC_TIME + BEAT_TIME) {
        // The crouch before the leap, easing in.
        const q = Math.min(1, (t - ARC_TIME - BEAT_TIME) / CROUCH_TIME) ** 2;
        s.sx = lerp(1, 1.14, q);
        s.sy = lerp(1, 0.8, q);
      } else {
        s.sx = 1;
        s.sy = 1;
      }
    }
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => s.age >= POUNCE_TIME,
  draw,
  reduced: "pounces-gentle",
};

export const pouncesGentle: FinishModule<PounceState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    s.alpha = 1 - Math.min(1, s.age / GENTLE_POUNCE_TIME);
  },
  done: (s) => s.age >= GENTLE_POUNCE_TIME,
  draw,
};
