// The roller ostrich alive and plucked: its pose maths (pure) and the drawing
// of its parts (art/ostrich.ts) on the canvas, which keeps no state. The legs
// turn about the hip, the neck and its collar about the neck's base; the whole
// bird tilts and bobs about its feet.
import type { Art } from "../sprites";
import { drawSprite } from "./draw";

/** Skate speed for 0, 1 and 2 hits taken (owner: faster on every hit). */
export const SKATE_SPEED = [1, 1.7, 2.6] as const;
export const SKATE_EASE = 5; // per second, toward the new speed
export const STRIDE = 1.0; // seconds per push cycle at x1
export const OST_HIP: readonly [number, number] = [58, 100];
export const OST_NECK: readonly [number, number] = [80, 74];
export const OST_BOX: readonly [number, number] = [130, 180];
/** The skate wheels, in the box, before the leg turns. */
export const OST_WHEELS: readonly [number, number][] = [[56, 172], [77, 172]];

export type OstrichParts = { tail: boolean; wing: boolean; collar: boolean };

/** Feathers left after `hits`: the tail goes first, then the wing and the neck fluff. */
export function ostrichParts(hits: number): OstrichParts {
  return { tail: hits < 1, wing: hits < 2, collar: hits < 2 };
}

/** Leg angles (degrees, + swings back), neck nod and tilt (degrees, + leans
 *  forward), bob (box units, up is negative), squash (1 is none). */
export type OstrichPose = { lN: number; lF: number; neck: number; tilt: number; bob: number; sq: number };

/** Gliding along: one leg pushes back while the other carries; bigger and
 *  leaning further at speed `mul`. `ph` is the push phase in radians. */
export function skatePose(ph: number, mul: number): OstrichPose {
  const amp = 26 + (mul - 1) * 6;
  const s = Math.sin(ph);
  return {
    lN: Math.max(0, s) * amp,
    lF: Math.max(0, -s) * amp,
    neck: Math.sin(ph * 2) * 3 + (mul - 1) * 5,
    tilt: s * 1.5 + (mul - 1) * 3,
    bob: -Math.abs(s) * 3,
    sq: 1,
  };
}

/** A point of the box after the leg it belongs to has turned `deg` about the hip. */
export function legPoint(p: readonly [number, number], deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  const dx = p[0] - OST_HIP[0];
  const dy = p[1] - OST_HIP[1];
  return [OST_HIP[0] + dx * Math.cos(r) - dy * Math.sin(r), OST_HIP[1] + dx * Math.sin(r) + dy * Math.cos(r)];
}

export type OstrichLook = OstrichParts & { bare: boolean; shock: boolean };

/** Draws the bird in its w x h box at (x, y), facing `dir`, in `pose`.
 *  `flash` > 0 lays the white hit flash over every part. */
export function drawOstrich(
  ctx: CanvasRenderingContext2D,
  art: Art,
  scratch: HTMLCanvasElement,
  box: { x: number; y: number; w: number; h: number; dir: 1 | -1 },
  pose: OstrichPose,
  look: OstrichLook,
  flash = 0,
  alpha = 1,
): void {
  const { x, y, w, h, dir } = box;
  const s = w / OST_BOX[0];
  const e = art.extra;
  ctx.save();
  ctx.globalAlpha *= alpha;
  // Into the box, mirrored for a leftward run; tilt and squash about the feet.
  ctx.translate(x + w / 2, y + h + pose.bob * s);
  ctx.scale(dir, 1);
  ctx.rotate((pose.tilt * Math.PI) / 180);
  ctx.scale(2 - pose.sq, pose.sq);
  ctx.translate(-w / 2, -h);
  const part = (img: HTMLImageElement, deg = 0, pivot: readonly [number, number] = OST_HIP) => {
    ctx.save();
    if (deg) {
      ctx.translate(pivot[0] * s, pivot[1] * s);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.translate(-pivot[0] * s, -pivot[1] * s);
    }
    drawSprite(ctx, scratch, img, w, h, flash);
    ctx.restore();
  };
  part(e.ostLegF, pose.lF);
  part(e.ostLegN, pose.lN);
  if (look.bare) part(e.ostBare);
  else {
    if (look.tail) part(e.ostTail);
    part(e.ostBody);
    if (look.wing) part(e.ostWing);
  }
  part(look.shock ? e.ostNeckShock : e.ostNeck, pose.neck, OST_NECK);
  if (look.collar && !look.bare) part(e.ostCollar, pose.neck, OST_NECK);
  ctx.restore();
}
