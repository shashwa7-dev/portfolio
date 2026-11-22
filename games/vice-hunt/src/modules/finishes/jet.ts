// Bigfoot's finish, all on the rig: the hit's recoil, a proper squat (hips
// drop, knees bend over planted feet, hands on knees, a settle), the strain,
// one push, "PFFT!" and a pile drops behind him (squash-bounce, green stink).
// He shifts into the launch pose, leans back onto it and blasts off
// diagonally up and away in his facing direction, accelerating, with a brown
// spray, green smoke and chunks falling behind him. The pile is flung at the
// camera as a big central "SPLAT!", then three more globs splat the glass.
// Done once he is off screen and the last glob and puff are gone.
// Gentle: the squat and strain, then he fades; the splats appear in place.
import type { Glass } from "../../fx/glass";
import { addSplat, shake } from "../../fx/glass";
import { drift, driftDrag, drawParticles, emit, stepParticles, type Particle } from "../../fx/particles";
import { drawRig } from "../../rig/drawRig";
import { LAUNCH_AT, POSES, RIG, copy, finishPose, rigTop, toWorld, type Pose } from "../../rig/rig";
import type { Rng } from "../../rng";
import type { Art } from "../../sprites";
import type { GameEvent } from "../../events";
import type { Animal, World } from "../../world";
import { type Body, bodyOf } from "../draw";
import { cubicBezier, keyframes, type Key } from "../ease";
import { type Glob, drawGlobs, launchGlob, stepGlobs } from "../threats/glob";
import type { FinishModule } from "../types";

export const PILE_AT = 1.5;
export const PILE_TIME = 0.34;
export const GLOB_EVERY = 0.35;
export const EXTRA_GLOBS = 3;
export const GENTLE_FADE_AT = 1.6;
export const GENTLE_FADE_FOR = 0.6;
const STINK_EVERY = 0.15;
const STINK_PUFFS = 13;
const TILT = -22; // degrees, leaning back onto the jet
const TILT_TIME = 0.25;
const CLIMB = 32 * (Math.PI / 180); // above the horizontal
const PILE_ASPECT = 104 / 120;
const STAGE = 1280;
const FRAME = 1 / 60; // the exhaust is counted per 60 Hz step
const DEG = Math.PI / 180;
const BROWN = ["#6e4024", "#7a4a2a", "#8a5634"];
const STINK = "rgba(130,190,80,.5)";
const SMOKE = "rgba(130,190,80,.45)";
const pileEase = cubicBezier(0, 0, 0.58, 1); // CSS "ease-out"
const chunkEase = cubicBezier(0.4, 0, 1, 1);

type Squash = { dy: number; sx: number; sy: number };
const PILE_KEYS: Key<Squash>[] = [
  { at: 0, dy: -24, sx: 0.85, sy: 1.2 },
  { at: 0.55, dy: 0, sx: 1.12, sy: 0.86 },
  { at: 0.8, dy: 0, sx: 0.97, sy: 1.04 },
  { at: 1, dy: 0, sx: 1, sy: 1 },
];

type Pile = { x: number; y: number; w: number; age: number; puffs: number; next: number };
type Chunk = { x: number; y: number; dx: number; dy: number; w: number; age: number };

export type JetState = Body & {
  W: number;
  H: number;
  scale: number; // sprite space to px
  top: number; // the rig box's top when standing
  x0: number;
  jy: number; // px climbed (negative is up)
  jv: number;
  jetT: number; // seconds since lift-off, or -1
  pile: Pile | null;
  piled: boolean;
  globAt: number;
  extra: number; // globs thrown after the main one
  splats: number;
  gone: boolean;
  alpha: number;
  acc: number;
  reduced: boolean;
  parts: Particle[];
  globs: Glob[];
  chunks: Chunk[];
  rng: Rng;
};

function start(c: Animal, world: World, rng: Rng): JetState {
  const b = bodyOf(c, world);
  const scale = b.w / RIG.W;
  return {
    ...b,
    W: world.width,
    H: world.height,
    scale,
    top: rigTop(b.y + b.h + b.fall, scale),
    x0: b.x,
    jy: 0,
    jv: 0,
    jetT: -1,
    pile: null,
    piled: false,
    globAt: 0,
    extra: 0,
    splats: 0,
    gone: false,
    alpha: 1,
    acc: 0,
    reduced: false,
    parts: [],
    globs: [],
    chunks: [],
    rng,
  };
}

const K = (s: JetState) => s.W / STAGE;
const at = (s: JetState, sx: number, sy: number) => toWorld(sx, sy, s.x, s.top, s.scale, s.dir);

