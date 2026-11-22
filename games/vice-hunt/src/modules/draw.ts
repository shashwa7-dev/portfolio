// Sprite drawing shared by the body-based finishes. No module state: the
// caller passes the offscreen canvas used for white hit flashes.
import type { Kind } from "../creatures";
import type { Art } from "../sprites";
import type { Animal, World } from "../world";
import { GROUND_LINE } from "../config";

export const FRAME_TIME = 0.18;
export const BIGFOOT_FRAME_TIME = 0.3;

export function frameOf(a: Animal): 0 | 1 {
  if (a.pause > 0) return 0;
  const t = a.kind === "bigfoot" ? BIGFOOT_FRAME_TIME : FRAME_TIME;
  return (Math.floor(a.age / t) % 2) as 0 | 1;
}

// A creature's body as it was at the moment it was finished.
export type Body = {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  dir: 1 | -1;
  frame: 0 | 1;
  fall: number; // px down to the ground line
  flash: number;
  age: number;
};

export function bodyOf(a: Animal, world: World): Body {
  return {
    kind: a.kind,
    x: a.x,
    y: a.y,
    w: a.w,
    h: a.h,
    dir: a.vx < 0 ? -1 : 1,
    frame: frameOf(a),
    fall: Math.max(0, GROUND_LINE * world.height - (a.y + a.h)),
    flash: a.flash,
    age: 0,
  };
}

function whiteSilhouette(c: HTMLCanvasElement, img: HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  const s = c.getContext("2d")!;
  s.globalCompositeOperation = "source-over";
  s.clearRect(0, 0, w, h);
  s.drawImage(img, 0, 0, w, h);
  s.globalCompositeOperation = "source-atop";
  s.fillStyle = "#fff";
  s.fillRect(0, 0, w, h);
  return c;
}

// Sprites face right; mirror for leftward runs. Leaves ctx in sprite space.
export function enterSprite(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, dir: number): void {
  if (dir < 0) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, y);
  }
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  scratch: HTMLCanvasElement,
  img: HTMLImageElement,
  w: number,
  h: number,
  flash: number,
): void {
  ctx.drawImage(img, 0, 0, w, h);
  if (flash > 0) {
    const t = ctx.getTransform();
    const dpr = Math.hypot(t.a, t.b) || 1; // the caller scaled ctx by dpr (mirroring and rotation keep the length)
    ctx.drawImage(whiteSilhouette(scratch, img, Math.ceil(w * dpr), Math.ceil(h * dpr)), 0, 0, w, h);
  }
}

// A sprite box placed at (x, y) (its top-left before any transform), turned
// by `rot` radians and scaled about the pivot (fractions of the box), mirrored
// for leftward travel. Used by the finishes that fly, spin and squash.
export type Place = {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: 1 | -1;
  rot?: number;
  sx?: number;
  sy?: number;
  px?: number;
  py?: number;
  alpha?: number;
  flash?: number;
};

export function drawPlaced(ctx: CanvasRenderingContext2D, scratch: HTMLCanvasElement, img: HTMLImageElement, p: Place): void {
  const alpha = p.alpha ?? 1;
  if (alpha <= 0) return;
  const ox = p.w * (p.px ?? 0.5);
  const oy = p.h * (p.py ?? 0.5);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(p.x + ox, p.y + oy);
  if (p.rot) ctx.rotate(p.rot);
  ctx.scale((p.sx ?? 1) * p.dir, p.sy ?? 1);
  ctx.translate(p.dir > 0 ? -ox : ox - p.w, -oy); // the box stays where it was, mirrored in place
  drawSprite(ctx, scratch, img, p.w, p.h, p.flash ?? 0);
  ctx.restore();
}
