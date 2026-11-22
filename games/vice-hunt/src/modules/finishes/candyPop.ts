// The candy gator's finish, all on his rig: his eyes bulge and his mouth goes
// "O", he gulps air in three puffs (his torso widens far more than it grows
// tall, a shine comes up on the tank top), his arms stick out and flail, his
// feet dangle, and he floats off the sand, wobbling, with candies squeezing
// out of his sides. He trembles, then POPS: a white flash and ring and about
// a hundred candies bursting out in every direction, arcing over and raining
// down, his bandana and watch fluttering after them. He stays one body right
// up to the pop. Done once everything has fallen away.
// Gentle: he swells a little and fades, a few candies dropping straight down.
import { randomCandy } from "../../fx/candy";
import { drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import { drawGator } from "../../rig/drawGator";
import {
  GATOR,
  G_POSES,
  type GatorLook,
  type GatorPose,
  blendPose,
  clamp01,
  gatorPoints,
  gatorToWorld,
  gatorTop,
} from "../../rig/gator";
import type { Vec } from "../../rig/rig";
import type { Rng } from "../../rng";
import type { Animal, World } from "../../world";
import { type Body, bodyOf } from "../draw";
import type { FinishModule } from "../types";

export const POP_AT = 1.85;
export const BURST = 100;
export const GENTLE_TIME = 0.6;
const TENSE_AT = 1.45;
const TENSE_FOR = 0.4;
const RING_LIFE = 0.5;
const RISE = 0.2; // of the height, by the pop
const PIVOT: Vec = [80, 110]; // the wobble turns about his middle (sprite space)
const DEG = Math.PI / 180;
const OUT = "#2b2234";

/** The swell over time: three gulps (at 0.3, 0.72 and 1.12 s, each 0.28 s
 *  with a small overshoot), adding up to 1. */
export function puffCurve(t: number): number {
  let p = 0;
  for (const [t0, amt] of [[0.3, 0.3], [0.72, 0.33], [1.12, 0.37]] as const) {
    const k = clamp01((t - t0) / 0.28);
    p += amt * (k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 5) : 1);
  }
  return Math.min(1.04, p);
}

type Item = { kind: "bandana" | "watch"; x: number; y: number; vx: number; vy: number; rot: number; vr: number; g: number; drag: number; age: number; life: number };

export type CandyPopState = Body & {
  W: number;
  H: number;
  scale: number;
  top: number; // the rig box's top, standing
  t: number;
  pose: GatorPose;
  look: GatorLook;
  lift: number; // px risen (negative is up)
  rot: number; // degrees of wobble
  alpha: number;
  popped: boolean;
  popT: number;
  at: Vec; // where he popped, px
  k: number; // px per 120 px of gator
  items: Item[];
  parts: Particle[];
  rng: Rng;
};

function start(c: Animal, world: World, rng: Rng): CandyPopState {
  const b = bodyOf(c, world);
  const scale = b.w / GATOR.W;
  return {
    ...b,
    W: world.width,
    H: world.height,
    scale,
    top: gatorTop({ y: b.y + b.fall, h: b.h, w: b.w }),
    t: 0,
    pose: G_POSES.stand,
    look: { anger: 1, eyes: "shock" },
    lift: 0,
    rot: 0,
    alpha: 1,
    popped: false,
    popT: 0,
    at: [b.x + b.w / 2, b.y + b.h / 2],
    k: b.w / 120,
    items: [],
    parts: [],
    rng,
  };
}

const toWorld = (s: CandyPopState, p: Vec): Vec => gatorToWorld(p, s.x, s.top + s.lift, s.scale, s.dir);

function candy(s: CandyPopState, x: number, y: number, speed: number, ang: number, size: number, straight = false): void {
  const { rng, k } = s;
  emit(s.parts, {
    kind: "candy",
    look: randomCandy(rng),
    x,
    y,
    vx: straight ? 0 : Math.cos(ang) * speed,
    vy: straight ? 20 * k : Math.sin(ang) * speed - 160 * k,
    drag: straight ? 0 : 1.2,
    g: 900 * k,
    life: straight ? 1.1 : 2 + rng() * 0.9,
    size: size / 2,
    spin: straight ? 0 : (rng() - 0.5) * 17,
    color: "",
  });
}

