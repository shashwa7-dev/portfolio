// A glob of Bigfoot's poop tumbling at the camera, growing, until it splats
// on the glass. Shared by his throws and his jet. Stepping is pure; `drawGlobs`
// paints on the glass layer and keeps no state.
import type { Art } from "../../sprites";
import { cubicBezier } from "../ease";

export const GLOB_TIME = 0.46;
const PILE_ASPECT = 104 / 120; // the pile art's height / width
const STAGE = 1280;
const flight = cubicBezier(0.5, 0, 0.9, 0.5);

export type Glob = {
  age: number;
  x0: number;
  y0: number;
  x1: number; // where it splats
  y1: number;
  peak: number; // the arc's highest y, at the halfway point
  r: number; // the splat's radius
  main: boolean;
  pw: number; // the glob's drawn width at scale 1
  sEnd: number; // its scale when it lands (2.2 r across)
};

export function launchGlob(x0: number, y0: number, x1: number, y1: number, r: number, main: boolean, W: number, H: number): Glob {
  const pw = 26 * (W / STAGE) * 1.3;
  return { age: 0, x0, y0, x1, y1, peak: Math.min(y0, y1) - 0.12 * H, r, main, pw, sEnd: (r * 2.2) / pw };
}

/** Ages the globs; calls `land` for each one that reaches the glass and drops it. */
export function stepGlobs(list: Glob[], dt: number, land: (g: Glob) => void): void {
  let n = 0;
  for (const g of list) {
    g.age += dt;
    if (g.age >= GLOB_TIME) land(g);
    else list[n++] = g;
  }
  list.length = n;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const DEG = Math.PI / 180;

export function drawGlobs(ctx: CanvasRenderingContext2D, list: readonly Glob[], art: Art): void {
  const img = art.extra.pile;
  for (const g of list) {
    const p = flight(Math.min(1, g.age / GLOB_TIME));
    // Two linear legs (start → top of the arc → glass) under one easing.
    const k = p < 0.5 ? p * 2 : (p - 0.5) * 2;
    const mx = (g.x0 + g.x1) / 2;
    const x = p < 0.5 ? lerp(g.x0, mx, k) : lerp(mx, g.x1, k);
    const y = p < 0.5 ? lerp(g.y0, g.peak, k) : lerp(g.peak, g.y1, k);
    const sMid = (0.6 + g.sEnd) / 2;
    const s = p < 0.5 ? lerp(0.6, sMid, k) : lerp(sMid, g.sEnd, k);
    const rot = p < 0.5 ? lerp(0, 220, k) : lerp(220, 360, k);
    const h = g.pw * PILE_ASPECT;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot * DEG);
    ctx.scale(s, s);
    ctx.drawImage(img, -g.pw / 2, -h / 2, g.pw, h);
    ctx.restore();
  }
}
