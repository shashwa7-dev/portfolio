import { hashWith, mulberry32, rr } from "@/lib/card/seed";
import { createEngine } from "@/lib/card/engine/portrait-engine";
import { drawSticker } from "@/lib/card/sticker";
import type { CardData, IssueKey } from "@/lib/card/types";

export const CARD_W = 1200;
export const CARD_H = 1500;

type Fonts = {
  hand: string;
  sticker: string;
  mono: string;
  /**
   * The brand mark drawn top left. Optional: the caller loads it with
   * `new Image()` and awaits `decode()` before calling drawTicket, so by the
   * time this function runs the image is either ready or the caller gave up
   * and passed null. drawTicket itself never waits on anything.
   */
  mark?: HTMLImageElement | null;
};

/** Per-issue card stock. Kept low enough in chroma to read as a different
 *  batch of paper rather than a coloured card. Inverted's is the one real
 *  departure (a dark envelope, not a warm one), which is unchanged from
 *  before this table existed. */
export const STOCK: Record<IssueKey, string> = {
  definitive: "#f6f1e5", // the base cream, unchanged
  commemorative: "#f4eede", // a touch deeper, a warmer batch
  firstDay: "#eef1ef", // barely cool, the way first day covers lean
  misprint: "#f7efe8", // barely pink, an over-inked run
  inverted: "#17161a", // unchanged
};

const TEAL = "#1f6f78";

const LIGHT = {
  stamp: "#fdfaf2",
  ink: "#1f1d1a",
  faint: "#8a8175",
  veryFaint: "#bdb4a4",
  cancel: "#1f1d1a",
  notch: "#e9e2d2",
};

