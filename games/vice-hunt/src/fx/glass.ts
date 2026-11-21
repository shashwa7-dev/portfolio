// The "glass" in front of the scene: the tiger's claw scratches and Bigfoot's
// splats, plus the screen shake that goes with them. State and stepping are
// pure; `drawGlass` takes the context and keeps no state. Marks never take
// shots (the glass canvas has pointer-events:none).
import type { Rng } from "../rng";

export const SCRATCH_DRAW = 0.15; // each scratch draws in over this
export const SCRATCH_STAGGER = 0.035;
export const SCRATCH_FADE_AT = 1.5; // after it has drawn in
export const SCRATCH_FADE_FOR = 1.6;
export const SPLAT_FADE_AT = 3.5;
export const SPLAT_FADE_FOR = 0.9;
const SPLAT_POP = 0.22;
const DRIP_AT = 0.2;
const DRIP_FOR = 1.8;
const GENTLE_IN = 0.3; // reduced motion: marks fade in instead of drawing in
const STAGE = 1280; // the prototype's stage width; its px figures scale from it

type Base = {
  age: number;
  delay: number; // seconds before it starts
  fadeAt: number; // age (after the delay) when it starts to fade
  fadeFor: number;
  gentle: boolean;
};

export type Scratch = Base & {
  kind: "scratch";
  x1: number;
  y1: number;
  cx: number; // the quadratic's control point
  cy: number;
  x2: number;
  y2: number;
  k: number; // stroke scale
};

export type Splat = Base & {
  kind: "splat";
  x: number;
  y: number;
  r: number;
  main: boolean;
  outline: number[]; // x, y pairs of the 14-lobe blob
  flecks: number[]; // x, y, r triples
  drips: number[]; // x, length pairs
};

export type Mark = Scratch | Splat;

export type Glass = {
  marks: Mark[];
  shakes: { age: number; dur: number; amp: number }[];
};

export const createGlass = (): Glass => ({ marks: [], shakes: [] });

/** Three claw scratches raked down-left across the screen. */
export function addScratches(glass: Glass, width: number, height: number, gentle = false): void {
  const k = width / STAGE;
  for (let i = 0; i < 3; i++) {
    const dx = (i - 1) * 0.06 * width;
    const x1 = 0.7 * width + dx;
    const y1 = 0.1 * height + i * 0.02 * height;
    const x2 = 0.32 * width + dx;
    const y2 = 0.84 * height + i * 0.02 * height;
    glass.marks.push({
      kind: "scratch",
      x1,
      y1,
      cx: (x1 + x2) / 2 + 0.02 * width,
      cy: (y1 + y2) / 2,
      x2,
      y2,
      k,
      age: 0,
      delay: gentle ? 0 : i * SCRATCH_STAGGER,
      fadeAt: SCRATCH_DRAW + SCRATCH_FADE_AT,
      fadeFor: SCRATCH_FADE_FOR,
      gentle,
    });
  }
}

/** An irregular blob with flecks and drips (one drip, or three on a main splat). */
export function addSplat(glass: Glass, x: number, y: number, r: number, main: boolean, rng: Rng, gentle = false): Splat {
  const outline: number[] = [];
  const pts = 14;
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = r * (0.72 + rng() * 0.5) * (i % 2 ? 1.18 : 0.88);
    outline.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.86);
  }
  const flecks: number[] = [];
  for (let i = 0; i < 5; i++) {
    const a = rng() * Math.PI * 2;
    const d = r * (1.3 + rng() * 0.9);
    flecks.push(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.07 + rng() * 0.1));
  }
  const drips: number[] = [];
  for (let i = 0; i < (main ? 3 : 1); i++) drips.push(x + (rng() - 0.5) * r, r * (0.8 + rng() * 1.4));
  const s: Splat = {
    kind: "splat",
    x,
    y,
    r,
    main,
    outline,
    flecks,
    drips,
    age: 0,
    delay: 0,
    fadeAt: SPLAT_FADE_AT,
    fadeFor: SPLAT_FADE_FOR,
    gentle,
  };
  glass.marks.push(s);
  return s;
}

/** A screen jolt of `amp` px over `dur` s (skipped by the caller under reduced motion). */
export function shake(glass: Glass, amp: number, dur: number): void {
  glass.shakes.push({ age: 0, dur, amp });
}