function splatDown(s: JetState, g: Glob, glass: Glass | undefined, out: GameEvent[]): void {
  if (glass) addSplat(glass, g.x1, g.y1, g.r, g.main, s.rng, s.reduced);
  if (glass && !s.reduced) shake(glass, 5, 0.22);
  if (s.splats++ === 0) out.push({ type: "callout", text: "SPLAT!", x: g.x1, y: g.y1 - g.r * 1.6 });
}

function dropPile(s: JetState, out: GameEvent[]): void {
  s.piled = true;
  const w = 34 * s.scale * 1.4;
  const [bx, by] = at(s, POSES.squat.rx - 12, RIG.GROUND);
  s.pile = { x: bx - w / 2, y: by - w * 0.86, w, age: 0, puffs: 0, next: 0 };
  out.push({ type: "callout", text: "PFFT!", x: bx, y: s.pile.y - 24 * K(s) });
}

function stink(s: JetState, p: Pile, dt: number): void {
  p.age += dt;
  p.next -= dt;
  while (p.next <= 0 && p.puffs < STINK_PUFFS) {
    p.next += STINK_EVERY;
    p.puffs += 1;
    const life = 1;
    emit(s.parts, {
      kind: "dot",
      x: p.x + p.w * (0.3 + s.rng() * 0.4),
      y: p.y + p.w * 0.1,
      vx: drift((s.rng() - 0.5) * 18, life),
      vy: drift(-46 * K(s), life),
      drag: driftDrag(life),
      life,
      size: (9 * K(s) * 1.3 * 0.6) / 2,
      grow: 3,
      color: STINK,
    });
  }
}

// The main glob: the pile itself, flung at the middle of the screen.
function fling(s: JetState): void {
  const p = s.pile;
  if (!p) return;
  s.pile = null;
  const u = Math.min(s.W, s.H);
  s.globs.push(launchGlob(p.x + p.w / 2, p.y + p.w / 2, 0.5 * s.W, 0.42 * s.H, 0.13 * u, true, s.W, s.H));
}

// Exhaust from his rear, aimed back and down: brown spray, green smoke and
// now and then a chunk dropping away under gravity.
function exhaust(s: JetState): void {
  const { rng } = s;
  const k = K(s);
  const [ex, ey0] = at(s, POSES.jet.rx - 16, POSES.jet.ry + 10);
  const ey = ey0 + s.jy;
  const back = -s.dir;
  for (let i = 0; i < 3; i++) {
    const life = 0.52;
    emit(s.parts, {
      kind: "dot",
      x: ex,
      y: ey,
      vx: drift(back * (60 + rng() * 70) * k, life),
      vy: drift((50 + rng() * 80) * k, life),
      drag: driftDrag(life),
      life,
      size: ((6 + rng() * 7) * k * 1.4 * 0.6) / 2,
      grow: 3,
      color: BROWN[i],
    });
  }
  if (rng() < 0.5) {
    emit(s.parts, {
      kind: "smoke",
      x: ex,
      y: ey,
      vx: drift(back * 50 * k, 0.9),
      vy: drift(20 * k, 0.9),
      drag: driftDrag(0.9),
      life: 0.9,
      size: (16 * k * 1.4 * 0.6) / 2,
      grow: 3,
      color: SMOKE,
    });
  }
  if (rng() < 0.18) s.chunks.push({ x: ex, y: ey, dx: back * 60 * k, dy: 0.5 * s.H, w: 14 * k * 1.3, age: 0 });
  if (s.jetT >= s.globAt && s.extra < EXTRA_GLOBS) {
    const u = Math.min(s.W, s.H);
    s.globs.push(
      launchGlob(ex, ey, (0.25 + rng() * 0.5) * s.W, (0.2 + rng() * 0.5) * s.H, (0.04 + rng() * 0.04) * u, false, s.W, s.H),
    );
    s.extra += 1;
    s.globAt += GLOB_EVERY;
  }
}

const offScreen = (s: JetState) => s.x + s.w < -0.3 * s.W || s.x > 1.3 * s.W || s.jy < -1.1 * s.H;

function poseOf(s: JetState): Pose {
  if (s.jetT < 0) return finishPose(Math.min(s.age, LAUNCH_AT));
  const p = copy(POSES.jet);
  p.rx += Math.sin(s.jetT * 70) * 0.8;
  p.uF += Math.sin(s.jetT * 22) * 10;
  p.uN += Math.sin(s.jetT * 22 + 1) * 10;
  return p;
}

