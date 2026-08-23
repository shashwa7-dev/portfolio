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
  ctx.fillStyle = P.faint;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `${w * 0.0194}px ${fonts.mono}`;
  tracked(ctx, "ONE VISIT", sx + sw / 2, sy + sh * 0.905, w * 0.0028, "center");

  // first day covers carry a coloured cachet: the legend, a rule under it,
  // and (further down) the cancel's two rings all print in a deep teal
  // rather than the card's ink. Sits close beneath the stamp (was
  // h * 0.645, a 55.5px gap that read as a floating, unrelated line of
  // type) rather than floating halfway to the name: "FIRST DAY OF ISSUE"
  // is a legend about the stamp, so it belongs visually attached to it.
  // That move also frees the band the name needs below (see aboveBottom,
  // further down), which is the whole reason this sat as far down as it
  // did in the first place.
  //
  // h * 0.615 (a 10.5px gap) was tried first and is wrong: the legend's
  // own ink reaches UP from its baseline, and at that size (w * 0.0194,
  // cap height ~0.72em on a typical monospace face) its cap top lands
  // around y = 962.7, well inside the stamp's perforation band (the bites
  // perforate() punches, radius w * 0.0112, centred on the stamp's own
  // bottom edge, so the band's lower edge sits at stampBottom + that
  // radius = ~982.4). The legend also runs wide enough (18 characters) to
  // sit under the stamp's left half horizontally, so that vertical
  // overlap is a real collision: teal cachet type painted over the
  // stamp's perforated edge, not just a tight gap.
  //
  // h * 0.630 (a 33px gap) clears it: cap top lands around y = 985.2,
  // about 2.8px below the perforation band's lower edge. cachetLegendY/
  // cachetRuleY are hoisted (rather than inlined at each use) because the
  // name's vertical band needs the same two y's to know what sits above
  // it on this one tier, and because the legend and its rule must move
  // together, keeping their h * 0.012 relative spacing.
  const cachetLegendY = h * 0.63 + TOP;
  const cachetRuleY = cachetLegendY + h * 0.012;
  if (data.issue.key === "firstDay") {
    ctx.fillStyle = TEAL;
    ctx.textAlign = "left";
    ctx.font = `${w * 0.0194}px ${fonts.mono}`;
    tracked(ctx, "FIRST DAY OF ISSUE", L, cachetLegendY, w * 0.0028);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = w * 0.0016;
    ctx.beginPath();
    ctx.moveTo(L, cachetRuleY);
    ctx.lineTo(L + w * 0.32, cachetRuleY);
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

  // tear line's y, needed above to place the name against it. Declared here
  // (rather than immediately before it is drawn, further down) so the name
  // baseline can be derived from it directly instead of duplicating the
  // formula.
  const ty = h - h * 0.218;

  // the name, in handwriting. fonts.hand (Caveat) is a script face with
  // deep loops on g, y, j, p, q below the baseline and tall capitals/
  // ascenders above it, so the name doesn't just need to fit a WIDTH, it
  // needs to fit a vertical BAND: the space between whatever sits above it
  // (the First day cachet's rule when present, otherwise the stamp's own
  // lower edge) and the tear line below it.
  //
  // Caveat's ascenders and capitals run up to about 0.8 of an em above the
  // baseline, and its descenders up to about 0.45 of an em below it: these
  // are the face's real, worst-case metrics, not a padded safety margin on
  // top of them (an earlier version of this comment used 0.75-0.8 ascent
  // and a padded 0.05h descent floor; the padding turned out to be exactly
  // what made First day's band unsatisfiable, so it was cut). At the
  // REF_NAME_PX reference size that is 96px of ascent and 54px of descent,
  // 150px together, and since both fractions below are derived from
  // REF_NAME_PX algebraically (h * 0.064 = 0.8 * w * 0.1, h * 0.036 =
  // 0.45 * w * 0.1, given h = 1.25w on this card's fixed aspect ratio)
  // that 150px total holds at any canvas size, not just 1200x1500. Neither
  // clearance shrinks as a name gets narrower (a smaller font's real ink
  // only ever needs less room than this, never more, so the floor stays
  // safe), but there is no more headroom above the real metric: a name
  // that somehow rendered taller than Caveat's own worst case would not
  // be covered.
  const REF_NAME_PX = w * 0.1;
  const NAME_ASCENT_CLEARANCE = h * 0.064; // Caveat's ~0.8em ascent at REF_NAME_PX, no padding
  const NAME_DESCENT_CLEARANCE = h * 0.036; // Caveat's ~0.45em descent at REF_NAME_PX, no padding

  const aboveBottom = data.issue.key === "firstDay" ? cachetRuleY : sy + sh;
  const band = ty - aboveBottom;
  // At REF_NAME_PX, every tier's band now clears NAME_ASCENT_CLEARANCE +
  // NAME_DESCENT_CLEARANCE (h * 0.1 = 150px): First day's is the tightest,
  // at ~153px (cachetRuleY sits close beneath the stamp specifically so
  // this holds), the other four have room to spare from the stamp's own
  // lower edge. The Math.min below is a SAFETY NET, not the normal case:
  // on all five tiers today it clamps to REF_NAME_PX and does nothing. It
  // stays because it is cheap insurance against a future layout change
  // squeezing some tier's band again (a taller cachet, a lower tear line),
  // in which case the name shrinks instead of colliding, the same way it
  // would here today for a hypothetically tighter band. Do not read its
  // presence as meaning any tier is currently constrained by it.
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

  // Was w * 0.018 in P.veryFaint, the palest tone on the card: the place a
  // visitor is minting from read as an afterthought next to the share
  // figure beside it, which is w * 0.026 in P.ink. Bumped one size and one
  // tone up so it is clearly legible, while staying a step below the
  // serial/issue values above it so it does not compete with them. At the
  // longest realistic origin ("BENGALURU, IN · 23 AUG 2026", 27 characters)
  // this still ends well short of the share row's reserved width (maxIssue,
  // below), so no shrink-to-fit is needed here.
  ctx.fillStyle = P.faint;
  ctx.font = `${w * 0.022}px ${fonts.mono}`;
  ctx.textAlign = "left";
  if (data.origin) {
    tracked(ctx, `${data.origin} · ${data.date}`.toUpperCase(), L, h - h * 0.042, w * 0.0028);
  } else {
    tracked(ctx, data.date.toUpperCase(), L, h - h * 0.042, w * 0.0028);
  }

  // the rarity share: the single most interesting fact on the card, so it
  // gets a hairline rule of its own and a size that actually reads, rather
  // than the footnote-sized veryFaint line every other stub value uses.
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
  tracked(ctx, `${data.issue.share}% OF CARDS`, Rt, shareY, w * 0.0028, "right");

  // the sticker, applied last so it sits over the stamp
  drawSticker(
    ctx, data.issue.name, data.issue, R,
    w * 0.2, h * 0.55 + TOP, w * 0.088, fonts.sticker, rr(R, -0.16, -0.08)
  );

  ctx.restore();
}