export function stepGlass(glass: Glass, dt: number): void {
  let n = 0;
  for (const m of glass.marks) {
    if (m.delay > 0) m.delay = Math.max(0, m.delay - dt);
    else m.age += dt;
    if (m.age < m.fadeAt + m.fadeFor) glass.marks[n++] = m;
  }
  glass.marks.length = n;
  for (const s of glass.shakes) s.age += dt;
  glass.shakes = glass.shakes.filter((s) => s.age < s.dur);
}

/** The current shake offset, px; a damped wobble that ends at rest. */
export function shakeOffset(glass: Glass): { dx: number; dy: number } {
  let dx = 0;
  let dy = 0;
  for (const s of glass.shakes) {
    const k = s.age / s.dur;
    const a = s.amp * (1 - k);
    dx += Math.sin(k * Math.PI * 5) * a;
    dy += Math.cos(k * Math.PI * 6) * a * 0.6;
  }
  return { dx, dy };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Opacity from the fade-out (and the gentle fade-in).
function alphaOf(m: Mark): number {
  if (m.delay > 0) return 0;
  const out = 1 - clamp01((m.age - m.fadeAt) / m.fadeFor);
  return m.gentle ? Math.min(out, clamp01(m.age / GENTLE_IN)) : out;
}

const SCRATCH_STROKES: [string, number][] = [
  ["rgba(20,12,30,.82)", 18 * 1.3],
  ["rgba(122,35,53,.85)", 9 * 1.3],
  ["rgba(255,255,255,.75)", 2.5 * 1.3],
];

function drawScratch(ctx: CanvasRenderingContext2D, m: Scratch): void {
  const drawn = m.gentle ? 1 : clamp01(m.age / SCRATCH_DRAW) ** 2; // ease-in
  if (drawn <= 0) return;
  const steps = Math.max(2, Math.ceil(24 * drawn));
  for (const [color, width] of SCRATCH_STROKES) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width * m.k;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * drawn;
      const u = 1 - t;
      const x = u * u * m.x1 + 2 * u * t * m.cx + t * t * m.x2;
      const y = u * u * m.y1 + 2 * u * t * m.cy + t * t * m.y2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawSplat(ctx: CanvasRenderingContext2D, m: Splat): void {
  // Pops in (0.6 → 1.08 → 1) unless gentle.
  let sc = 1;
  if (!m.gentle && m.age < SPLAT_POP) {
    const k = m.age / SPLAT_POP;
    sc = k < 0.55 ? 0.6 + (1.08 - 0.6) * (1 - (1 - k / 0.55) ** 3) : 1.08 - 0.08 * ((k - 0.55) / 0.45);
  }
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.scale(sc, sc);
  ctx.translate(-m.x, -m.y);
  // Drips first, so the blob covers where they start.
  const drip = m.gentle ? 1 : clamp01((m.age - DRIP_AT) / DRIP_FOR) ** 2;
  if (drip > 0) {
    ctx.strokeStyle = "#6e4024";
    ctx.lineWidth = m.r * 0.16;
    for (let i = 0; i < m.drips.length; i += 2) {
      const x = m.drips[i];
      const top = m.y + m.r * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + m.drips[i + 1] * drip);
      ctx.stroke();
    }
  }
  ctx.fillStyle = m.main ? "#6e4024" : "#7a4a2a";
  ctx.strokeStyle = "#3a2216";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < m.outline.length; i += 2) {
    if (i === 0) ctx.moveTo(m.outline[i], m.outline[i + 1]);
    else ctx.lineTo(m.outline[i], m.outline[i + 1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(200,150,100,.6)";
  ctx.beginPath();
  ctx.ellipse(m.x - m.r * 0.3, m.y - m.r * 0.3, m.r * 0.22, m.r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a4a2a";
  for (let i = 0; i < m.flecks.length; i += 3) {
    ctx.beginPath();
    ctx.arc(m.flecks[i], m.flecks[i + 1], m.flecks[i + 2], 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawGlass(ctx: CanvasRenderingContext2D, glass: Glass): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const m of glass.marks) {
    const a = alphaOf(m);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    if (m.kind === "scratch") drawScratch(ctx, m);
    else drawSplat(ctx, m);
  }
  ctx.restore();
}
