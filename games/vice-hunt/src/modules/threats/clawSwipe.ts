// The tiger's retaliation, started once its pounce has landed: it leaps from
// the sand straight at the screen (a front-on hissing face growing to fill
// it), hits the glass with a jolt and "HSSSS!", rakes a paw down-left across
// the screen leaving three claw scratches (the damage lands with them), then
// drops away out of view. The scratches stay on the glass and fade.
// Gentle: no leap, paw or shake; the face fades in at full size, the
// scratches fade in with the damage, the face fades out.
import { CREATURES } from "../../creatures";
import { addScratches, shake } from "../../fx/glass";
import { drift, driftDrag, drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import { GROUND_LINE } from "../../config";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import { damage, type World } from "../../world";
import { cubicBezier, keyframes, type Key } from "../ease";
import type { Origin, ThreatModule } from "../types";

export const LEAP_TIME = 0.46;
export const PAW_AT = 0.68;
export const PAW_TIME = 0.48;
export const SCRATCH_AT = 0.89; // the claw marks and the damage
export const DROP_AT = SCRATCH_AT + 0.06;
export const DROP_TIME = 0.26;
export const CLAW_TIME = DROP_AT + DROP_TIME;
export const GENTLE_IN = 0.3;
export const GENTLE_SCRATCH_AT = 0.5;
export const GENTLE_CLAW_TIME = 0.8;
const FACE_ASPECT = 340 / 400; // tigerFace height / width
const PAW_ASPECT = 220 / 180; // tigerPaw height / width
const DEG = Math.PI / 180;
const STAGE = 1280;
const leapEase = cubicBezier(0.55, 0, 0.85, 0.4); // accelerating at the camera
const pawEase = cubicBezier(0.5, 0, 0.6, 1);
const dropEase = cubicBezier(0.42, 0, 1, 1); // ease-in

type Pose = { x: number; y: number; scale: number; rot: number; alpha: number };

export type ClawState = {
  kind: Origin["kind"];
  W: number;
  H: number;
  hurt: number; // hearts it takes
  reduced: boolean;
  age: number;
  hissed: boolean;
  struck: boolean;
  face: Pose; // centre of the face, px
  fw: number;
  fh: number;
  paw: Pose | null; // top-left of the paw, px
  pw: number;
  ph: number;
  leap: Key<Pose>[]; // the face's keyframes (centre, scale, rotation)
  parts: Particle[];
};

function start(at: Origin, world: World, rng: Rng, reduced: boolean): ClawState {
  const W = world.width;
  const H = world.height;
  const fw = 0.8 * H;
  const cx0 = at.x + at.w / 2;
  const cy0 = at.y + at.h / 2;
  const tx = 0.5 * W;
  const ty = 0.46 * H;
  const threat = CREATURES[at.kind] as { threat?: { kind: string; damage?: number } };
  const s: ClawState = {
    kind: at.kind,
    W,
    H,
    hurt: threat.threat?.kind === "retaliates" ? (threat.threat.damage ?? 0) : 0,
    reduced,
    age: 0,
    hissed: false,
    struck: false,
    face: reduced ? { x: tx, y: ty, scale: 1, rot: 0, alpha: 0 } : { x: cx0, y: cy0, scale: 0.16, rot: 0, alpha: 0 },
    fw,
    fh: fw * FACE_ASPECT,
    paw: null,
    pw: 0.34 * H,
    ph: 0.34 * H * PAW_ASPECT,
    leap: [
      { at: 0, x: cx0, y: cy0, scale: 0.16, rot: 0, alpha: 0 },
      { at: 0.02, x: cx0, y: cy0, scale: 0.16, rot: 0, alpha: 1 },
      { at: 0.5, x: (cx0 + tx) / 2, y: Math.min(cy0, ty) - 0.18 * H, scale: 0.45, rot: 0, alpha: 1 },
      { at: 0.92, x: tx, y: ty, scale: 1, rot: -3 * DEG, alpha: 1 },
      { at: 1, x: tx, y: ty, scale: 1, rot: 0, alpha: 1 },
    ],
    parts: [],
  };
  if (!reduced) {
    // A puff of dust where it pushed off the sand.
    const k = W / STAGE;
    for (let i = 0; i < 5; i++) {
      const big = i === 0;
      const life = big ? 0.6 : 0.45 + rng() * 0.2;
      emit(s.parts, {
        kind: "smoke",
        x: cx0 + (big ? 0 : (rng() - 0.5) * at.w * 0.6),
        y: GROUND_LINE * H - 6 - (big ? 0 : rng() * 8 * k),
        vx: drift(big ? 0 : (rng() - 0.5) * 30 * k, life),
        vy: drift(-(big ? 14 : 8 + rng() * 14) * k, life),
        drag: driftDrag(life),
        life,
        size: ((big ? 30 : 10 + rng() * 10) * k * 1.4 * 0.6) / 2,
        grow: big ? 3 : 2.2,
        color: "rgba(240,220,170,.95)",
      });
    }
  }
  return s;
}

const PAW: Key<Pose>[] = [
  { at: 0, x: 0.76, y: 1.02, rot: 35, scale: 1, alpha: 1 },
  { at: 0.45, x: 0.68, y: 0.04, rot: 20, scale: 1, alpha: 1 },
  { at: 0.75, x: 0.3, y: 0.6, rot: -38, scale: 1, alpha: 1 },
  { at: 1, x: 0.2, y: 1.12, rot: -50, scale: 1, alpha: 1 },
];

function strike(s: ClawState, world: World): void {
  s.struck = true;
  addScratches(world.glass, s.W, s.H, s.reduced);
  if (!s.reduced) shake(world.glass, 10, 0.32);
  damage(world, s.hurt, s.kind, 0.5 * s.W, 0.3 * s.H);
}

function stepFull(s: ClawState, world: World, out: World["events"]): void {
  const t = s.age;
  if (t < LEAP_TIME) {
    s.face = keyframes(s.leap, leapEase(t / LEAP_TIME));
  } else if (t < DROP_AT) {
    s.face = { ...s.leap[s.leap.length - 1] };
  } else {
    // Drops away: down by 18% of its height, fading.
    const k = dropEase(Math.min(1, (t - DROP_AT) / DROP_TIME));
    const end = s.leap[s.leap.length - 1];
    s.face = { ...end, y: end.y + 0.18 * s.fh * k, alpha: 1 - k };
  }
  if (!s.hissed && t >= LEAP_TIME) {
    s.hissed = true;
    shake(world.glass, 6, 0.22);
    out.push({ type: "callout", text: "HSSSS!", x: 0.5 * s.W + s.fw * 0.42, y: 0.46 * s.H - s.fh / 2 + s.fh * 0.08 });
  }
  if (t >= PAW_AT && t < PAW_AT + PAW_TIME) {
    const p = keyframes(PAW, pawEase((t - PAW_AT) / PAW_TIME));
    s.paw = { x: p.x * s.W, y: p.y * s.H, rot: p.rot * DEG, scale: 1, alpha: 1 };
  } else {
    s.paw = null;
  }
  if (!s.struck && t >= SCRATCH_AT) strike(s, world);
}

function stepGentle(s: ClawState, world: World): void {
  const t = s.age;
  const fadeOut = GENTLE_CLAW_TIME - GENTLE_SCRATCH_AT;
  s.face.alpha = Math.min(1, t / GENTLE_IN, Math.max(0, (GENTLE_CLAW_TIME - t) / fadeOut));
  if (!s.struck && t >= GENTLE_SCRATCH_AT) strike(s, world);
}

export const clawSwipe: ThreatModule<ClawState> = {
  start,
  step(s, dt, world, _rng, out) {
    s.age += dt;
    if (s.reduced) stepGentle(s, world);
    else stepFull(s, world, out);
    stepParticles(s.parts, dt, 0);
  },
  done: (s) => s.struck && s.age >= (s.reduced ? GENTLE_CLAW_TIME : CLAW_TIME) && s.parts.length === 0,
  draw(ctx, s, art: Art) {
    drawParticles(ctx, s.parts, art);
    const f = s.face;
    if (f.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = f.alpha;
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.scale(f.scale, f.scale);
      ctx.drawImage(art.extra.tigerFace, -s.fw / 2, -s.fh / 2, s.fw, s.fh);
      ctx.restore();
    }
    if (s.paw) {
      // CSS turns the paw about its own centre.
      ctx.save();
      ctx.translate(s.paw.x + s.pw / 2, s.paw.y + s.ph / 2);
      ctx.rotate(s.paw.rot);
      ctx.drawImage(art.extra.tigerPaw, -s.pw / 2, -s.ph / 2, s.pw, s.ph);
      ctx.restore();
    }
  },
};
