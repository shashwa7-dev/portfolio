// Candies, the gator's ammunition: five shapes drawn with canvas paths in any
// colour (ports of the motion reference's candySVG). Shared by the candies
// stuck on the glass, the ones in flight and the burst. `randomCandy` is pure;
// `drawCandy` takes the context and keeps no state (Path2D objects are
// constants, built on first use).
import type { Rng } from "../rng";

export const CANDY_COLORS = ["#ff3d8b", "#1fc8d6", "#ffcc33", "#8bff3a", "#9b5cff", "#ff8a1f", "#ff2d55"] as const;
export type CandyColor = (typeof CANDY_COLORS)[number];

/** 0 wrapped sweet, 1 swirl lollipop, 2 peppermint, 3 gumdrop, 4 heart. */
export type CandyShape = 0 | 1 | 2 | 3 | 4;
export type CandyLook = { shape: CandyShape; color: CandyColor; color2: CandyColor };

export function randomCandy(rng: Rng): CandyLook {
  const pick = () => CANDY_COLORS[Math.floor(rng() * CANDY_COLORS.length)];
  return { shape: Math.floor(rng() * 5) as CandyShape, color: pick(), color2: pick() };
}

const OUT = "#2b2234";
// Each shape's width in its own units; drawCandy scales it to `size` px.
const WIDTH: Record<CandyShape, number> = { 0: 48, 1: 32, 2: 28, 3: 28, 4: 28 };

const paths = new Map<string, Path2D>();
const path = (d: string): Path2D => {
  let p = paths.get(d);
  if (!p) {
    p = new Path2D(d);
    paths.set(d, p);
  }
  return p;
};

function fill(ctx: CanvasRenderingContext2D, d: string, color: string, outline = true, lw = 2): void {
  const p = path(d);
  ctx.fillStyle = color;
  ctx.fill(p);
  if (outline) {
    ctx.strokeStyle = OUT;
    ctx.lineWidth = lw;
    ctx.stroke(p);
  }
}

function line(ctx: CanvasRenderingContext2D, d: string, color: string, lw: number, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke(path(d));
  ctx.restore();
}

const circle = (r: number, cx = 0, cy = 0) => `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;

function wrapped(ctx: CanvasRenderingContext2D, c: CandyLook): void {
  fill(ctx, "M-12 0 L-22 -9 L-19 0 L-22 9 Z M12 0 L22 -9 L19 0 L22 9 Z", c.color2);
  fill(ctx, circle(11), c.color);
  line(ctx, "M-6 -8 C-2 -2 2 2 6 8 M-10 -2 C-6 2 -2 6 2 10 M-2 -10 C2 -6 6 -2 10 2", "#fff", 2.4, 0.8);
}

function lollipop(ctx: CanvasRenderingContext2D, c: CandyLook): void {
  line(ctx, "M0 12 L0 27", OUT, 5.4);
  line(ctx, "M0 12 L0 27", "#f4efe6", 3);
  fill(ctx, circle(14), c.color);
  line(ctx, "M0 -2 a2 2 0 1 1 -2 2 a4 4 0 1 1 4 4 a6 6 0 1 1 -6 -6 a8 8 0 1 1 8 8 a10 10 0 1 1 -10 -10", "#fff", 2.4);
}

function peppermint(ctx: CanvasRenderingContext2D, c: CandyLook): void {
  fill(ctx, circle(12), "#fff", false);
  fill(ctx, "M0 0 L0 -12 A12 12 0 0 1 10.4 -6 Z M0 0 L10.4 6 A12 12 0 0 1 0 12 Z M0 0 L-10.4 6 A12 12 0 0 1 -10.4 -6 Z", c.color, false);
  line(ctx, circle(12), OUT, 2);
  fill(ctx, circle(3), "#fff", true, 1);
}

function gumdrop(ctx: CanvasRenderingContext2D, c: CandyLook): void {
  fill(ctx, "M-12 10 C-13 -2 -8 -12 0 -12 C8 -12 13 -2 12 10 Z", c.color);
  ctx.save();
  ctx.globalAlpha *= 0.85;
  for (const [x, y] of [[-5, -4], [3, -7], [6, 2], [-2, 4], [-7, 5]]) fill(ctx, circle(1.2, x, y), "#fff", false);
  ctx.restore();
  line(ctx, "M-6 -8 C-4 -10 -2 -10 0 -10", "#fff", 2);
}

function heart(ctx: CanvasRenderingContext2D, c: CandyLook): void {
  fill(ctx, "M0 11 C-14 2 -13 -10 -6 -10 C-3 -10 -1 -8 0 -6 C1 -8 3 -10 6 -10 C13 -10 14 2 0 11 Z", c.color);
  line(ctx, "M-7 -6 C-9 -4 -9 -1 -8 1", "#fff", 2);
}

const SHAPES = [wrapped, lollipop, peppermint, gumdrop, heart] as const;

/** A candy `size` px across, centred on (x, y), turned `rot` radians. */
export function drawCandy(ctx: CanvasRenderingContext2D, c: CandyLook, x: number, y: number, size: number, rot: number): void {
  const s = size / WIDTH[c.shape];
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  SHAPES[c.shape](ctx, c);
  ctx.restore();
}
