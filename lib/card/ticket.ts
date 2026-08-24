import { hashWith, mulberry32, rr } from "@/lib/card/seed";
import { createEngine } from "@/lib/card/engine/portrait-engine";
import { drawSticker } from "@/lib/card/sticker";
import { pipTotal } from "@/lib/card/dice";
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
  misprint: "#f6f0e8", // a hair warmer than the base cream, felt rather than seen
  inverted: "#17161a", // unchanged
};

const TEAL = "#1f6f78";

const LIGHT = {
  stamp: "#fdfaf2",
  ink: "#1f1d1a",
  faint: "#8a8175",
  veryFaint: "#bdb4a4",
  cancel: "#1f1d1a",
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

  // The stamp and the body content between it and the tear line moved down
  // by TOP to make room for the brand row. Every one of those y coordinates
  // is `TOP + <its old fraction of h>`, so this single constant is the only
  // thing that ever needs to change if the band grows or shrinks.
  //
  // The stub (the tear line and everything below it) is a fixed block at
  // the foot of the card instead, anchored to the BOTTOM edge as
  // `h - <fraction>`. A block measured from the top drifts toward the
  // bottom edge as the header above it grows, which is exactly what
  // clipped its text once TOP existed; a block measured from the bottom
  // cannot be pushed off by anything that happens above it.
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
    ctx.strokeStyle = "rgba(0,132,180,0.42)";
    ctx.lineWidth = w * 0.0034;
    ctx.save();
    ctx.translate(-w * 0.0018, -h * 0.0008);
    ctx.strokeRect(sx + w * 0.039, sy + h * 0.029, sw - w * 0.06, sh - h * 0.047);
    ctx.restore();

    ctx.strokeStyle = "rgba(190,30,120,0.38)";
    ctx.save();
    ctx.translate(w * 0.0018, h * 0.0008);
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
    ctx.translate(-w * 0.0018, -h * 0.0008);
    engine.portrait(data.visitorId, pBox);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(w * 0.0018, h * 0.0008);
    engine.portrait(data.visitorId, pBox);
    ctx.restore();
  }
  engine.portrait(data.visitorId, pBox);
  ctx.restore();

  // the stamp says the denomination, like a real one, on every tier but
  // First day. shashwa7.in now lives in the brand row at the top, so the
  // foot otherwise keeps only "one visit", centred.
  //
  // First day used to carry a separate legend and rule below the stamp
  // instead. That line collided with the stamp's own perforation when
  // moved close enough to free the name's vertical band, and read as an
  // unrelated floating line of type when moved further away: no position
  // satisfied both. The structural fix is to stop trying to fit a second
  // line of type into the gap at all: "FIRST DAY OF ISSUE" now replaces
  // "ONE VISIT" ON the stamp foot itself, in the same TEAL the cachet used
  // (so the tier keeps its colour signature; the cancel's two rings, further
  // down, stay teal for the same reason). That removes the squeeze
  // entirely rather than surviving it on a few px of margin: there is
  // nowhere left below the stamp for anything to collide with, and the
  // name's vertical band is identical to every other tier again.
  //
  // Misprint fringes this type the same way it fringes the frame rule
  // above: two colour copies, offset up-left (cyan) and down-right
  // (magenta) by the same amount as the portrait ghosts, drawn under the
  // true one. ticket.ts sets this colour itself, so there is no engine ink
  // to fight the way there is for the portrait. Misprint and First day are
  // different tiers (a card is always exactly one issue), so this never
  // has to fringe "FIRST DAY OF ISSUE".
  if (data.issue.key === "misprint") {
    ctx.save();
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.font = `${w * 0.0194}px ${fonts.mono}`;
    ctx.fillStyle = "rgba(0,132,180,0.42)";
    tracked(
      ctx, "ONE VISIT", sx + sw / 2 - w * 0.0018, sy + sh * 0.905 - h * 0.0008, w * 0.0028, "center"
    );
    ctx.fillStyle = "rgba(190,30,120,0.38)";
    tracked(
      ctx, "ONE VISIT", sx + sw / 2 + w * 0.0018, sy + sh * 0.905 + h * 0.0008, w * 0.0028, "center"
    );
    ctx.restore();
  }
  const isFirstDay = data.issue.key === "firstDay";
  const footText = isFirstDay ? "FIRST DAY OF ISSUE" : "ONE VISIT";
  ctx.fillStyle = isFirstDay ? TEAL : P.faint;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  // Shrinks to fit the stamp's own inner frame width (sw - w * 0.06, the
  // same inset the frame rule below draws at) rather than assuming
  // "FIRST DAY OF ISSUE" always fits at the base size: at w * 0.0194 it
  // comfortably does today (measured well under half the inner width), but
  // a future longer legend should not be able to run past the stamp's own
  // edge the way an un-shrunk name or issue value could elsewhere on the
  // card. "ONE VISIT" is short enough that this never engages for it, so
  // the other four tiers render byte-identically to before.
  shrinkToFit(ctx, footText, fonts.mono, w * 0.0194, w * 0.012, w * 0.0006, sw - w * 0.06);
  tracked(ctx, footText, sx + sw / 2, sy + sh * 0.905, w * 0.0028, "center");

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

  // tear line's y, needed above to place the name against it. Declared here
  // (rather than immediately before it is drawn, further down) so the name
  // baseline can be derived from it directly instead of duplicating the
  // formula.
  const ty = h - h * 0.218;

  // the name, in handwriting. fonts.hand (Caveat) is a script face with
  // deep loops on g, y, j, p, q below the baseline and tall capitals/
  // ascenders above it, so the name doesn't just need to fit a WIDTH, it
  // needs to fit a vertical BAND: the space between the stamp's own lower
  // edge and the tear line below it. That space used to be contested on
  // First day, when a separate cachet legend sat between the stamp and the
  // name; now that the legend lives on the stamp's own foot instead (see
  // above), nothing tier-specific sits in this band on any of the five
  // issues, and it no longer needs to special-case one.
  //
  // Caveat's ascenders and capitals run up to about 0.8 of an em above the
  // baseline, and its descenders up to about 0.45 of an em below it: that
  // is 96px of ascent and 54px of descent at the REF_NAME_PX reference
  // size. The two clearances below pad both of those on purpose rather
  // than cutting it to the bare metric: NAME_DESCENT_CLEARANCE (h * 0.05,
  // 75px) is deliberate headroom over the true 54px, not a tighter
  // measurement of it, the same padding this card used before the First
  // day squeeze forced it down to the bare 0.45em for one round. With the
  // band uncontested again there is no reason to cut either margin close,
  // so NAME_ASCENT_CLEARANCE gets a full em of headroom (h * 0.08, which
  // equals REF_NAME_PX itself on this card's fixed aspect ratio) rather
  // than the roughly 0.8em minimum that just barely fits. Neither
  // clearance shrinks as a name gets narrower (a smaller font's real ink
  // only ever needs less room than this, never more, so the floor stays
  // safe).
  const REF_NAME_PX = w * 0.1;
  const NAME_ASCENT_CLEARANCE = h * 0.08; // a full em of headroom above Caveat's real ~0.8em ascent
  const NAME_DESCENT_CLEARANCE = h * 0.05; // deliberate headroom over Caveat's real ~0.45em descent

  const aboveBottom = sy + sh;
  const band = ty - aboveBottom;
  // NAME_ASCENT_CLEARANCE + NAME_DESCENT_CLEARANCE is h * 0.13 (195px),
  // comfortably inside every tier's identical ~204px band (stamp bottom to
  // tear line), so the Math.min below is a SAFETY NET rather than the
  // normal case: on all five tiers today it clamps to REF_NAME_PX and does
  // nothing. It stays because it is cheap insurance against a future
  // layout change squeezing the band again (a taller stamp, a lower tear
  // line), in which case the name shrinks instead of colliding, the same
  // way it would here today for a hypothetically tighter band. Do not read
  // its presence as meaning any tier is currently constrained by it.
  const maxNamePx = Math.min(
    REF_NAME_PX,
    (band * REF_NAME_PX) / (NAME_ASCENT_CLEARANCE + NAME_DESCENT_CLEARANCE)
  );

  ctx.fillStyle = P.ink;
  ctx.textAlign = "center";
  const name = data.name.trim() || "Visitor";
  // Shrinks to fit the same way the issue name in the stub does, since a
  // wide typed name runs past L/Rt even at the height-derived max size.
  // This is a second, independent guard on top of the band above it: one
  // caps height, the other caps width, and a name can need both.
  shrinkToFit(ctx, name, fonts.hand, maxNamePx, w * 0.04, w * 0.003, w * 0.8);

  // Anchored off the tear line (rather than off aboveBottom, or centred in
  // the band) so the descent clearance is exact; maxNamePx was sized so
  // the ascent clearance above that point is always satisfied too, with
  // any extra band room becoming slack above the name instead of below it.
  const descentAtMax = (NAME_DESCENT_CLEARANCE * maxNamePx) / REF_NAME_PX;
  const nameY = ty - descentAtMax;
  ctx.fillText(name, w / 2, nameY);

  // tear line, painted, with real holes bitten out of both edges
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = w * 0.0045;
  ctx.setLineDash([w * 0.015, w * 0.019]);
  ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w, ty); ctx.stroke();
  ctx.restore();
  // Genuine cuts, not a painted guess at the page background: erasing with
  // destination-out leaves real alpha there, so whatever the card is placed
  // over (or the downloaded PNG's own transparency) shows through. Matches
  // the true cut app/cv/page.tsx makes at its NOTCH, for the same reason
  // documented at length in that file: a filled colour only ever
  // approximates one background and is wrong on every other one.
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath(); ctx.arc(0, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w, ty, w * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // the stub: four values on two aligned columns, anchored to the card's
  // bottom edge rather than measured down from the top. See the note above
  // TOP for why.
  ctx.fillStyle = P.veryFaint;
  ctx.font = `${w * 0.018}px ${fonts.mono}`;
  ctx.textAlign = "left";
  tracked(ctx, "SERIAL", L, h - h * 0.152, w * 0.0028);
  tracked(ctx, "ISSUE", Rt, h - h * 0.152, w * 0.0028, "right");

  ctx.fillStyle = P.ink;
  ctx.font = `${w * 0.0448}px ${fonts.mono}`;
  ctx.textAlign = "left";
  ctx.fillText(data.serial, L, h - h * 0.107);

  // "Commemorative" overflows the column, so shrink to fit rather than truncate
  ctx.textAlign = "right";
  const maxIssue = w * 0.36;
  shrinkToFit(ctx, data.issue.name, fonts.mono, w * 0.0448, w * 0.02, w * 0.0015, maxIssue);
  ctx.fillStyle = data.issue.inverted ? P.cancel : P.ink;
  ctx.fillText(data.issue.name, Rt, h - h * 0.107);

  // The place a visitor is minting from, and the roll that decided their
  // issue, on one row.
  //
  // The date used to sit on this line too. It left when the roll arrived:
  // the postmark cancel directly above already prints day, month and year,
  // so it was a duplicate, and keeping all three ran the row to 39
  // characters, which shrank it well below the size the neighbouring stub
  // values read at. The no-origin branch keeps it, because on that card
  // nothing else on this row would carry a date.
  //
  // shrinkToFit is a guard, not the normal case: at a typical origin this
  // settles at the full w * 0.022 and never engages. It exists because city
  // names have no length limit and this row now has a right-hand neighbour
  // (the odds column) it must not run under.
  ctx.fillStyle = P.faint;
  ctx.textAlign = "left";
  const stubLine = (
    data.origin ? `${data.origin} · ROLLED ${pipTotal(data.roll)}`
                : `${data.date} · ROLLED ${pipTotal(data.roll)}`
  ).toUpperCase();
  // tracked() adds its spacing outside measureText, so the budget handed to
  // shrinkToFit has to have that spacing taken out of it first or the line
  // fits on paper and overruns on screen.
  const stubSpacing = w * 0.0028;
  const stubBudget =
    Rt - maxIssue - L - w * 0.02 - Array.from(stubLine).length * stubSpacing;
  shrinkToFit(ctx, stubLine, fonts.mono, w * 0.022, w * 0.014, w * 0.0006, stubBudget);
  tracked(ctx, stubLine, L, h - h * 0.042, stubSpacing);

  // the odds: the single most interesting fact on the card, so it gets a
  // hairline rule of its own and a size that actually reads, rather than
  // the footnote-sized veryFaint line every other stub value uses.
  //
  // Stated per roll, not as a share of all cards. Rolls are unlimited, so
  // "0.06% of cards" would be false: it is the chance of any one roll
  // landing here, and a patient visitor can hold a black card eventually.
  const shareY = h - h * 0.042;
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
  tracked(ctx, `${data.issue.label} PER ROLL`, Rt, shareY, w * 0.0028, "right");

  // the sticker, applied last so it sits over the stamp
  drawSticker(
    ctx, data.issue.name, data.issue, R,
    w * 0.2, h * 0.55 + TOP, w * 0.088, fonts.sticker, rr(R, -0.16, -0.08)
  );

  ctx.restore();
}
