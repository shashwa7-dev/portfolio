// Draws the candy gator's rig on a canvas: limbs as two round-capped strokes
// (outline, then colour), bulging biceps, a gold watch, white high-tops, the
// tank top and shorts on a torso that swells as he puffs up, the big
// alligator head and the candy-cane revolver, all from the motion reference's
// paths. Skin colours come from his anger. Keeps no state of its own (Path2D
// objects are constants, built on first use).
import type { Vec } from "./rig";
import {
  GATOR,
  type GatorBones,
  type GatorLook,
  type GatorPose,
  HEAD_ORIGIN,
  type Limb,
  foreAngle,
  gatorBones,
  gatorColors,
  swell,
} from "./gator";

export type GatorDraw = {
  rot?: number; // radians about (px, py), in sprite space, before mirroring
  px?: number;
  py?: number;
  alpha?: number;
  white?: boolean; // the hit flash: a white silhouette
};

const O = "#2b2234";
const COL = {
  tank: "#ffffff",
  rib: "#e2deea",
  trim: "#1fc8d6",
  shorts: "#ff3d8b",
  shortsDark: "#d02a6f",
  band: "#2f6bff",
  bandDark: "#1f4fd0",
  gold: "#ffcc33",
  goldDark: "#d39a12",
  grip: "#ff5fa2",
  sole: "#7b3cff",
  swoosh: "#1fc8d6",
  cane: "#ff2d55",
} as const;
const DEG = Math.PI / 180;

const paths = new Map<string, Path2D>();
const path = (d: string): Path2D => {
  let p = paths.get(d);
  if (!p) {
    p = new Path2D(d);
    paths.set(d, p);
  }
  return p;
};

type Paint = { white: boolean };
const ink = (pt: Paint, c: string) => (pt.white ? "#fff" : c);

function shape(ctx: CanvasRenderingContext2D, pt: Paint, d: string, fill?: string, stroke?: string, lw = 2): void {
  const p = path(d);
  if (fill) {
    ctx.fillStyle = ink(pt, fill);
    ctx.fill(p);
  }
  if (stroke) {
    ctx.strokeStyle = ink(pt, stroke);
    ctx.lineWidth = lw;
    ctx.stroke(p);
  }
}

function ellipse(ctx: CanvasRenderingContext2D, pt: Paint, cx: number, cy: number, rx: number, ry: number, fill?: string, stroke?: string, lw = 2, alpha = 1): void {
  ctx.save();
  if (!pt.white) ctx.globalAlpha *= alpha;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = ink(pt, fill);
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = ink(pt, stroke);
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.restore();
}

