// The UFO's finish: it sputters in place (shake, tilt, smoke), then spirals
// down into the sea with a big splash. As it starts to go, the alien bails
// out (the dome is empty from then on) and drifts down under a pink
// parachute, swaying, into the water with a small splash.
// Gentle: the saucer fades down into the sea; the alien drifts, no sway.
import { SEA_LINE } from "../../config";
import {
  type Particle,
  type Ring,
  drawParticles,
  drawRings,
  drift,
  driftDrag,
  emit,
  ringsDone,
  splash,
  stepParticles,
  stepRings,
} from "../../fx/particles";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import type { Animal, World } from "../../world";
import { type Body, bodyOf, drawPlaced } from "../draw";
import type { FinishModule } from "../types";

export const SPUTTER_TIME = 0.45;
export const FALL_TIME = 1.5;
export const ALIEN_AT = 0.38; // the pilot leaves the dome as the chute appears
export const CHUTE_OPEN = 0.35;
export const GENTLE_CRASH_TIME = 0.75;
const GENTLE_ALIEN_AT = 0.15;
const ALIEN_FADE = 0.6; // after it touches the water
const PROTO_UFO = 132; // the prototype's UFO width; its px figures scale from it
const ALIEN_RATIO = 58 / PROTO_UFO; // alien width / UFO width
const CHUTE_ASPECT = 126 / 92; // alienChute height / width
const DEG = Math.PI / 180;
const FRAME = 1 / 60; // smoke is rolled per 60 Hz step, whatever the real frame rate
const SMOKE = "rgba(70,64,82,.62)";
const SPARK = ["rgba(255,243,196,1)", "rgba(247,160,28,1)"];

export type Alien = {
  x0: number; // centre x where it popped out
  y0: number;
  x: number; // centre x
  y: number; // top
  w: number;
  h: number;
  age: number;
  open: number; // 0..1, the chute opening
  sway: number; // radians
  landed: number; // seconds since it touched the water, or -1
  alpha: number;
};

export type CrashState = Body & {
  W: number;
  H: number;
  sea: number; // the water line, px
  k: number; // the prototype's px scale
  x0: number;
  y0: number;
  fx: number; // where the fall began
  fy: number;
  rot: number;
  scale: number;
  alpha: number;
  falling: boolean;
  gone: boolean; // the saucer is in the sea
  empty: boolean; // the dome is empty
  alien: Alien | null;
  acc: number; // 60 Hz steps owed to the smoke
  smoke: Particle[];
  drops: Particle[];
  rings: Ring[]; // the saucer's splash, then the alien's
  rng: Rng;
};

function start(c: Animal, world: World, rng: Rng): CrashState {
  const b = bodyOf(c, world);
  const s: CrashState = {
    ...b,
    W: world.width,
    H: world.height,
    sea: SEA_LINE * world.height,
    k: b.w / PROTO_UFO,
    x0: b.x,
    y0: b.y,
    fx: b.x,
    fy: b.y,
    rot: 0,
    scale: 1,
    alpha: 1,
    falling: false,
    gone: false,
    empty: false,
    alien: null,
    acc: 0,
    smoke: [],
    drops: [],
    rings: [],
    rng,
  };
  // The last hit: a burst of sparks.
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h * 0.45;
  for (let i = 0; i < 10; i++) {
    emit(s.smoke, {
      kind: "dot",
      x: cx,
      y: cy,
      vx: drift((rng() - 0.5) * 90, 0.45),
      vy: drift((rng() - 0.5) * 90, 0.45),
      drag: driftDrag(0.45),
      life: 0.45,
      size: (5 * s.k * 1.4) / 2,
      grow: 1.5,
      color: SPARK[i % 2],
    });
  }
  return s;
}

function bailOut(s: CrashState): void {
  const w = s.w * ALIEN_RATIO;
  const x0 = s.x + s.w * (s.dir < 0 ? 0.45 : 0.55); // its centre, out of the dome
  s.empty = true;
  s.alien = { x0, y0: s.y, x: x0, y: s.y, w, h: w * CHUTE_ASPECT, age: 0, open: 0, sway: 0, landed: -1, alpha: 1 };
}

// The trailing side of the rim, where the smoke pours from.
const rimX = (s: CrashState, f: number): number => s.x + s.w * (s.dir < 0 ? f : 1 - f);

function puff(s: CrashState, x: number, y: number, size: number, life: number, dy: number): void {
  const { rng } = s;
  emit(s.smoke, {
    kind: "smoke",
    x,
    y,
    vx: drift(-s.dir * 18 * s.k + (rng() - 0.5) * 8, life),
    vy: drift(dy * s.k, life),
    drag: driftDrag(life),
    life,
    size: (size * s.k * 1.4 * 0.6) / 2,
    grow: 3,
    color: SMOKE,
  });
}

