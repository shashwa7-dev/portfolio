// The cow's finish: a let-go balloon. She shrinks as the air hisses out
// (white puffs from behind), wobbling, then zigzags up and off the top,
// garland still on. Gentle: a fade and a short drift up.
import { drift, driftDrag, drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import type { Animal, World } from "../../world";
import { type Body, bodyOf, drawPlaced } from "../draw";
import type { FinishModule } from "../types";

export const DEFLATE_TIME = 1.7;
export const GENTLE_DEFLATE_TIME = 0.7;
const DEG = Math.PI / 180;
const PUFF = "rgba(255,255,255,.8)";
const PUFF_LIFE = 0.5;

export type DeflateState = Body & {
  W: number;
  H: number;
  x0: number;
  y0: number;
  rot: number;
  sx: number;
  sy: number;
  scale: number; // the shrink alone, without the wobble
  alpha: number;
  parts: Particle[];
  rng: Rng;
};

function start(c: Animal, world: World, rng: Rng): DeflateState {
  const b = bodyOf(c, world);
  return { ...b, W: world.width, H: world.height, x0: b.x, y0: b.y, rot: 0, sx: 1, sy: 1, scale: 1, alpha: 1, parts: [], rng };
}

function draw(ctx: CanvasRenderingContext2D, s: DeflateState, art: Art, scratch: HTMLCanvasElement): void {
  drawParticles(ctx, s.parts, art); // the puffs are behind her
  drawPlaced(ctx, scratch, art.extra.cowGarland, {
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
    dir: s.dir,
    rot: s.rot,
    sx: s.sx,
    sy: s.sy,
    alpha: s.alpha,
    flash: s.flash,
  });
}

export const deflates: FinishModule<DeflateState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const k = Math.min(1, s.age / DEFLATE_TIME);
    s.scale = 1 - 0.62 * Math.min(1, 1.6 * k);
    const wob = Math.sin(38 * k) * (1 - k) * 0.18;
    const zx = Math.sin(15 * k) * 70 * (0.4 + k) + 0.35 * k * s.W;
    s.x = s.x0 + s.dir * zx;
    s.y = s.y0 - k * k * (s.y0 + 0.4 * s.H);
    s.rot = s.dir * (Math.sin(24 * k) * 40 + 260 * k) * DEG;
    s.sx = s.scale * (1 + wob);
    s.sy = s.scale * (0.78 - wob);
    // About 0.55 puffs per 60 Hz frame, from her rear.
    if (k < 1 && s.rng() < Math.min(1, 0.55 * dt * 60)) {
      const rear = s.dir > 0 ? s.x + 10 : s.x + s.w - 10;
      emit(s.parts, {
        kind: "dot",
        x: rear,
        y: s.y + s.h * 0.55,
        vx: drift(-30 * s.dir, PUFF_LIFE),
        vy: drift(10, PUFF_LIFE),
        drag: driftDrag(PUFF_LIFE),
        life: PUFF_LIFE,
        size: (8 * 1.3 * 0.6) / 2,
        grow: 3,
        color: PUFF,
      });
    }
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => s.age >= DEFLATE_TIME,
  draw,
  reduced: "deflates-gentle",
};

export const deflatesGentle: FinishModule<DeflateState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const k = Math.min(1, s.age / GENTLE_DEFLATE_TIME);
    s.y = s.y0 - 30 * (1 - (1 - k) ** 3);
    s.sx = s.sy = s.scale = 1 - 0.1 * k;
    s.alpha = 1 - k;
  },
  done: (s) => s.age >= GENTLE_DEFLATE_TIME,
  draw,
};
