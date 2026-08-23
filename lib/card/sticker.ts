import { rr, type Rand } from "@/lib/card/seed";
import type { Issue } from "@/lib/card/types";

/**
 * Four stacked layers, drawn bottom to top:
 *
 *   1. a dark offset shadow, so the sticker lifts off the paper
 *   2. a fat white stroke, which is the die-cut vinyl edge
 *   3. the tier gradient as a fill
 *   4. a diagonal white stripe over the fill, which is the specular shine
 *
 * The shine angle is seeded, so no two stickers catch the light identically.
 * Issues with a null gradient draw nothing at all.
 */
export function drawSticker(
  ctx: CanvasRenderingContext2D,
  text: string,
  issue: Issue,
  R: Rand,
  cx: number,
  cy: number,
  fontPx: number,
  fontFamily: string,
  angle: number
): void {
  const stops = issue.sticker;
  if (!stops) return;

  const edge = issue.inverted ? "#100f12" : "#ffffff";

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.font = `italic 900 ${fontPx}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const w = ctx.measureText(text).width;

  // 1. lift
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = fontPx * 0.05;
  ctx.shadowOffsetX = fontPx * 0.07;
  ctx.shadowOffsetY = fontPx * 0.08;
  ctx.fillStyle = edge;
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // 2. die-cut edge
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeStyle = edge;
  ctx.lineWidth = fontPx * 0.42;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = edge;
  ctx.fillText(text, 0, 0);

  // 3. the foil
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillText(text, 0, 0);

  // 4. the shine, clipped to the glyphs
  ctx.save();
  const shineAngle = rr(R, 0.14, 0.34);
  const len = w * 0.8;
  const s = ctx.createLinearGradient(
    -Math.cos(shineAngle) * len, -Math.sin(shineAngle) * len,
    Math.cos(shineAngle) * len, Math.sin(shineAngle) * len
  );
  s.addColorStop(0, "rgba(255,255,255,0)");
  s.addColorStop(0.46, "rgba(255,255,255,0)");
  s.addColorStop(0.5, "rgba(255,255,255,0.95)");
  s.addColorStop(0.54, "rgba(255,255,255,0)");
  s.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = s;
  ctx.fillText(text, 0, 0);
  ctx.restore();

  // hairline definition
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = Math.max(0.5, fontPx * 0.012);
  ctx.strokeText(text, 0, 0);

  ctx.restore();
}
