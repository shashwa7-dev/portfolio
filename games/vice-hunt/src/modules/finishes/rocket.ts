// The shark's finish: it stops and crouches (sparks spitting underneath), its
// legs pull up into the rocket shape, then it launches straight up,
// accelerating, on a shower of fireworks, and leaves through the top.
// Gentle: the rocket rises a little without sparks and fades.
import { drift, driftDrag, drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import type { Animal, World } from "../../world";
import { type Body, bodyOf, drawPlaced } from "../draw";
import type { FinishModule } from "../types";

export const CROUCH_TIME = 0.45;
export const ROCKET_FRAME_AT = 0.2; // the legs are in by then
export const GENTLE_ROCKET_TIME = 0.7;
const SQUASH_TIME = 0.42;
const DEG = Math.PI / 180;
const SPARK = ["#fff3c4", "#f7c46c", "#f49ea3", "#5ad1d6", "#ffffff", "#f7a01c"];
const FRAME = 1 / 60; // the exhaust is counted per 60 Hz step, whatever the real frame rate

export type RocketState = Body & {
  W: number;
  H: number;
  x0: number;
  y0: number;
  vy: number;
  rocket: boolean; // drawn as the rocket (legs pulled in)
  launched: boolean;
  rot: number;
  sx: number;
  sy: number;
  alpha: number;
  acc: number; // 60 Hz steps owed to the exhaust
  parts: Particle[];
  rng: Rng;
};

function start(c: Animal, world: World, rng: Rng): RocketState {
  const b = bodyOf(c, world);
  return {
    ...b,
    W: world.width,
    H: world.height,
    x0: b.x,
    y0: b.y,
    vy: 0,
    rocket: false,
    launched: false,
    rot: 0,
    sx: 1,
    sy: 1,
    alpha: 1,
    acc: 0,
    parts: [],
    rng,
  };
}

const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)];

// Fireworks as exhaust: sparks fanning down and out, some popping into tiny
// star bursts, over a white smoke trail.
function exhaust(s: RocketState, cx: number, cy: number, dots: number, starChance: number): void {
  const { rng } = s;
  for (let i = 0; i < dots; i++) {
    const life = 0.5 + rng() * 0.3;
    emit(s.parts, {
      kind: "dot",
      x: cx + (rng() - 0.5) * 10,
      y: cy,
      vx: drift((rng() - 0.5) * 120, life),
      vy: drift(40 + rng() * 90, life),
      drag: driftDrag(life),
      life,
      size: ((3 + rng() * 4) * 1.4 * 0.6) / 2,
      grow: 3,
      color: pick(rng, SPARK),
    });
  }
  if (rng() < starChance) {
    const bx = cx + (rng() - 0.5) * 70;
    const by = cy + 20 + rng() * 50;
    const color = pick(rng, SPARK);
    for (let j = 0; j < 8; j++) {
      const a = (j / 8) * Math.PI * 2;
      emit(s.parts, {
        kind: "star",
        x: bx,
        y: by,
        vx: drift(Math.cos(a) * 26, 0.45),
        vy: drift(Math.sin(a) * 26, 0.45),
        drag: driftDrag(0.45),
        life: 0.45,
        size: 2.6,
        grow: 2,
        color,
      });
    }
  }
  emit(s.parts, {
    kind: "smoke",
    x: cx,
    y: cy + 6,
    vx: drift((rng() - 0.5) * 30, 0.9),
    vy: drift(30, 0.9),
    drag: driftDrag(0.9),
    life: 0.9,
    size: (18 * 1.3 * 0.6) / 2,
    grow: 3,
    color: "rgba(255,255,255,.5)",
  });
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function draw(ctx: CanvasRenderingContext2D, s: RocketState, art: Art, scratch: HTMLCanvasElement): void {
  drawParticles(ctx, s.parts, art);
  const img = s.rocket ? art.extra.sharkRocket : art.sprites.shark[s.frame];
  drawPlaced(ctx, scratch, img, {
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
}

export const rocket: FinishModule<RocketState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const t = s.age;
    if (t >= ROCKET_FRAME_AT) s.rocket = true;
    // Squash, stretch, and it stays stretched for the flight.
    const q = Math.min(1, t / SQUASH_TIME) ** 2; // ease-in
    s.sx = q < 0.5 ? lerp(1, 1.1, q * 2) : lerp(1.1, 0.94, q * 2 - 1);
    s.sy = q < 0.5 ? lerp(1, 0.86, q * 2) : lerp(0.86, 1.08, q * 2 - 1);
    if (!s.launched && t > CROUCH_TIME) {
      s.launched = true;
      s.vy = -0.1 * s.H;
    }
    if (s.launched) {
      s.vy -= 2.2 * s.H * dt;
      s.y += s.vy * dt;
      s.x = s.x0 + Math.sin(t * 40) * 1.5;
      s.rot = Math.sin(t * 9) * 3 * DEG;
    } else {
      s.x = s.x0 + Math.sin(t * 70) * 2; // ignition shake
    }
    const gone = s.y < -s.h;
    s.acc += dt;
    while (s.acc >= FRAME) {
      s.acc -= FRAME;
      if (gone) continue;
      const cx = s.x + s.w / 2;
      if (s.launched) exhaust(s, cx, s.y + s.h - 2, 6, 0.4);
      else exhaust(s, cx, s.y + s.h - 4, 2, 0.15);
    }
    stepParticles(s.parts, dt, 0);
  },
  // Off the top, once the last sparks have burnt out.
  done: (s) => s.y < -s.h && s.parts.length === 0,
  draw,
  reduced: "rocket-gentle",
};

export const rocketGentle: FinishModule<RocketState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const k = Math.min(1, s.age / GENTLE_ROCKET_TIME);
    s.rocket = true;
    s.y = s.y0 - 0.25 * s.H * k * k;
    s.alpha = 1 - k;
  },
  done: (s) => s.age >= GENTLE_ROCKET_TIME,
  draw,
};