function draw(ctx: CanvasRenderingContext2D, s: JetState, art: Art): void {
  drawParticles(ctx, s.parts, art);
  const img = art.extra.pile;
  for (const c of s.chunks) {
    const k = chunkEase(Math.min(1, c.age / 0.9));
    ctx.save();
    ctx.translate(c.x + c.dx * k, c.y + c.dy * k);
    ctx.rotate(300 * k * DEG);
    ctx.drawImage(img, -c.w / 2, -(c.w * PILE_ASPECT) / 2, c.w, c.w * PILE_ASPECT);
    ctx.restore();
  }
  if (s.pile) {
    const p = s.pile;
    const q = keyframes(PILE_KEYS, pileEase(Math.min(1, p.age / PILE_TIME)));
    const h = p.w * PILE_ASPECT;
    ctx.save();
    ctx.globalAlpha *= s.alpha;
    ctx.translate(p.x + p.w / 2, p.y + q.dy * s.scale + h / 2);
    ctx.scale(q.sx, q.sy);
    ctx.drawImage(img, -p.w / 2, -h / 2, p.w, h);
    ctx.restore();
  }
  if (s.gone || s.alpha <= 0) return;
  const pose = poseOf(s);
  const tilt = s.jetT < 0 ? 0 : (Math.min(1, s.jetT / TILT_TIME) * TILT + Math.sin(s.jetT * 40) * 2) * DEG;
  const opt = { rot: tilt, px: 80, py: 162, alpha: s.alpha };
  const mirrored = s.dir < 0;
  drawRig(ctx, pose, s.x, s.top + s.jy, s.scale, mirrored, opt);
  if (s.flash > 0) drawRig(ctx, pose, s.x, s.top + s.jy, s.scale, mirrored, { ...opt, white: true });
}

function stepCommon(s: JetState, dt: number, out: GameEvent[], glass: Glass | undefined): void {
  s.age += dt;
  s.flash = Math.max(0, s.flash - dt);
  stepGlobs(s.globs, dt, (g) => splatDown(s, g, glass, out));
  stepParticles(s.parts, dt, 0);
  for (const c of s.chunks) c.age += dt;
  s.chunks = s.chunks.filter((c) => c.age < 0.9);
}

export const jet: FinishModule<JetState> = {
  start,
  step(s, dt, out, glass) {
    stepCommon(s, dt, out, glass);
    if (s.pile) stink(s, s.pile, dt);
    if (!s.piled && s.age >= PILE_AT) dropPile(s, out);
    if (s.jetT < 0 && s.age >= LAUNCH_AT) {
      // Lift-off: jet-propelled by his own business.
      s.jetT = 0;
      s.jv = 0.06 * s.W;
      s.globAt = 0.12;
      fling(s);
    }
    if (s.jetT < 0 || s.gone) return;
    s.jetT += dt;
    s.jv += 0.9 * s.W * dt;
    s.x += s.dir * Math.cos(CLIMB) * s.jv * dt;
    s.jy -= Math.sin(CLIMB) * s.jv * dt;
    s.acc += dt;
    while (s.acc >= FRAME) {
      s.acc -= FRAME;
      exhaust(s);
    }
    if (offScreen(s)) s.gone = true;
  },
  done: (s) => s.gone && s.globs.length === 0 && s.parts.length === 0 && s.chunks.length === 0,
  draw: (ctx, s, art) => draw(ctx, s, art),
  drawGlass: (ctx, s, art) => drawGlobs(ctx, s.globs, art),
  reduced: "jet-gentle",
};

export const jetGentle: FinishModule<JetState> = {
  start,
  step(s, dt, out, glass) {
    s.reduced = true;
    stepCommon(s, dt, out, glass);
    if (!s.piled && s.age >= PILE_AT) {
      dropPile(s, out);
      // The pile and three globs splat in place, gently, with no flight.
      const u = Math.min(s.W, s.H);
      splatDown(s, launchGlob(0, 0, 0.5 * s.W, 0.42 * s.H, 0.13 * u, true, s.W, s.H), glass, out);
      for (let i = 0; i < EXTRA_GLOBS; i++) {
        const r = (0.04 + s.rng() * 0.04) * u;
        splatDown(s, launchGlob(0, 0, (0.25 + s.rng() * 0.5) * s.W, (0.2 + s.rng() * 0.5) * s.H, r, false, s.W, s.H), glass, out);
      }
    }
    s.alpha = 1 - Math.max(0, Math.min(1, (s.age - GENTLE_FADE_AT) / GENTLE_FADE_FOR));
    if (s.alpha <= 0) {
      s.pile = null;
      s.gone = true;
    }
  },
  done: (s) => s.gone && s.parts.length === 0,
  draw: (ctx, s, art) => draw(ctx, s, art),
};
