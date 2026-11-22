// The merman's finish: he drops under, then the sea shoots up a fountain of
// 26 small fish that fan out, arc over and dive back in, each with a little
// splash. Gentle: he sinks, and a few fish fade in and out above the water.
import {
  type Particle,
  type Ring,
  drawParticles,
  drawRings,
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

export const FISH_COUNT = 26;
export const SINK_TIME = 0.3;
export const FOUNTAIN_AT = 0.26; // the sea answers just as he is under
export const STAGGER = 0.55;
export const GENTLE_FOUNTAIN_TIME = 0.75;
export const FISH_COLORS = ["#f49ea3", "#5ad1d6", "#f7c46c", "#9be37c", "#e8789f", "#8fd3ff"];
const SPOUTS = 4; // splashes where the column leaves the water, 0.14 s apart
const SPOUT_GAP = 0.14;
const GENTLE_FISH = 5;

export type FountainState = Body & {
  W: number;
  H: number;
  sea: number; // the water line, px
  cx: number; // where the column rises
  y0: number;
  alpha: number;
  spouts: number; // spout splashes made so far
  fish: Particle[]; // in the air (or waiting their turn); removed as each dives back in
  still: Particle[]; // the gentle version's few fish
  drops: Particle[];
  rings: Ring[]; // every splash, in order
  rng: Rng;
};

function start(c: Animal, world: World, rng: Rng): FountainState {
  const b = bodyOf(c, world);
  const sea = world.sea;
  const cx = b.x + b.w / 2;
  const s: FountainState = {
    ...b,
    W: world.width,
    H: world.height,
    sea,
    cx,
    y0: b.y,
    alpha: 1,
    spouts: 0,
    fish: [],
    still: [],
    drops: [],
    rings: [],
    rng,
  };
  for (let i = 0; i < FISH_COUNT; i++) {
    const spread = rng() - 0.5;
    emit(s.fish, {
      kind: "fish",
      x: cx + spread * 30,
      y: sea,
      vx: spread * 0.32 * world.width, // within ±0.16 of the width
      vy: -(0.75 + rng() * 0.45) * world.height,
      life: Infinity, // gone when it dives back in
      size: (14 + rng() * 10) * 1.3,
      color: FISH_COLORS[i % FISH_COLORS.length],
      delay: FOUNTAIN_AT + (i / FISH_COUNT) * STAGGER + rng() * 0.08,
      spin: rng() * 6, // wiggle phase
    });
  }
  for (let i = 0; i < GENTLE_FISH; i++) {
    emit(s.still, {
      kind: "fish",
      x: cx + (i - (GENTLE_FISH - 1) / 2) * 26,
      y: sea - 26 - (i % 2) * 14,
      vx: i % 2 ? 1 : -1, // facing only
      vy: 0,
      life: Infinity,
      size: 20,
      color: FISH_COLORS[i % FISH_COLORS.length],
      alpha: 0,
      spin: i,
    });
  }
  splash(s.drops, s.rings, cx, sea, true, rng); // he goes under
  return s;
}

function sink(s: FountainState): void {
  const k = Math.min(1, s.age / SINK_TIME);
  s.y = s.y0 + (s.sea + 4 - s.y0) * k * k;
}

// Everything here lives above the water line.
function aboveWater(ctx: CanvasRenderingContext2D, s: FountainState): void {
  ctx.beginPath();
  ctx.rect(0, 0, s.W, s.sea);
  ctx.clip();
}

function drawMerman(ctx: CanvasRenderingContext2D, s: FountainState, art: Art, scratch: HTMLCanvasElement): void {
  if (s.y >= s.sea) return;
  ctx.save();
  aboveWater(ctx, s);
  drawPlaced(ctx, scratch, art.sprites.merman[s.frame], { x: s.x, y: s.y, w: s.w, h: s.h, dir: s.dir, flash: s.flash });
  ctx.restore();
}

export const fountain: FinishModule<FountainState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    sink(s);
    while (s.spouts < SPOUTS && s.age >= FOUNTAIN_AT + s.spouts * SPOUT_GAP) {
      splash(s.drops, s.rings, s.cx + (s.rng() - 0.5) * 20, s.sea, s.spouts === 0, s.rng);
      s.spouts++;
    }
    stepParticles(s.fish, dt, 1.45 * s.H);
    let n = 0;
    for (const f of s.fish) {
      if (f.delay <= 0 && f.vy > 0 && f.y > s.sea) splash(s.drops, s.rings, f.x, s.sea, false, s.rng);
      else s.fish[n++] = f;
    }
    s.fish.length = n;
    stepParticles(s.drops, dt, 0);
    stepRings(s.rings, dt);
  },
  // The last fish is back in and its splash has played.
  done: (s) => s.spouts === SPOUTS && s.fish.length === 0 && s.drops.length === 0 && ringsDone(s.rings),
  draw(ctx, s, art, scratch) {
    drawMerman(ctx, s, art, scratch);
    ctx.save();
    aboveWater(ctx, s);
    drawParticles(ctx, s.fish, art);
    ctx.restore();
    drawRings(ctx, s.rings);
    drawParticles(ctx, s.drops, art);
  },
  reduced: "fountain-gentle",
};

export const fountainGentle: FinishModule<FountainState> = {
  start,
  step(s, dt) {
    s.age += dt;
    s.flash = Math.max(0, s.flash - dt);
    sink(s);
    const k = Math.min(1, Math.max(0, (s.age - 0.15) / (GENTLE_FOUNTAIN_TIME - 0.15)));
    for (const f of s.still) f.alpha = Math.sin(Math.PI * k);
  },
  done: (s) => s.age >= GENTLE_FOUNTAIN_TIME,
  draw(ctx, s, art, scratch) {
    drawMerman(ctx, s, art, scratch);
    drawParticles(ctx, s.still, art);
  },
};
