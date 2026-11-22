// The roller ostrich's finish: every feather it has left blows off, it stands
// there bare and shocked ("!!") and shivers while its skates start to spark,
// crouches, then rushes off in its facing direction, accelerating hard, legs
// pumping, with fireworks sprayed backwards off every wheel. Done once it is
// off screen and the last spark and feather are gone.
// Gentle: the feathers fall straight down and the bare bird fades where it stands.
import { drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import type { Animal, World } from "../../world";
import { type Body, bodyOf } from "../draw";
import { OST_BOX, type OstrichPose, drawOstrich, emitSkateSparks, skatePose } from "../ostrich";
import type { FinishModule } from "../types";

export const SHOCK_TIME = 0.5;
export const CROUCH_TIME = 0.16;
export const RUSH_SPEED = 0.26; // widths per second as it sets off (the x2.6 skate)
export const RUSH_ACCEL = 3.6; // widths per second, per second
export const GENTLE_FADE = 0.7;
const SPARKS_AT = 0.3; // into the shock
const PUMP = 0.2; // seconds per stride in the rush
const FRAME = 1 / 60; // sparks are counted per 60 Hz step, whatever the frame rate
const FEATHERS = ["#ff8a1f", "#ff3d8b", "#1fe0c4", "#9b5cff"];
const CREST = "#9b5cff";

export type PluckedState = Body & {
  W: number;
  x0: number;
  vx: number;
  k: number; // px per 96 px of bird: particle sizes and speeds scale with it
  pose: OstrichPose;
  alpha: number;
  acc: number;
  shouted: boolean;
  reduced: boolean;
  parts: Particle[];
  rng: Rng;
};

/** Box units (130 x 180, facing right) to world px. */
function at(s: PluckedState, bx: number, by: number): [number, number] {
  const u = s.w / OST_BOX[0];
  return [s.x + (s.dir < 0 ? OST_BOX[0] - bx : bx) * u, s.y + by * u];
}

function feathers(s: PluckedState, n: number, box: [number, number, number, number], colors: readonly string[], fall: boolean): void {
  const { rng, k } = s;
  for (let i = 0; i < n; i++) {
    const [x, y] = at(s, box[0] + rng() * (box[2] - box[0]), box[1] + rng() * (box[3] - box[1]));
    const ang = -Math.PI / 2 + (rng() - 0.5) * Math.PI * 1.6;
    const sp = fall ? 0 : (120 + rng() * 220) * k;
    emit(s.parts, {
      kind: "dot",
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      drag: 2.6,
      g: 70 * k,
      life: 2.6 + rng() * 0.8,
      size: (4 + rng() * 3) * k,
      spin: fall ? 0.01 : (rng() - 0.5) * 8 || 0.01, // a spinning dot is a feather
      color: colors[Math.floor(rng() * colors.length)],
    });
  }
}

function start(c: Animal, world: World, rng: Rng): PluckedState {
  const b = bodyOf(c, world);
  return {
    ...b,
    W: world.width,
    x0: b.x,
    vx: 0,
    k: b.w / 96,
    pose: skatePose(0, 1),
    alpha: 1,
    acc: 0,
    shouted: false,
    reduced: false,
    parts: [],
    rng,
  };
}

function burstFeathers(s: PluckedState): void {
  feathers(s, 40, [8, 60, 100, 112], FEATHERS, s.reduced);
  feathers(s, 5, [88, 4, 106, 16], [CREST], s.reduced);
}

function shout(s: PluckedState, out: Parameters<FinishModule<PluckedState>["step"]>[2]): void {
  if (s.shouted) return;
  s.shouted = true;
  const [x, y] = at(s, 98, -6);
  out.push({ type: "callout", text: "!!", x, y });
}

const offScreen = (s: PluckedState) => (s.dir > 0 ? s.x > s.W : s.x + s.w < 0);

function draw(ctx: CanvasRenderingContext2D, s: PluckedState, art: Art, scratch: HTMLCanvasElement): void {
  if (s.alpha > 0 && !offScreen(s)) {
    drawOstrich(ctx, art, scratch, s, s.pose, { tail: false, wing: false, collar: false, bare: true, shock: true }, s.flash, s.alpha);
  }
  drawParticles(ctx, s.parts, art);
}

export const plucked: FinishModule<PluckedState> = {
  start,
  step(s, dt, out) {
    if (s.age === 0) burstFeathers(s);
    shout(s, out);
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    const t = s.age;
    const rushAt = SHOCK_TIME + CROUCH_TIME;
    let strength = 0;
    if (t < SHOCK_TIME) {
      s.x = s.x0 + Math.sin(t * 90) * 2 * s.k;
      s.pose = { ...skatePose(0, 1), lN: 0, lF: 0, neck: -6, tilt: 0 };
      if (t > SPARKS_AT) strength = 0.8;
    } else if (t < rushAt) {
      const q = (t - SHOCK_TIME) / CROUCH_TIME;
      s.x = s.x0;
      s.pose = { lN: 0, lF: 0, bob: 0, neck: -6 + 14 * q, tilt: 6 * q, sq: 1 - 0.1 * Math.sin((q * Math.PI) / 2) };
      strength = 1.4;
    } else {
      if (s.vx === 0) s.vx = RUSH_SPEED * s.W;
      s.vx += RUSH_ACCEL * s.W * dt;
      if (!offScreen(s)) s.x += s.dir * s.vx * dt; // gone: it waits there for its feathers to settle
      const ph = ((t - rushAt) / PUMP) * Math.PI * 2;
      s.pose = { lN: Math.sin(ph) * 32 + 8, lF: -Math.sin(ph) * 32 + 8, neck: 12, tilt: 10, bob: -Math.abs(Math.sin(ph)) * 4, sq: 1 };
      strength = 2.6;
    }
    s.acc += dt;
    while (s.acc >= FRAME) {
      s.acc -= FRAME;
      if (strength > 0 && !offScreen(s)) {
        emitSkateSparks(s.parts, (bx, by) => at(s, bx, by), s.dir > 0 ? -1 : 1, [s.pose.lN, s.pose.lF], strength / 2, s.k, s.rng);
      }
    }
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => offScreen(s) && s.parts.length === 0,
  draw,
  reduced: "plucked-gentle",
};

export const pluckedGentle: FinishModule<PluckedState> = {
  start,
  step(s, dt, out) {
    if (s.age === 0) {
      s.reduced = true;
      burstFeathers(s);
    }
    shout(s, out);
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    s.pose = { ...skatePose(0, 1), lN: 0, lF: 0 };
    s.alpha = Math.max(0, 1 - s.age / GENTLE_FADE);
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => s.alpha === 0 && s.parts.length === 0,
  draw,
};