const DARK = {
  // Cream, not black. The vendored engine only ever draws dark ink on cream
  // paper (it has no pale-on-dark mode), so a stamp printed on the card's
  // own stock colour would put a cream portrait on near-black with nothing
  // framing it: the perforation and the stamp rectangle both vanish, and
  // the rarest card in the set stops reading as a stamp. A real inverted
  // cover is a normal stamp stuck to a dark envelope, which is this. The
  // stamp is its own sheet regardless of card mode, so this must match
  // LIGHT.stamp exactly: every card in the set gets the same paper stuck
  // to it, only the envelope underneath differs.
  stamp: "#fdfaf2",
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

/**
 * Reduce font size in steps until `text` fits `maxWidth`, or the size bottoms
 * out at `minPx`. Leaves `ctx.font` set to whatever size it settled on, so the
 * caller can fillText right after calling this. Used anywhere a value on the
 * card is long enough to run past its column: the issue name in the stub and
 * the visitor's name across the middle of the card share this one loop
 * instead of each growing its own.
 */
function shrinkToFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  startPx: number,
  minPx: number,
  stepPx: number,
  maxWidth: number
): number {
  let px = startPx;
  ctx.font = `${px}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && px > minPx) {
    px -= stepPx;
    ctx.font = `${px}px ${fontFamily}`;
  }
  return px;
}

/** Letter-spaced fill, since canvas has no tracking. */
function tracked(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number,
  align: "left" | "right" | "center" = "left"
) {
  const chars = Array.from(text);
  const total = chars.reduce((n, c) => n + ctx.measureText(c).width + spacing, -spacing);
  let cx = align === "left" ? x : align === "right" ? x - total : x - total / 2;
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
  const stock = STOCK[data.issue.key];
  const R = mulberry32(hashWith(data.visitorId, "paper"));

  /* One engine per call, never a shared module-level instance. The vendored
     renderer keeps its ink registers in the factory closure, so two cards drawn
     from one engine would tread on each other's state. The issue gallery draws
     six cards, so this is not hypothetical. */
  const engine = createEngine(ctx, { hand: fonts.hand });

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // The stamp and everything below it moved down by TOP to make room for
  // the brand row. Every one of those y coordinates is `TOP + <its old
  // fraction of h>`, so this single constant is the only thing that ever
  // needs to change if the band grows or shrinks.
  const TOP = h * 0.038;
  const L = w * 0.097, Rt = w * 0.903;

  // stock
  roundRect(ctx, 0, 0, w, h, w * 0.037);
  ctx.fillStyle = stock;
  ctx.fill();

  // stamp
  const sx = w * 0.202, sy = TOP + h * 0.101, sw = w * 0.597, sh = h * 0.507;
  ctx.fillStyle = P.stamp;
  ctx.fillRect(sx, sy, sw, sh);
  perforate(ctx, sx, sy, sw, sh, w * 0.0112, stock);

  // branding, top left: the mark plus the wordmark, filling the band that
  // used to sit empty above the stamp. Drawn after the stamp so the
  // existing "Nth fillStyle assignment" tests that pin down the stock and
  // stamp fills don't have to move.
  const markSize = w * 0.052;
  const markY = h * 0.052;
  if (fonts.mark) {
    ctx.drawImage(fonts.mark, L, markY, markSize, markSize);
  }
  ctx.fillStyle = P.faint;
  ctx.textAlign = "left";
  ctx.font = `${w * 0.019}px ${fonts.mono}`;
  tracked(ctx, "SHASHWA7.IN", L + markSize + w * 0.022, markY + markSize * 0.66, w * 0.0026);

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
    // The frame rule is something ticket.ts draws and colours itself (no
    // engine ink involved), so it can fringe in real cyan and magenta
    // rather than the portrait's grey. See the note above the portrait
    // ghosts for why the portrait can't do the same.
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(0,174,239,0.55)";
    ctx.lineWidth = w * 0.0034;
    ctx.save();
    ctx.translate(-w * 0.0035, -h * 0.0016);
    ctx.strokeRect(sx + w * 0.039, sy + h * 0.029, sw - w * 0.06, sh - h * 0.047);
    ctx.restore();

    ctx.strokeStyle = "rgba(236,0,140,0.5)";
    ctx.save();
    ctx.translate(w * 0.0035, h * 0.0016);
    ctx.strokeRect(sx + w * 0.039, sy + h * 0.029, sw - w * 0.06, sh - h * 0.047);
    ctx.restore();

    ctx.strokeStyle = LIGHT.ink;
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
    // Two ghosts, struck up-left and down-right, like a plate that hit the
    // paper twice out of register.
    //
    // The spec for this called for tinting each ghost cyan/magenta with a
    // clip-to-the-stamp-rect, globalCompositeOperation = "source-atop" fill
    // on top of it. That was tried against a real canvas (not just this
    // file's recording-stub tests, which can't tell the difference): by the
    // time the ghosts are drawn, the stamp rect is already fully opaque
    // (the fillRect above, then perforate()), so source-atop can't
    // distinguish "pixel the ghost inked" from "pixel that was already
    // stamp paper" — both have alpha 1 — and the fill washes the entire
    // clipped rect in one flat tint instead of fringing just the portrait.
    // Making that distinction for real needs an intermediate transparent
    // layer (an offscreen canvas), which would need `document` to exist;
    // this file's tests run under vitest's "node" environment, which has
    // no DOM at all, so that would break every test in this file, not just
    // the new ones.
    //
    // The engine paints its own ink and owns that colour choice, so the
    // portrait ghosts stay low-alpha grey rather than fighting it. The
    // colour separation that makes a misprint collectible instead happens
    // on the elements ticket.ts draws and colours itself, where no such
    // constraint exists: the stamp's inner frame rule a few lines up now
    // strikes cyan up-left and magenta down-right around the true dark
    // rule, and the stamp-foot lettering below does the same. Real plate
    // misregistration shows up most on rules and type, not on halftone
    // artwork, so this is closer to the genuine effect than a tinted
    // portrait would have been anyway, not just the fallback that was
    // achievable.
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(-w * 0.0035, -h * 0.0016);
    engine.portrait(data.visitorId, pBox);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(w * 0.0035, h * 0.0016);
    engine.portrait(data.visitorId, pBox);
    ctx.restore();
  }
  engine.portrait(data.visitorId, pBox);
  ctx.restore();

  // the stamp says the denomination, like a real one. shashwa7.in now lives
  // in the brand row at the top, so the foot keeps only "one visit", centred.
  //
  // Misprint fringes this type the same way it fringes the frame rule
  // above: two colour copies, offset up-left (cyan) and down-right
  // (magenta) by the same amount as the portrait ghosts, drawn under the
  // true one. ticket.ts sets this colour itself, so there is no engine ink
  // to fight the way there is for the portrait.
  if (data.issue.key === "misprint") {
    ctx.save();
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.font = `${w * 0.0194}px ${fonts.mono}`;
    ctx.fillStyle = "rgba(0,174,239,0.55)";
    tracked(
      ctx, "ONE VISIT", sx + sw / 2 - w * 0.0035, sy + sh * 0.905 - h * 0.0016, w * 0.0028, "center"
    );
    ctx.fillStyle = "rgba(236,0,140,0.5)";
    tracked(
      ctx, "ONE VISIT", sx + sw / 2 + w * 0.0035, sy + sh * 0.905 + h * 0.0016, w * 0.0028, "center"
    );
    ctx.restore();
  }
  ctx.fillStyle = P.faint;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `${w * 0.0194}px ${fonts.mono}`;
  tracked(ctx, "ONE VISIT", sx + sw / 2, sy + sh * 0.905, w * 0.0028, "center");

  // first day covers carry a coloured cachet: the legend, a rule under it,
  // and (further down) the cancel's two rings all print in a deep teal
  // rather than the card's ink.
  if (data.issue.key === "firstDay") {
    ctx.fillStyle = TEAL;
    ctx.textAlign = "left";
    ctx.font = `${w * 0.0194}px ${fonts.mono}`;
    tracked(ctx, "FIRST DAY OF ISSUE", L, h * 0.645 + TOP, w * 0.0028);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = w * 0.0016;
    ctx.beginPath();
    ctx.moveTo(L, h * 0.645 + TOP + h * 0.012);
    ctx.lineTo(L + w * 0.32, h * 0.645 + TOP + h * 0.012);
    ctx.stroke();
    ctx.restore();
  }

  // the cancel
  const ccx = w * 0.724, ccy = h * 0.531 + TOP, cr = w * 0.101;
  ctx.save();
  ctx.globalAlpha = 0.62;
  ctx.strokeStyle = data.issue.key === "firstDay" ? TEAL : P.cancel;
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

  // the name, in handwriting. Shrinks to fit the same way the issue name
  // in the stub does, since a wide typed name runs past L/Rt at the base size.
  ctx.fillStyle = P.ink;
  ctx.textAlign = "center";
  const name = data.name.trim() || "Visitor";
  shrinkToFit(ctx, name, fonts.hand, w * 0.1, w * 0.04, w * 0.003, w * 0.8);
  ctx.fillText(name, w / 2, h * 0.716 + TOP);

  // tear line, painted, with notches bitten out of both edges
  const ty = h * 0.782 + TOP;
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
  ctx.fillStyle = P.veryFaint;
  ctx.font = `${w * 0.018}px ${fonts.mono}`;
  ctx.textAlign = "left";
  tracked(ctx, "SERIAL", L, h * 0.848 + TOP, w * 0.0028);
  tracked(ctx, "ISSUE", Rt, h * 0.848 + TOP, w * 0.0028, "right");

  ctx.fillStyle = P.ink;
  ctx.font = `${w * 0.0448}px ${fonts.mono}`;
  ctx.textAlign = "left";
  ctx.fillText(data.serial, L, h * 0.893 + TOP);

  // "Commemorative" overflows the column, so shrink to fit rather than truncate
  ctx.textAlign = "right";
  const maxIssue = w * 0.36;
  shrinkToFit(ctx, data.issue.name, fonts.mono, w * 0.0448, w * 0.02, w * 0.0015, maxIssue);
  ctx.fillStyle = data.issue.inverted ? P.cancel : P.ink;
  ctx.fillText(data.issue.name, Rt, h * 0.893 + TOP);

  ctx.fillStyle = P.veryFaint;
  ctx.font = `${w * 0.018}px ${fonts.mono}`;
  ctx.textAlign = "left";
  if (data.origin) {
    tracked(ctx, `${data.origin} · ${data.date}`.toUpperCase(), L, h * 0.958 + TOP, w * 0.0028);
  } else {
    tracked(ctx, data.date.toUpperCase(), L, h * 0.958 + TOP, w * 0.0028);
  }

  // the rarity share: the single most interesting fact on the card, so it
  // gets a hairline rule of its own and a size that actually reads, rather
  // than the footnote-sized veryFaint line every other stub value uses.
  const shareY = h * 0.958 + TOP;
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = w * 0.0016;
  ctx.beginPath();
  ctx.moveTo(Rt - maxIssue, shareY - h * 0.026);
  ctx.lineTo(Rt, shareY - h * 0.026);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = P.ink;
  ctx.font = `${w * 0.026}px ${fonts.mono}`;
  ctx.textAlign = "right";
  tracked(ctx, `${data.issue.share}% OF CARDS`, Rt, shareY, w * 0.0028, "right");

  // the sticker, applied last so it sits over the stamp
  drawSticker(
    ctx, data.issue.name, data.issue, R,
    w * 0.2, h * 0.55 + TOP, w * 0.088, fonts.sticker, rr(R, -0.16, -0.08)
  );

  ctx.restore();
}