function pop(s: CandyPopState, out: Parameters<FinishModule<CandyPopState>["step"]>[2]): void {
  s.popped = true;
  s.popT = 0;
  const [cx, cy] = toWorld(s, gatorPoints(s.pose, s.look).belly);
  s.at = [cx, cy];
  out.push({ type: "callout", text: "POP!", x: cx, y: cy - 40 * s.k });
  const { rng, k } = s;
  for (let i = 0; i < BURST; i++) candy(s, cx, cy, (220 + rng() * 620) * k, rng() * Math.PI * 2, (24 + rng() * 26) * k);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const sp = (300 + rng() * 200) * k;
    emit(s.parts, { kind: "dot", x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 4, life: 0.5, size: 3.5 * k, color: "#fff7c2" });
  }
  s.items.push(
    { kind: "bandana", x: cx - 10 * k, y: cy - 30 * k, vx: -60 * k, vy: -260 * k, rot: 0, vr: 1.6, g: 180 * k, drag: 1.6, age: 0, life: 3 },
    { kind: "watch", x: cx + 10 * k, y: cy, vx: 90 * k, vy: -300 * k, rot: 0, vr: 7, g: 700 * k, drag: 0.8, age: 0, life: 2.2 },
  );
}

// The falling bandana's paths, built on first use (constants after that).
let bandana: { cloth: Path2D; tails: Path2D } | null = null;
const bandanaPaths = () =>
  (bandana ??= { cloth: new Path2D("M2 20 C4 6 22 0 38 8 C26 10 14 14 2 20 Z"), tails: new Path2D("M4 19 L-2 28 M6 18 L4 29") });
const FLASH = 0.12; // world.ts's hit flash

