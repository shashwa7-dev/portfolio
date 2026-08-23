import { hashWith, mulberry32, rr } from "@/lib/card/seed";
import { createEngine } from "@/lib/card/engine/portrait-engine";
import { drawSticker } from "@/lib/card/sticker";
import type { CardData } from "@/lib/card/types";

export const CARD_W = 1200;
export const CARD_H = 1500;

type Fonts = { hand: string; sticker: string; mono: string };

const LIGHT = {
  stock: "#f6f1e5",
  stamp: "#fdfaf2",
  ink: "#1f1d1a",
  faint: "#8a8175",
  veryFaint: "#bdb4a4",
  cancel: "#1f1d1a",
  notch: "#e9e2d2",
};

const DARK = {
  stock: "#17161a",
  // Cream, not black. The vendored engine only ever draws dark ink on cream
  // paper (it has no pale-on-dark mode), so a stamp printed on the card's
  // own stock colour would put a cream portrait on near-black with nothing
  // framing it: the perforation and the stamp rectangle both vanish, and
  // the rarest card in the set stops reading as a stamp. A real inverted
  // cover is a normal stamp stuck to a dark envelope, which is this.
  stamp: "#f6f1e5",
  ink: "#e8e3d8",
  faint: "#8a8175",
  veryFaint: "#6f6a63",
  cancel: "#c9a227",
  notch: "#2a282c",
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Punch paper-coloured bites along the stamp's four edges. */
function perforate(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number, stock: string
) {
  ctx.fillStyle = stock;
  const step = r * 3.3;
  for (let px = x + step / 2; px < x + w; px += step) {
    ctx.beginPath(); ctx.arc(px, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px, y + h, r, 0, Math.PI * 2); ctx.fill();
  }
  for (let py = y + step / 2; py < y + h; py += step) {
    ctx.beginPath(); ctx.arc(x, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w, py, r, 0, Math.PI * 2); ctx.fill();
  }
}

/** Letter-spaced fill, since canvas has no tracking. */
function tracked(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number,
  align: "left" | "right" = "left"
) {
  const chars = Array.from(text);
  const total = chars.reduce((n, c) => n + ctx.measureText(c).width + spacing, -spacing);
  let cx = align === "left" ? x : x - total;
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spacing;
  }
}

/**
 * Draws the whole card at any size.
 *
 * Everything is a fraction of w or h, so the on-screen preview, the 1200x1500
 * export and the gallery thumbnails are the same drawing. There is no second
 * routine to keep in agreement.
 */
