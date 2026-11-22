// Draws Bigfoot's rig on a canvas: limbs as two round-capped strokes (a dark
// outline `w + 4.4`, then the fur colour `w`), round hands, oval feet, the
// torso and head from today's sprite paths, and one of three faces. Keeps no
// state of its own (the Path2D objects are constants, built on first use).
import { type Face, type Pose, type Vec, RIG, ik } from "./rig";

export type RigDraw = {
  rot?: number; // radians about (px, py), in sprite space, before mirroring
  px?: number;
  py?: number;
  alpha?: number;
  white?: boolean; // the hit flash: a white silhouette
};

const DEG = Math.PI / 180;
const dir = (deg: number): Vec => [Math.sin(deg * DEG), Math.cos(deg * DEG)];
const rot = ([x, y]: Vec, deg: number): Vec => {
  const r = deg * DEG;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [x * c - y * s, x * s + y * c];
};

type Stroke = { d: string; stroke?: string; width?: number; fill?: string; alpha?: number };
type Ellipse = { cx: number; cy: number; rx: number; ry: number; fill: string; alpha?: number; stroke?: string; width?: number };

const TORSO = "M46 70 Q74 40 112 62 Q122 96 116 132 Q80 146 48 132 Q40 100 46 70 Z";
const FUR = "M60 80 l6 8 M74 76 l5 9 M92 78 l4 9 M104 90 l4 8 M58 104 l6 7 M80 100 l5 8 M100 110 l4 8 M64 122 l5 7";
const HEAD = "M70 58 Q66 30 88 22 Q110 28 108 58 Q90 68 70 58 Z";
const INK = "#2c1e17";

const FACES: Record<Face, { paths: Stroke[]; dots?: Ellipse[] }> = {
  calm: {
    paths: [
      { d: "M83 41 Q94 36 105 41", stroke: INK, width: 3.5 },
      { d: "M90 55 Q94.5 57 99 55", stroke: INK, width: 1.6 },
    ],
    dots: [
      { cx: 89.5, cy: 46, rx: 2, ry: 2, fill: RIG.OUT },
      { cx: 99.5, cy: 46, rx: 2, ry: 2, fill: RIG.OUT },
    ],
  },
  strain: {
    paths: [
      { d: "M83 39 L93 43 M105 39 L96 43", stroke: INK, width: 3.5 },
      { d: "M86 46 l4 1.5 l-4 1.5 M103 46 l-4 1.5 l4 1.5", stroke: RIG.OUT, width: 1.8 },
      { d: "M89 55 l2 -1.5 l2 1.5 l2 -1.5 l2 1.5 l2 -1.5", stroke: INK, width: 1.6 },
      { d: "M107 36 q3 4 0 6 q-3 -2 0 -6 Z", fill: "#8fd3ff", stroke: RIG.OUT, width: 1 },
    ],
    dots: [
      { cx: 85, cy: 52, rx: 2.6, ry: 1.6, fill: "#e98a9a", alpha: 0.7 },
      { cx: 104, cy: 52, rx: 2.6, ry: 1.6, fill: "#e98a9a", alpha: 0.7 },
    ],
  },
  relief: {
    paths: [
      { d: "M83 41 Q94 38 105 41", stroke: INK, width: 3.5 },
      { d: "M86.5 47 q3 -3 6 0 M96.5 47 q3 -3 6 0", stroke: RIG.OUT, width: 1.8 },
      { d: "M89 53 Q94.5 59 100 53 Z", fill: "#7a2335", stroke: INK, width: 1.4 },
    ],
  },
};

const paths = new Map<string, Path2D>();
const path = (d: string): Path2D => {
  let p = paths.get(d);
  if (!p) {
    p = new Path2D(d);
    paths.set(d, p);
  }
  return p;
};