function stepAlien(s: CrashState, a: Alien, dt: number, sway: boolean): void {
  a.age += dt;
  if (a.landed >= 0) {
    a.landed += dt;
    a.alpha = Math.max(0, 1 - a.landed / ALIEN_FADE);
    return;
  }
  const t = a.age;
  a.open = Math.min(1, t / CHUTE_OPEN);
  const rise = 40 * s.k;
  a.y = t < CHUTE_OPEN ? a.y0 - rise * a.open : a.y0 - rise + (t - CHUTE_OPEN) * 0.075 * s.H;
  // It drifts back the way the saucer came, so it stays on screen.
  a.x = a.x0 + (sway ? Math.sin(t * 1.4) * 26 * s.k : 0) - s.dir * t * 6 * s.k;
  a.sway = sway ? Math.sin(t * 2.2) * 11 * DEG : 0;
  if (sway && a.y + a.h > s.sea - 0.02 * s.H) {
    a.landed = 0;
    splash(s.drops, s.rings, a.x, s.sea, false, s.rng);
  }
}

function drawAlien(ctx: CanvasRenderingContext2D, a: Alien, art: Art, scratch: HTMLCanvasElement): void {
  const sc = (0.4 + 0.6 * a.open) * (a.landed >= 0 ? 1 - 0.3 * (a.landed / ALIEN_FADE) : 1);
  drawPlaced(ctx, scratch, art.extra.alienChute, {
    x: a.x - a.w / 2,
    y: a.y + (a.landed >= 0 ? 14 * (a.landed / ALIEN_FADE) : 0),
    w: a.w,
    h: a.h,
    dir: 1,
    rot: a.sway,
    sx: sc,
    sy: sc,
    px: 0.5,
    py: 0.1, // hangs from the chute
    alpha: a.alpha,
  });
}

function draw(ctx: CanvasRenderingContext2D, s: CrashState, art: Art, scratch: HTMLCanvasElement): void {
  drawParticles(ctx, s.smoke, art);
  if (!s.gone) {
    const img = s.empty ? art.extra.ufoEmpty : art.sprites.ufo[s.frame];
    drawPlaced(ctx, scratch, img, {
      x: s.x,
      y: s.y,
      w: s.w,
      h: s.h,
      dir: s.dir,
      rot: s.rot,
      sx: s.scale,
      sy: s.scale,
      alpha: s.alpha,
      flash: s.flash,
    });
  }
  if (s.alien) drawAlien(ctx, s.alien, art, scratch);
  drawRings(ctx, s.rings);
  drawParticles(ctx, s.drops, art);
}

export const crashes: FinishModule<CrashState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const t = s.age;
    if (!s.alien && t >= ALIEN_AT) bailOut(s);
    // The prototype's tilt is for a saucer heading left; mirror it otherwise.
    const tilt = (deg: number) => -s.dir * deg * DEG;
    if (!s.falling) {
      s.x = s.x0 + Math.sin(t * 60) * 3 * s.k;
      s.y = s.y0 + Math.cos(t * 50) * 2 * s.k;
      s.rot = tilt(-16 + Math.sin(t * 30) * 4);
      if (t > SPUTTER_TIME) {
        s.falling = true;
        s.fx = s.x;
        s.fy = s.y;
      }
    } else if (!s.gone) {
      const k = Math.min(1, (t - SPUTTER_TIME) / FALL_TIME);
      s.x = s.fx + s.dir * 0.12 * s.W * k + Math.sin(k * 9) * 30 * s.k * (1 - k);
      s.y = s.fy + (s.sea - 0.06 * s.H - s.fy) * k * k;
      s.rot = tilt(-16 + k * 40 + Math.sin(k * 14) * 12);
      s.scale = 1 - k * 0.35;
      if (k >= 1) {
        s.gone = true;
        splash(s.drops, s.rings, rimX(s, 0.4), s.sea, true, s.rng);
      }
    }
    s.acc += dt;
    while (s.acc >= FRAME) {
      s.acc -= FRAME;
      if (s.gone) continue;
      if (!s.falling && s.rng() < 0.4) puff(s, rimX(s, 0.7), s.y + s.h * 0.4, 12, 0.9, -24);
      else if (s.falling && s.rng() < 0.6) puff(s, rimX(s, 0.6), s.y + s.h * 0.3, 14 * s.scale, 1.1, -30);
    }
    if (s.alien) stepAlien(s, s.alien, dt, true);
    stepParticles(s.smoke, dt, 0);
    stepParticles(s.drops, dt, 0);
    stepRings(s.rings, dt);
  },
  // Both are in the water and every splash and wisp has played out.
  done: (s) =>
    s.gone &&
    s.alien !== null &&
    s.alien.landed >= ALIEN_FADE &&
    s.smoke.length === 0 &&
    s.drops.length === 0 &&
    ringsDone(s.rings),
  draw,
  reduced: "crashes-gentle",
};

export const crashesGentle: FinishModule<CrashState> = {
  start(c, world, rng) {
    const s = start(c, world, rng);
    s.smoke.length = 0; // no spark burst
    return s;
  },
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const k = Math.min(1, s.age / GENTLE_CRASH_TIME);
    s.y = s.y0 + 0.15 * s.H * k * k;
    s.alpha = 1 - k;
    if (!s.alien && s.age >= GENTLE_ALIEN_AT) {
      bailOut(s);
      s.alien!.open = 1;
    }
    if (s.alien) {
      const a = s.alien;
      a.age += dt;
      a.open = 1;
      a.y = a.y0 + a.age * 0.075 * s.H;
      a.alpha = Math.sin(Math.PI * Math.min(1, a.age / (GENTLE_CRASH_TIME - GENTLE_ALIEN_AT)));
    }
  },
  done: (s) => s.age >= GENTLE_CRASH_TIME,
  draw,
};