export function drawTicket(
  ctx: CanvasRenderingContext2D,
  data: CardData,
  w: number,
  h: number,
  fonts: Fonts
): void {
  const P = data.issue.inverted ? DARK : LIGHT;
  const R = mulberry32(hashWith(data.visitorId, "paper"));

  /* One engine per call, never a shared module-level instance. The vendored
     renderer keeps its ink registers in the factory closure, so two cards drawn
     from one engine would tread on each other's state. The issue gallery draws
     six cards, so this is not hypothetical. */
  const engine = createEngine(ctx, { hand: fonts.hand });

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // stock
  roundRect(ctx, 0, 0, w, h, w * 0.037);
  ctx.fillStyle = P.stock;
  ctx.fill();

  // stamp
  const sx = w * 0.202, sy = h * 0.101, sw = w * 0.597, sh = h * 0.507;
  ctx.fillStyle = P.stamp;
  ctx.fillRect(sx, sy, sw, sh);
  perforate(ctx, sx, sy, sw, sh, w * 0.0112, P.stock);

  // inner rule. Commemorative gets a second one, Misprint prints it twice off-register.
  //
  // The stamp itself is always cream (LIGHT.stamp and DARK.stamp are the
  // same pale colour), because the engine only draws dark portraits on
  // light paper. Anything drawn on top of the stamp has to use the dark,
  // LIGHT-mode ink to stay legible against that cream, even on an Inverted
  // card whose stock and P.ink are otherwise dark and pale. P.ink is only
  // right for what sits on the card stock beyond the stamp's edge.
  ctx.strokeStyle = LIGHT.ink;
  if (data.issue.key === "misprint") {
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = w * 0.0034;
    ctx.strokeRect(sx + w * 0.039, sy + h * 0.029, sw - w * 0.06, sh - h * 0.047);
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = w * 0.0034;
  ctx.strokeRect(sx + w * 0.03, sy + h * 0.024, sw - w * 0.06, sh - h * 0.047);
  if (data.issue.key === "commemorative") {
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = w * 0.0019;
    ctx.strokeRect(sx + w * 0.045, sy + h * 0.036, sw - w * 0.09, sh - h * 0.07);
  }
  ctx.globalAlpha = 1;

  // portrait. Inverted prints the plate upside down, which is the joke the name makes.
  //
  // The engine seeds itself from the id and casts its own traits, so there is
  // no cast to pass in and no PRNG to thread through. Drawing the same id twice
  // gives the same face, which is what the Misprint double strike relies on.
  const pBox = { x: sx + sw * 0.12, y: sy + sh * 0.06, w: sw * 0.76, h: sh * 0.72 };
  ctx.save();
  if (data.issue.inverted) {
    ctx.translate(pBox.x + pBox.w / 2, pBox.y + pBox.h / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(pBox.x + pBox.w / 2), -(pBox.y + pBox.h / 2));
  }
  if (data.issue.key === "misprint") {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.translate(w * 0.0021, h * 0.0017);
    engine.portrait(data.visitorId, pBox);
    ctx.restore();
  }
  engine.portrait(data.visitorId, pBox);
  ctx.restore();

  // the stamp says the country and the denomination, like a real one
  ctx.fillStyle = P.faint;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `${w * 0.0194}px ${fonts.mono}`;
  tracked(ctx, "SHASHWA7.IN", sx + sw * 0.1, sy + sh * 0.905, w * 0.0028);
  ctx.textAlign = "left";
  tracked(ctx, "ONE VISIT", sx + sw * 0.9, sy + sh * 0.905, w * 0.0028, "right");

  // first day covers carry the legend
  if (data.issue.key === "firstDay") {
    ctx.fillStyle = P.faint;
    ctx.font = `${w * 0.0194}px ${fonts.mono}`;
    tracked(ctx, "FIRST DAY OF ISSUE", w * 0.097, h * 0.645, w * 0.0028);
  }

  // the cancel
  const ccx = w * 0.724, ccy = h * 0.531, cr = w * 0.101;
  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.strokeStyle = P.cancel;
  ctx.fillStyle = P.cancel;
  ctx.lineWidth = w * 0.0052;
  ctx.beginPath(); ctx.arc(ccx, ccy, cr, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = w * 0.0026;
  ctx.beginPath(); ctx.arc(ccx, ccy, cr * 0.81, 0, Math.PI * 2); ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = `${w * 0.0164}px ${fonts.mono}`;
  ctx.fillText((data.issue.key === "firstDay" ? "FIRST DAY" : (data.city ?? "")).toUpperCase(), ccx, ccy - cr * 0.22);
  ctx.font = `${w * 0.028}px ${fonts.mono}`;
  ctx.fillText(data.date.slice(0, 2) + " · " + data.date.slice(3, 6).toUpperCase(), ccx, ccy + cr * 0.15);
  ctx.font = `${w * 0.0164}px ${fonts.mono}`;
  ctx.fillText(data.date.slice(-4), ccx, ccy + cr * 0.48);
  ctx.restore();

  // the name, in handwriting
  ctx.fillStyle = P.ink;
  ctx.textAlign = "center";
  ctx.font = `${w * 0.1}px ${fonts.hand}`;
  ctx.fillText(data.name || "Visitor", w / 2, h * 0.716);

  // tear line, painted, with notches bitten out of both edges
  const ty = h * 0.782;
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = w * 0.0045;
  ctx.setLineDash([w * 0.015, w * 0.019]);
  ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w, ty); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = P.notch;
  ctx.beginPath(); ctx.arc(0, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();

  // the stub: four values on two aligned columns
  const L = w * 0.097, Rt = w * 0.903;
  ctx.fillStyle = P.veryFaint;
  ctx.font = `${w * 0.018}px ${fonts.mono}`;
  ctx.textAlign = "left";
  tracked(ctx, "SERIAL", L, h * 0.848, w * 0.0028);
  tracked(ctx, "ISSUE", Rt, h * 0.848, w * 0.0028, "right");

  ctx.fillStyle = P.ink;
  ctx.font = `${w * 0.0448}px ${fonts.mono}`;
  ctx.textAlign = "left";
  ctx.fillText(data.serial, L, h * 0.893);

  // "Commemorative" overflows the column, so shrink to fit rather than truncate
  ctx.textAlign = "right";
  let issuePx = w * 0.0448;
  ctx.font = `${issuePx}px ${fonts.mono}`;
  const maxIssue = w * 0.36;
  while (ctx.measureText(data.issue.name).width > maxIssue && issuePx > w * 0.02) {
    issuePx -= w * 0.0015;
    ctx.font = `${issuePx}px ${fonts.mono}`;
  }
  ctx.fillStyle = data.issue.inverted ? P.cancel : P.ink;
  ctx.fillText(data.issue.name, Rt, h * 0.893);

  ctx.fillStyle = P.veryFaint;
  ctx.font = `${w * 0.018}px ${fonts.mono}`;
  ctx.textAlign = "left";
  if (data.origin) {
    tracked(ctx, `${data.origin} · ${data.date}`.toUpperCase(), L, h * 0.958, w * 0.0028);
  } else {
    tracked(ctx, data.date.toUpperCase(), L, h * 0.958, w * 0.0028);
  }
  tracked(ctx, `${data.issue.share}% OF CARDS`, Rt, h * 0.958, w * 0.0028, "right");

  // the sticker, applied last so it sits over the stamp
  drawSticker(
    ctx, data.issue.name, data.issue, R,
    w * 0.2, h * 0.55, w * 0.088, fonts.sticker, rr(R, -0.16, -0.08)
  );

  ctx.restore();
}