function polyline(ctx: CanvasRenderingContext2D, pts: Vec[], color: string, w: number, white: boolean): void {
  for (const [c, lw] of [
    [white ? "#fff" : RIG.OUT, w + 4.4],
    [white ? "#fff" : color, w],
  ] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = lw;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
}

function ellipse(ctx: CanvasRenderingContext2D, e: Ellipse, white: boolean): void {
  ctx.save();
  if (e.alpha !== undefined && !white) ctx.globalAlpha *= e.alpha;
  ctx.beginPath();
  ctx.ellipse(e.cx, e.cy, e.rx, e.ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = white ? "#fff" : e.fill;
  ctx.fill();
  if (e.stroke) {
    ctx.strokeStyle = white ? "#fff" : e.stroke;
    ctx.lineWidth = e.width ?? 2;
    ctx.stroke();
  }
  ctx.restore();
}

function shape(ctx: CanvasRenderingContext2D, s: Stroke, white: boolean): void {
  const p = path(s.d);
  if (s.fill) {
    ctx.fillStyle = white ? "#fff" : s.fill;
    ctx.fill(p);
  }
  if (s.stroke) {
    ctx.strokeStyle = white ? "#fff" : s.stroke;
    ctx.lineWidth = s.width ?? 2;
    ctx.stroke(p);
  }
}

/** Draws the rig in `pose` with its 160 x 225 box's top-left at (x, y) px,
 *  scaled by `scale`; mirrored (facing left) when `mirrored`. */
export function drawRig(
  ctx: CanvasRenderingContext2D,
  pose: Pose,
  x: number,
  y: number,
  scale: number,
  mirrored: boolean,
  opt: RigDraw = {},
): void {
  const white = !!opt.white;
  ctx.save();
  if (opt.alpha !== undefined) ctx.globalAlpha *= opt.alpha;
  ctx.translate(x + (mirrored ? RIG.W * scale : 0), y);
  ctx.scale(mirrored ? -scale : scale, scale);
  if (opt.rot) {
    ctx.translate(opt.px ?? 0, opt.py ?? 0);
    ctx.rotate(opt.rot);
    ctx.translate(-(opt.px ?? 0), -(opt.py ?? 0));
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const R: Vec = [pose.rx, pose.ry];
  const T = (local: Vec): Vec => {
    const v = rot(local, pose.torso);
    return [R[0] + v[0], R[1] + v[1]];
  };
  const hipF: Vec = [R[0] - 10, R[1] - 2];
  const hipN: Vec = [R[0] + 14, R[1] - 2];
  const legF = ik(hipF, pose.fF, RIG.THIGH, RIG.SHIN);
  const legN = ik(hipN, pose.fN, RIG.THIGH, RIG.SHIN);
  const arm = (sh: Vec, u: number, f: number): Vec[] => {
    const S = T(sh);
    const du = dir(u + pose.torso * 0.6);
    const df = dir(f + pose.torso * 0.6);
    const E: Vec = [S[0] + du[0] * RIG.UPPER, S[1] + du[1] * RIG.UPPER];
    return [S, E, [E[0] + df[0] * RIG.FORE, E[1] + df[1] * RIG.FORE]];
  };
  const armF = arm([-20, -58], pose.uF, pose.fFo);
  const armN = arm([16, -60], pose.uN, pose.fNo);
  const hand = (p: Vec, fill: string) => ellipse(ctx, { cx: p[0], cy: p[1], rx: 8, ry: 8, fill, stroke: RIG.OUT, width: 2 }, white);
  const foot = (leg: { knee: Vec; ankle: Vec }, fill: string) => {
    const ang = (Math.atan2(leg.ankle[1] - leg.knee[1], leg.ankle[0] - leg.knee[0]) / DEG - 90) * 0.35;
    ctx.save();
    ctx.translate(leg.ankle[0] + 6, leg.ankle[1] + 3);
    ctx.translate(-6, -3);
    ctx.rotate(ang * DEG);
    ctx.translate(6, 3);
    ellipse(ctx, { cx: 0, cy: 0, rx: 14, ry: 6, fill, stroke: RIG.OUT, width: 2.2 }, white);
    ctx.restore();
  };

  // Far side first (behind), then the torso, then the near side.
  polyline(ctx, armF, RIG.FAR, 13, white);
  hand(armF[2], RIG.HAND_F);
  polyline(ctx, [hipF, legF.knee, legF.ankle], RIG.FAR, 17, white);
  foot(legF, RIG.FOOT_F);

  ctx.save();
  ctx.translate(R[0], R[1]);
  ctx.rotate(pose.torso * DEG);
  ctx.save();
  ctx.translate(-82, -132);
  shape(ctx, { d: TORSO, fill: RIG.NEAR, stroke: RIG.OUT, width: 2.2 }, white);
  if (!white) shape(ctx, { d: FUR, stroke: RIG.FAR, width: 2 }, white);
  ctx.restore();
  ctx.translate(7, -72);
  ctx.rotate(pose.head * DEG);
  ctx.save();
  ctx.translate(-89, -60);
  shape(ctx, { d: HEAD, fill: RIG.NEAR, stroke: RIG.OUT, width: 2.2 }, white);
  ctx.restore();
  ellipse(ctx, { cx: 5, cy: -12, rx: 11, ry: 12, fill: "#a77d5f", stroke: RIG.OUT, width: 2.2 }, white);
  if (!white) {
    ctx.translate(-89, -60);
    const face = FACES[pose.face];
    for (const s of face.paths) shape(ctx, s, false);
    for (const e of face.dots ?? []) ellipse(ctx, e, false);
  }
  ctx.restore();

  polyline(ctx, [hipN, legN.knee, legN.ankle], RIG.NEAR, 17, white);
  foot(legN, RIG.FOOT_N);
  polyline(ctx, armN, RIG.NEAR, 13, white);
  hand(armN[2], RIG.HAND_N);
  ctx.restore();
}

/** The boss bar over a provoked Bigfoot: `70 * scale` wide, 8 px tall,
 *  centred on `cx` with its top at `top`, filled `left` (0..1) red to gold. */
export function drawBossBar(ctx: CanvasRenderingContext2D, cx: number, top: number, scale: number, left: number): void {
  const w = 70 * scale;
  const h = 8;
  const x = cx - w / 2;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, top, w, h, h / 2);
  ctx.fillStyle = "rgba(14,12,22,.75)";
  ctx.fill();
  ctx.save();
  ctx.clip();
  const fill = Math.max(0, Math.min(1, left));
  if (fill > 0) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "#ff4d6a");
    g.addColorStop(1, "#f7c46c");
    ctx.fillStyle = g;
    ctx.fillRect(x, top, w * fill, h); // scaleX from the left, like the CSS
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}
