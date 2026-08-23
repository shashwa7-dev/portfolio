import { chance, rr, type Rand } from "@/lib/card/seed";
import type { Cast } from "@/lib/card/types";

type Box = { x: number; y: number; w: number; h: number };

/**
 * A pencil line, not a geometric one.
 *
 * A path stroked at constant width reads as machine made instantly. Every
 * stroke here is walked in short segments whose width varies along the path
 * and whose points wobble, which is the single technique that makes the whole
 * thing look drawn. Ink Folio's write-up calls this out as the trick, and it
 * is the one idea from it worth reimplementing exactly.
 */
function pencil(
  ctx: CanvasRenderingContext2D,
  R: Rand,
  pts: [number, number][],
  width: number,
  ink: string
) {
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < pts.length - 1; i++) {
    const t = i / Math.max(1, pts.length - 2);
    // thin at both ends, full width through the middle
    const taper = 0.35 + 0.65 * Math.sin(Math.PI * t);
    ctx.beginPath();
    ctx.lineWidth = width * taper * rr(R, 0.85, 1.15);
    ctx.moveTo(pts[i][0] + rr(R, -0.4, 0.4), pts[i][1] + rr(R, -0.4, 0.4));
    ctx.lineTo(pts[i + 1][0] + rr(R, -0.4, 0.4), pts[i + 1][1] + rr(R, -0.4, 0.4));
    ctx.stroke();
  }
}