function line(ctx: CanvasRenderingContext2D, pt: Paint, pts: Vec[], color: string, lw: number): void {
  ctx.strokeStyle = ink(pt, color);
  ctx.lineWidth = lw;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

const lerpV = (a: Vec, b: Vec, k: number): Vec => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// --- torso (pelvis-local, before the swell) ----------------------------------
const TORSO = "M-22 2 C-28 -18 -40 -42 -36 -56 C-22 -68 26 -68 38 -56 C42 -40 32 -18 22 2 Z";
const TANK = "M-24 2 C-29 -16 -36 -38 -30 -52 L-15 -58 C-9 -46 8 -46 14 -58 L30 -53 C37 -38 31 -16 22 2 Z";

function drawTorso(ctx: CanvasRenderingContext2D, pt: Paint, b: GatorBones, pose: GatorPose, look: GatorLook, skin: string, dark: string): void {
  const [sx, sy] = swell(look);
  ctx.save();
  const R = b.T([0, 0]);
  ctx.translate(R[0], R[1]);
  ctx.rotate(pose.torso * DEG);
  ctx.scale(sx, sy);
  shape(ctx, pt, TORSO, skin, O, 2);
  shape(ctx, pt, "M-6 -50 C2 -45 12 -45 18 -50", undefined, dark, 1.6);
  shape(ctx, pt, TANK, COL.tank, O, 1.8);
  if (!pt.white) {
    shape(ctx, pt, "M-22 -40 L-20 0 M-13 -40 L-12 0 M-4 -42 L-4 0 M5 -42 L5 0 M14 -42 L13 0 M23 -40 L20 0", undefined, COL.rib, 1.4);
    shape(ctx, pt, "M-15 -58 C-9 -46 8 -46 14 -58", undefined, COL.trim, 2.6);
    shape(ctx, pt, "M-30 -52 C-34 -40 -32 -30 -28 -24 M30 -53 C35 -42 34 -32 29 -26", undefined, COL.trim, 2);
    shape(ctx, pt, "M-18 -20 C-8 -15 8 -15 18 -20", undefined, COL.rib, 1.6);
    const shine = Math.min(0.8, (look.puff ?? 0) * 0.85);
    if (shine > 0) {
      ctx.save();
      ctx.translate(-12, -36);
      ctx.rotate(-30 * DEG);
      ellipse(ctx, pt, 0, 0, 10, 5, "#fff", undefined, 0, shine);
      ctx.restore();
    }
  }
  shape(ctx, pt, "M-26 -5 L24 -5 L27 12 L-28 12 Z", COL.shorts, O, 1.8);
  if (!pt.white) {
    shape(ctx, pt, "M-26 -1 L25 -1", undefined, "#fff", 2);
    shape(ctx, pt, "M4 0 l-2 7 M4 0 l3 6", undefined, "#fff", 1.4);
  }
  ctx.restore();
}

// --- legs ---------------------------------------------------------------------
const SNEAKER = "M-9 -6 C-10 -12 -2 -14 4 -11 L10 -5 C18 -4 24 -1 24 4 L-11 4 C-12 0 -11 -3 -9 -6 Z";
const SOLE = "M-12 4 L25 4 L24 8 C14 9 -2 9 -12 8 Z";

function drawLeg(ctx: CanvasRenderingContext2D, pt: Paint, leg: Limb & { hip: Vec }, far: boolean, skin: string): void {
  const { hip, mid: knee, to: ankle } = leg;
  line(ctx, pt, [hip, knee, ankle], O, 16);
  line(ctx, pt, [hip, knee, ankle], skin, 12);
  const end = lerpV(hip, knee, 0.62);
  line(ctx, pt, [hip, end], O, 24);
  line(ctx, pt, [hip, end], far ? COL.shortsDark : COL.shorts, 20);
  if (!pt.white) line(ctx, pt, [[hip[0] + 7, hip[1] + 2], [end[0] + 7, end[1]]], "#fff", 2.4);
  line(ctx, pt, [lerpV(knee, ankle, 0.82), ankle], "#fff", 9);
  const ang = (Math.atan2(ankle[1] - knee[1], ankle[0] - knee[0]) / DEG - 90) * 0.35;
  ctx.save();
  ctx.translate(ankle[0], ankle[1] + 2);
  ctx.rotate(ang * DEG);
  shape(ctx, pt, SNEAKER, far ? "#dcd8e6" : "#ffffff", O, 1.8);
  shape(ctx, pt, SOLE, COL.sole, O, 1.6);
  if (!pt.white) {
    shape(ctx, pt, "M-3 0 C3 -3 10 -3 16 0", undefined, COL.swoosh, 2.4);
    shape(ctx, pt, "M0 -10 l5 3 M3 -12 l5 3", undefined, O, 1.2);
  }
  ctx.restore();
}

// --- arms and the gun -----------------------------------------------------------
// The gun in its own frame: barrel along +x, the grip hanging down at the hand.
function drawGun(ctx: CanvasRenderingContext2D, pt: Paint): void {
  shape(ctx, pt, "M-5 -3 L5 -3 C6 4 5 12 2 17 L-6 17 C-7 10 -7 3 -5 -3 Z", COL.grip, O, 1.6);
  ellipse(ctx, pt, -1.5, 8, 1.5, 1.5, COL.gold);
  shape(ctx, pt, "M4 -2 C4 6 14 6 14 -2", undefined, O, 2);
  shape(ctx, pt, "M-7 -11 L-12 -17 L-8.5 -18 L-3 -12 Z", COL.goldDark, O, 1.4);
  shape(ctx, pt, "M-5 -13 L9 -13 Q11 -13 11 -11 L11 -4 Q11 -2 9 -2 L-5 -2 Q-7 -2 -7 -4 L-7 -11 Q-7 -13 -5 -13 Z", COL.gold, O, 1.6);
  shape(ctx, pt, "M6.5 -15.5 L12.5 -15.5 Q16 -15.5 16 -12 L16 -5 Q16 -1.5 12.5 -1.5 L6.5 -1.5 Q3 -1.5 3 -5 L3 -12 Q3 -15.5 6.5 -15.5 Z", COL.goldDark, O, 1.6);
  if (!pt.white) shape(ctx, pt, "M7.5 -15 L7.5 -2 M11.5 -15 L11.5 -2", undefined, O, 0.9);
  // The candy-cane barrel: white with red diagonal stripes, a pink tip.
  const barrel = "M19.5 -13 L60.5 -13 A4.5 4.5 0 0 1 60.5 -4 L19.5 -4 A4.5 4.5 0 0 1 19.5 -13 Z";
  shape(ctx, pt, barrel, "#fff");
  if (!pt.white) {
    ctx.save();
    ctx.clip(path(barrel));
    shape(ctx, pt, "M17 -13 l5 9 M24 -13 l5 9 M31 -13 l5 9 M38 -13 l5 9 M45 -13 l5 9 M52 -13 l5 9 M59 -13 l5 9", undefined, COL.cane, 3.2);
    ctx.restore();
    shape(ctx, pt, "M19 -11.4 L61 -11.4", undefined, "#fff", 1.3);
  }
  shape(ctx, pt, barrel, undefined, O, 1.6);
  ellipse(ctx, pt, 65, -8.5, 3, 5, "#ff7fb0", O, 1.5);
  ellipse(ctx, pt, 65.6, -8.5, 1.3, 2.6, "#5a1530");
  shape(ctx, pt, "M14.5 -14.5 L16.5 -14.5 Q18 -14.5 18 -13 L18 -4 Q18 -2.5 16.5 -2.5 L14.5 -2.5 Q13 -2.5 13 -4 L13 -13 Q13 -14.5 14.5 -14.5 Z", COL.goldDark, O, 1.4);
}

function drawArm(ctx: CanvasRenderingContext2D, pt: Paint, arm: Limb, skin: string, flex: number, near: boolean, look: GatorLook): void {
  const { from: S, mid: E, to: Hd } = arm;
  line(ctx, pt, [E, Hd], O, 14);
  line(ctx, pt, [E, Hd], skin, 10);
  line(ctx, pt, [S, E], O, 17);
  line(ctx, pt, [S, E], skin, 13);
  // The bicep bulges on the front of the upper arm, more as he flexes.
  const du: Vec = [(E[0] - S[0]) / 26, (E[1] - S[1]) / 26];
  const bulge = 2.5 + flex * 1.5;
  const c: Vec = [S[0] + du[0] * 13 + du[1] * bulge, S[1] + du[1] * 13 - du[0] * bulge];
  ctx.save();
  ctx.translate(c[0], c[1]);
  ctx.rotate(Math.atan2(du[1], du[0]));
  ellipse(ctx, pt, 0, 0, 13.5, 8.6 + flex * 1.6, skin, O, 2);
  ctx.restore();
  ellipse(ctx, pt, S[0], S[1], 9.8, 9.8, skin, O, 2);
  const fa = foreAngle(arm);
  if (near && look.gun) {
    ctx.save();
    ctx.translate(Hd[0], Hd[1]);
    ctx.rotate((fa + (look.spin ?? 0)) * DEG);
    drawGun(ctx, pt);
    ctx.restore();
  }
  ellipse(ctx, pt, Hd[0], Hd[1], 7.2, 7.2, skin, O, 2);
  if (!pt.white) {
    const k: Vec = [Math.cos(fa * DEG) * 3, Math.sin(fa * DEG) * 3];
    line(ctx, pt, [[Hd[0] + k[0] - k[1] * 1.2, Hd[1] + k[1] + k[0] * 1.2], [Hd[0] + k[0] + k[1] * 1.2, Hd[1] + k[1] - k[0] * 1.2]], O, 1.4);
  }
  if (near) {
    const w = lerpV(E, Hd, 0.72);
    ctx.save();
    ctx.translate(w[0], w[1]);
    ctx.rotate(fa * DEG);
    shape(ctx, pt, "M-1.8 -6.8 L1.8 -6.8 Q3.4 -6.8 3.4 -5.2 L3.4 5.2 Q3.4 6.8 1.8 6.8 L-1.8 6.8 Q-3.4 6.8 -3.4 5.2 L-3.4 -5.2 Q-3.4 -6.8 -1.8 -6.8 Z", COL.gold, O, 1.5);
    ellipse(ctx, pt, 0, 0, 3.6, 3.6, "#fff8d8", COL.goldDark, 1.4);
    if (!pt.white) shape(ctx, pt, "M0 0 L0 -2.4 M0 0 L1.8 0", undefined, O, 0.8);
    ctx.restore();
  }
}

// --- head (its own 0..160 drawing space; the neck is at HEAD_ORIGIN) ----------
const HEAD = "M40 52 C36 30 52 14 72 16 C86 17 96 24 104 30 C118 30 136 32 146 38 C154 42 154 52 146 56 C134 62 110 64 90 66 C66 70 44 68 40 52 Z";
const JAW = "M86 56 C104 62 130 58 148 48 C150 56 138 64 118 66 C104 68 92 66 86 60 Z";
const TEETH = "M95 59 l3 5 l3 -5 Z M103 60 l3 5 l3 -5 Z M111 60 l3.4 6 l3.4 -6 Z M122 58 l3 5 l3 -5 Z M132 55 l3 5 l3 -5 Z M140 52 l2.6 4.4 l2.6 -4.4 Z";
const GRIN = "M86 56 C104 62 130 58 148 48 C150 47 152 45 151 43";
const BAND = "M38 42 C38 20 58 10 76 11 C90 12 100 18 104 28 C84 24 60 28 38 42 Z";
const LID = "M78.6 30 C79 21 97 21 97.4 30 C92 27 84 27 78.6 30 Z";
const LID_F = "M65 28 C65.4 21 78.6 21 79 28 C75 26 69 26 65 28 Z";
const WINK = "M78.6 30 C79 20 97 20 97.4 30 C93 36 83 36 78.6 30 Z";

function rotAbout(ctx: CanvasRenderingContext2D, deg: number, x: number, y: number): void {
  ctx.translate(x, y);
  ctx.rotate(deg * DEG);
  ctx.translate(-x, -y);
}

function drawHead(ctx: CanvasRenderingContext2D, pt: Paint, b: GatorBones, pose: GatorPose, look: GatorLook, c: ReturnType<typeof gatorColors>): void {
  const a = look.anger;
  const eyes = look.eyes ?? "cool";
  const o = look.mouth === "o";
  ctx.save();
  ctx.translate(b.neck[0], b.neck[1]);
  ctx.rotate((pose.torso + pose.head) * DEG);
  ctx.scale(b.headScale, b.headScale);
  ctx.translate(-HEAD_ORIGIN[0], -HEAD_ORIGIN[1]);
  shape(ctx, pt, "M64 56 L88 56 L90 80 L64 80 Z", c.skin, O, 2);
  shape(ctx, pt, HEAD, c.skin, O, 2);
  shape(ctx, pt, JAW, c.belly, O, 1.6);
  if (pt.white) return ctx.restore();
  if (o) {
    ellipse(ctx, pt, 116, 58, 9, 8, "#5a1530", O, 2);
    ellipse(ctx, pt, 116, 61, 5, 3, "#ff7fa8");
  } else {
    shape(ctx, pt, TEETH, "#fff", O, 1);
    shape(ctx, pt, GRIN, undefined, O, 2.2);
  }
  ellipse(ctx, pt, 146, 37, 2, 1.4, O);
  for (const [x, y, r] of [[58, 44, 2], [50, 52, 2], [64, 54, 1.6], [112, 38, 1.6], [126, 40, 1.6]]) ellipse(ctx, pt, x, y, r, r, c.dark);
  // The bandana, its tails flapping.
  for (const [d, fill, k, py] of [
    ["M42 38 C32 34 22 36 14 42 L20 46 C26 42 34 41 42 43 Z", COL.band, 1, 40],
    ["M42 42 C34 44 26 50 22 58 L28 59 C32 53 37 49 44 46 Z", COL.bandDark, 0.7, 44],
  ] as const) {
    ctx.save();
    rotAbout(ctx, (look.flap ?? 0) * k, 42, py);
    shape(ctx, pt, d, fill, O, 1.6);
    ctx.restore();
  }
  shape(ctx, pt, BAND, COL.band, O, 1.8);
  ellipse(ctx, pt, 42, 40, 4.2, 4.2, COL.bandDark, O, 1.6);
  for (const [x, y, r] of [[56, 22, 1.6], [68, 17, 1.6], [82, 17, 1.6], [50, 32, 1.6], [64, 27, 1.4], [92, 22, 1.4]]) ellipse(ctx, pt, x, y, r, r, "#fff");
  // Eyes: heavy lids when cool, wide when shocked; brows sink and slant with anger.
  const shock = eyes === "shock";
  ellipse(ctx, pt, 72, 28, 7, 7, "#fff", O, 1.8);
  const pf = shock ? 1.5 : 2.8 - a * 0.6;
  ellipse(ctx, pt, 74.5, 29, pf, pf, O);
  ctx.save();
  if (shock) {
    ctx.translate(88, 30);
    ctx.scale(1.35, 1.35);
    ctx.translate(-88, -30);
  }
  ellipse(ctx, pt, 88, 30, 9, 9, "#fff", O, 2);
  const pn = shock ? 1.8 : 3.4 - a * 0.8;
  ellipse(ctx, pt, 91, 31, pn, pn, O);
  ellipse(ctx, pt, 92.2, 29.6, 1.1, 1.1, "#fff");
  ctx.restore();
  if (eyes === "cool" || eyes === "squint") {
    ctx.save();
    ctx.translate(0, eyes === "squint" ? 3 : a * 2);
    shape(ctx, pt, LID, c.skin, O, 1.8);
    ctx.restore();
  }
  if (!shock) shape(ctx, pt, LID_F, c.skin, O, 1.6);
  if (eyes === "wink") shape(ctx, pt, WINK, c.skin, O, 1.8);
  if (!shock) {
    ctx.save();
    ctx.translate(0, a * 4);
    rotAbout(ctx, a * 24, 88, 21);
    shape(ctx, pt, "M78 20 L98 22", undefined, O, 3.6);
    ctx.restore();
    ctx.save();
    ctx.translate(0, a * 3);
    rotAbout(ctx, -a * 18, 71, 20);
    shape(ctx, pt, "M64 19 L78 20", undefined, O, 3);
    ctx.restore();
  }
  ellipse(ctx, pt, 98, 52, 5, 3, "#ff5a7a", undefined, 0, 0.4 + a * 0.5);
  ctx.restore();
}

/** Draws the gator in `pose` with his 170 x 215 box's top-left at (x, y) px,
 *  scaled by `scale`; mirrored (facing left) when `mirrored`. */
export function drawGator(
  ctx: CanvasRenderingContext2D,
  pose: GatorPose,
  look: GatorLook,
  x: number,
  y: number,
  scale: number,
  mirrored: boolean,
  opt: GatorDraw = {},
): void {
  const pt: Paint = { white: !!opt.white };
  const c = gatorColors(look.anger);
  const b = gatorBones(pose, look);
  ctx.save();
  if (opt.alpha !== undefined) ctx.globalAlpha *= opt.alpha;
  ctx.translate(x + (mirrored ? GATOR.W * scale : 0), y);
  ctx.scale(mirrored ? -scale : scale, scale);
  if (opt.rot) rotAbout(ctx, opt.rot / DEG, opt.px ?? 0, opt.py ?? 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawArm(ctx, pt, b.armF, c.far, 0, false, look);
  drawLeg(ctx, pt, b.legF, true, c.far);
  drawTorso(ctx, pt, b, pose, look, c.skin, c.dark);
  drawLeg(ctx, pt, b.legN, false, c.skin);
  drawHead(ctx, pt, b, pose, look, c);
  drawArm(ctx, pt, b.armN, c.skin, look.flex ?? 0, true, look);
  ctx.restore();
}