function drawItem(ctx: CanvasRenderingContext2D, it: Item, k: number): void {
  const a = it.age / it.life;
  ctx.save();
  ctx.globalAlpha *= a > 0.8 ? (1 - a) / 0.2 : 1;
  ctx.translate(it.x + Math.sin(it.age * 3) * 18 * k, it.y);
  ctx.rotate(it.rot);
  ctx.scale(k * 1.15, k * 1.15);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = OUT;
  if (it.kind === "bandana") {
    ctx.translate(-20, -15);
    ctx.fillStyle = "#2f6bff";
    ctx.lineWidth = 1.6;
    const { cloth, tails } = bandanaPaths();
    ctx.fill(cloth);
    ctx.stroke(cloth);
    ctx.strokeStyle = "#1f4fd0";
    ctx.lineWidth = 3;
    ctx.stroke(tails);
  } else {
    ctx.fillStyle = "#ffcc33";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-4, -14, 8, 28, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff8d8";
    ctx.strokeStyle = "#d39a12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function draw(ctx: CanvasRenderingContext2D, s: CandyPopState): void {
  if (!s.popped && s.alpha > 0) {
    const [px, py] = PIVOT;
    drawGator(ctx, s.pose, s.look, s.x, s.top + s.lift, s.scale, s.dir < 0, { rot: s.rot * DEG, px, py, alpha: s.alpha });
    if (s.flash > 0) drawGator(ctx, s.pose, s.look, s.x, s.top + s.lift, s.scale, s.dir < 0, { rot: s.rot * DEG, px, py, white: true, alpha: Math.min(1, s.flash / FLASH) });
  }
  if (s.popped && s.popT < RING_LIFE) {
    const e = 1 - (1 - s.popT / RING_LIFE) ** 3;
    const [cx, cy] = s.at;
    ctx.save();
    ctx.globalAlpha = 1 - e;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 130 * s.k);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,.6)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 130 * s.k * (0.6 + e), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = Math.max(1, 14 * (1 - e) * s.k);
    ctx.beginPath();
    ctx.arc(cx, cy, 160 * s.k * (0.2 + 1.3 * e), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  drawParticles(ctx, s.parts);
  for (const it of s.items) drawItem(ctx, it, s.k);
}

function stepItems(s: CandyPopState, dt: number): void {
  for (const it of s.items) {
    it.age += dt;
    const keep = Math.max(0, 1 - it.drag * dt);
    it.vx *= keep;
    it.vy = it.vy * keep + it.g * dt;
    it.x += it.vx * dt;
    it.y += it.vy * dt;
    it.rot += it.vr * dt;
  }
  s.items = s.items.filter((it) => it.age < it.life);
}

export const candyPop: FinishModule<CandyPopState> = {
  start,
  step(s, dt, out) {
    s.t += dt;
    s.flash = Math.max(0, s.flash - dt);
    if (!s.popped) {
      const st = s.t;
      const p = puffCurve(st);
      const tense = clamp01((st - TENSE_AT) / TENSE_FOR);
      const pose = blendPose(G_POSES.stand, G_POSES.puffed, clamp01(p * 1.3));
      pose.uN += Math.sin(st * 14) * 14 * p;
      pose.uF -= Math.sin(st * 14 + 1) * 14 * p;
      pose.fN = [pose.fN[0] + Math.sin(st * 9) * 4 * p, pose.fN[1]];
      pose.fF = [pose.fF[0] - Math.sin(st * 9 + 1) * 4 * p, pose.fF[1]];
      s.pose = pose;
      s.look = {
        anger: 1,
        puff: p,
        extra: tense * 0.08 + Math.sin(st * 85) * 0.025 * tense,
        eyes: "shock",
        mouth: st > 0.18 ? "o" : "grin",
        flap: Math.sin(st * 9) * 14,
      };
      s.lift = -RISE * s.H * Math.pow(clamp01((st - 0.5) / 1.3), 1.4);
      s.rot = Math.sin(st * 4.5) * 6 * p + Math.sin(st * 70) * 2 * tense;
      // Candies squeeze out of his sides, more as he gets tighter.
      if (p > 0.3 && s.rng() < dt * (4 + 14 * p + 20 * tense)) {
        const side = s.rng() < 0.5 ? -1 : 1;
        const T = (l: Vec) => {
          const [sx, sy] = [1 + 1.55 * p, 1 + 0.7 * p];
          return [s.pose.rx + l[0] * sx, s.pose.ry + l[1] * sy] as Vec;
        };
        const [ex, ey] = toWorld(s, T([side * 30, -20 - s.rng() * 30]));
        const outward = side * s.dir > 0 ? 0 : Math.PI;
        candy(s, ex, ey, (120 + s.rng() * 200) * s.k, outward + (s.rng() - 0.5), (18 + s.rng() * 12) * s.k);
      }
      if (st >= POP_AT) pop(s, out);
    } else {
      s.popT += dt;
    }
    stepItems(s, dt);
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => s.popped && s.popT >= RING_LIFE && s.parts.length === 0 && s.items.length === 0,
  draw,
  reduced: "candy-pop-gentle",
};

export const candyPopGentle: FinishModule<CandyPopState> = {
  start,
  step(s, dt) {
    if (s.t === 0) {
      const [cx, cy] = toWorld(s, gatorPoints(s.pose, s.look).belly);
      for (let i = 0; i < 5; i++) candy(s, cx + (s.rng() - 0.5) * 40 * s.k, cy, 0, 0, (20 + s.rng() * 10) * s.k, true);
    }
    s.t += dt;
    s.flash = Math.max(0, s.flash - dt);
    const k = clamp01(s.t / GENTLE_TIME);
    s.look = { anger: 1, puff: 0.35 * k, eyes: "shock", mouth: "o" };
    s.alpha = 1 - k;
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => s.t >= GENTLE_TIME && s.parts.length === 0,
  draw,
};