/** Sample an ellipse into points a pencil can walk. */
function ellipsePts(
  cx: number, cy: number, rx: number, ry: number, n = 40, from = 0, to = Math.PI * 2
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

/** Parallel strokes inside a clipped region, for shade. */
function hatch(
  ctx: CanvasRenderingContext2D, R: Rand, box: Box, density: number, ink: string
) {
  const step = Math.max(3, 9 - density * 6);
  ctx.save();
  ctx.globalAlpha = 0.18 + density * 0.16;
  for (let y = box.y; y < box.y + box.h; y += step) {
    pencil(ctx, R,
      [[box.x, y], [box.x + box.w * rr(R, 0.6, 1), y + rr(R, -1.5, 1.5)]],
      0.7, ink);
  }
  ctx.restore();
}

export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  cast: Cast,
  R: Rand,
  box: Box,
  ink: string
): void {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h * 0.5;
  const s = Math.min(box.w, box.h) / 130;
  const faceRx = 40 * s;
  const faceRy = 52 * s;

  ctx.save();

  // face
  pencil(ctx, R, ellipsePts(cx, cy, faceRx, faceRy), 2.1 * s, ink);

  // shade down one cheek
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, faceRx, faceRy, 0, 0, Math.PI * 2);
  ctx.clip();
  hatch(ctx, R,
    { x: cx + faceRx * 0.1, y: cy - faceRy * 0.2, w: faceRx * 0.9, h: faceRy * 1.1 },
    cast.shade, ink);
  ctx.restore();

  // ears
  pencil(ctx, R, ellipsePts(cx - faceRx, cy, 6 * s, 10 * s, 20, Math.PI * 0.5, Math.PI * 1.5), 1.6 * s, ink);
  pencil(ctx, R, ellipsePts(cx + faceRx, cy, 6 * s, 10 * s, 20, Math.PI * 1.5, Math.PI * 2.5), 1.6 * s, ink);

  // hair, back mass
  const hairTop = cy - faceRy * 1.12;
  if (cast.hair !== "buzz") {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(cx - faceRx * 1.08, cy - faceRy * 0.25);
    ctx.quadraticCurveTo(cx - faceRx * 1.15, hairTop, cx, hairTop);
    ctx.quadraticCurveTo(cx + faceRx * 1.15, hairTop, cx + faceRx * 1.08, cy - faceRy * 0.25);
    ctx.quadraticCurveTo(cx + faceRx * 0.6, cy - faceRy * 0.85, cx, cy - faceRy * 0.82);
    ctx.quadraticCurveTo(cx - faceRx * 0.6, cy - faceRy * 0.85, cx - faceRx * 1.08, cy - faceRy * 0.25);
    ctx.fill();
    ctx.restore();
  }

  // long hair falls past the jaw
  if (cast.hair === "long" || cast.hair === "curls") {
    const drop = cast.hair === "curls" ? faceRy * 0.7 : faceRy * 1.15;
    for (const side of [-1, 1]) {
      pencil(ctx, R, [
        [cx + side * faceRx * 1.02, cy - faceRy * 0.4],
        [cx + side * faceRx * 1.12, cy + faceRy * 0.2],
        [cx + side * faceRx * 0.95, cy + drop],
      ], 2 * s, ink);
    }
  }

  // brows
  const browY = cy - faceRy * 0.22;
  for (const side of [-1, 1]) {
    const lift = cast.brow === "arched" ? -2.5 * s : cast.brow === "worried" ? 2 * s : 0;
    pencil(ctx, R, [
      [cx + side * 22 * s - side * 8 * s, browY + (side < 0 ? lift : lift)],
      [cx + side * 22 * s + side * 8 * s, browY + lift * 0.3],
    ], 1.6 * s, ink);
  }

  // eyes
  const eyeY = cy - faceRy * 0.04;
  for (const side of [-1, 1]) {
    pencil(ctx, R, ellipsePts(cx + side * 15 * s, eyeY, 5.5 * s, 4 * s, 22), 1.4 * s, ink);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(cx + side * 15 * s, eyeY, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // nose
  pencil(ctx, R, [
    [cx, cy + faceRy * 0.08],
    [cx - 4 * s, cy + faceRy * 0.28],
    [cx + 3 * s, cy + faceRy * 0.3],
  ], 1.5 * s, ink);

  // mouth
  const mouthY = cy + faceRy * 0.55;
  if (cast.mouth === "smile") {
    pencil(ctx, R, ellipsePts(cx, mouthY - 5 * s, 11 * s, 9 * s, 18, Math.PI * 0.22, Math.PI * 0.78), 1.7 * s, ink);
  } else if (cast.mouth === "line") {
    pencil(ctx, R, [[cx - 9 * s, mouthY], [cx + 9 * s, mouthY]], 1.7 * s, ink);
  } else {
    pencil(ctx, R, ellipsePts(cx, mouthY, 8 * s, 5.5 * s), 1.5 * s, ink);
  }

  // glasses
  if (cast.glasses !== "none") {
    const r = 9 * s;
    for (const side of [-1, 1]) {
      if (cast.glasses === "round") {
        pencil(ctx, R, ellipsePts(cx + side * 15 * s, eyeY, r, r * 0.85, 30), 1.5 * s, ink);
      } else {
        pencil(ctx, R, [
          [cx + side * 15 * s - r, eyeY - r * 0.8],
          [cx + side * 15 * s + r, eyeY - r * 0.8],
          [cx + side * 15 * s + r, eyeY + r * 0.8],
          [cx + side * 15 * s - r, eyeY + r * 0.8],
          [cx + side * 15 * s - r, eyeY - r * 0.8],
        ], 1.5 * s, ink);
      }
    }
    pencil(ctx, R, [[cx - 5 * s, eyeY], [cx + 5 * s, eyeY]], 1.3 * s, ink);
  }

  // headwear, last so it sits over the hair
  if (cast.headwear === "beanie") {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(cx - faceRx * 1.1, cy - faceRy * 0.35);
    ctx.quadraticCurveTo(cx, cy - faceRy * 1.5, cx + faceRx * 1.1, cy - faceRy * 0.35);
    ctx.closePath();
    ctx.fill();
    pencil(ctx, R, [
      [cx - faceRx * 1.14, cy - faceRy * 0.35],
      [cx + faceRx * 1.14, cy - faceRy * 0.35],
    ], 2.6 * s, ink);
  } else if (cast.headwear === "flatCap") {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(cx - faceRx * 1.05, cy - faceRy * 0.5);
    ctx.quadraticCurveTo(cx - faceRx * 0.2, cy - faceRy * 1.35, cx + faceRx * 1.0, cy - faceRy * 0.62);
    ctx.quadraticCurveTo(cx + faceRx * 0.4, cy - faceRy * 0.42, cx - faceRx * 1.05, cy - faceRy * 0.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + faceRx * 0.6, cy - faceRy * 0.62);
    ctx.quadraticCurveTo(cx + faceRx * 1.5, cy - faceRy * 0.6, cx + faceRx * 1.35, cy - faceRy * 0.44);
    ctx.quadraticCurveTo(cx + faceRx * 0.9, cy - faceRy * 0.46, cx + faceRx * 0.6, cy - faceRy * 0.55);
    ctx.fill();
  }

  ctx.restore();
}
