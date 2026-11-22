// The candy gator's skeleton, pure (no DOM). Sprite space is 170 x 215,
// facing right, soles on y 208 (docs/superpowers/reference/vice-hunt-gator-motion.html,
// makeGator). Legs are two-bone IK from the hips to the feet, arms forward
// kinematics from shoulders that follow the torso, like Bigfoot's rig. His
// torso swells as he puffs up (wider than tall), and his colour comes from
// his anger.
import { type Vec, ik, lerp } from "./rig";

export const GATOR = { W: 170, H: 215, GROUND: 208, THIGH: 30, SHIN: 30, UPPER: 26, FORE: 25, HEAD: 0.82 } as const;

/** Torso-local points (pelvis origin, before the torso's lean and swell). */
export const G_HIP_F: Vec = [-11, 4];
export const G_HIP_N: Vec = [11, 4];
export const G_SHOULDER_F: Vec = [-26, -52];
export const G_SHOULDER_N: Vec = [22, -54];
export const G_NECK: Vec = [6, -60];
/** The gun's tip in the gun's own frame (barrel along +x, grip down). */
export const MUZZLE: Vec = [67, -8.5];
/** The head art's own origin (the neck), in its 0..160 drawing space. */
export const HEAD_ORIGIN: Vec = [76, 66];

// Pelvis, torso and head lean (degrees, + leans forward), foot targets, arm
// angles (absolute degrees: 0 = straight down, + = forward).
export type GatorPose = { rx: number; ry: number; torso: number; head: number; fF: Vec; fN: Vec; uF: number; fFo: number; uN: number; fNo: number };

export const G_POSES = {
  stand: { rx: 80, ry: 140, torso: 2, head: 0, fF: [70, 200], fN: [94, 200], uF: 10, fFo: 20, uN: 6, fNo: 22 },
  aim: { rx: 78, ry: 142, torso: -5, head: -6, fF: [66, 200], fN: [96, 200], uF: 24, fFo: 50, uN: 92, fNo: 90 },
  puffed: { rx: 80, ry: 136, torso: 0, head: -6, fF: [72, 176], fN: [94, 178], uF: -100, fFo: -112, uN: 100, fNo: 112 },
} as const satisfies Record<string, GatorPose>;

export type GatorEyes = "cool" | "squint" | "shock" | "wink";

/** Everything about how he looks that is not where his bones are. */
export type GatorLook = {
  anger: number; // 0..1
  puff?: number; // 0..1 (a little over at the gulps)
  extra?: number; // a tremble on top of the swell
  gun?: boolean;
  spin?: number; // the gun's twirl, degrees
  flex?: number; // 0..1, the bicep bulges as he aims
  eyes?: GatorEyes;
  mouth?: "grin" | "o";
  flap?: number; // the bandana tails, degrees
};

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** 0 calm to 1 furious, fully red one hit before the last (`hp` hits finish him). */
export const angerOf = (hits: number, hp: number): number => clamp01(hits / Math.max(1, hp - 1));

/** His walking speed in widths per second: faster as he gets angrier. */
export const gatorSpeed = (anger: number): number => 0.065 + 0.06 * anger;

/** Skin from his anger: green, yellow, orange, red. */
export function gatorColors(anger: number): { skin: string; far: string; dark: string; belly: string } {
  const h = +lerp(135, 2, anger).toFixed(2);
  const s = +lerp(58, 82, anger).toFixed(2);
  const l = +(50 + Math.sin(anger * Math.PI) * 6).toFixed(2);
  return {
    skin: `hsl(${h} ${s}% ${l}%)`,
    far: `hsl(${h} ${s}% ${+(l - 9).toFixed(2)}%)`,
    dark: `hsl(${h} ${s}% ${+(l - 18).toFixed(2)}%)`,
    belly: `hsl(${+(h + 10).toFixed(2)} 75% 80%)`,
  };
}

export const copyPose = (p: GatorPose): GatorPose => ({ ...p, fF: [p.fF[0], p.fF[1]], fN: [p.fN[0], p.fN[1]] });

export function blendPose(a: GatorPose, b: GatorPose, k: number): GatorPose {
  return {
    rx: lerp(a.rx, b.rx, k),
    ry: lerp(a.ry, b.ry, k),
    torso: lerp(a.torso, b.torso, k),
    head: lerp(a.head, b.head, k),
    fF: [lerp(a.fF[0], b.fF[0], k), lerp(a.fF[1], b.fF[1], k)],
    fN: [lerp(a.fN[0], b.fN[0], k), lerp(a.fN[1], b.fN[1], k)],
    uF: lerp(a.uF, b.uF, k),
    fFo: lerp(a.fFo, b.fFo, k),
    uN: lerp(a.uN, b.uN, k),
    fNo: lerp(a.fNo, b.fNo, k),
  };
}

/** The strut at step phase `ph` (radians): bigger strides, a deeper lean and
 *  a lower head as he gets angrier. */
export function gatorWalk(ph: number, anger: number): GatorPose {
  const stride = 10 + anger * 4;
  const lift = 7 + anger * 3;
  const s = Math.sin(ph);
  const c = Math.cos(ph);
  const sw = 24 + anger * 8;
  const p = copyPose(G_POSES.stand);
  p.fN = [G_POSES.stand.fN[0] + stride * s, 200 - Math.max(0, c) * lift];
  p.fF = [G_POSES.stand.fF[0] - stride * s, 200 - Math.max(0, -c) * lift];
  p.ry = 140 - Math.abs(s) * 2.5;
  p.torso = 3 + anger * 7;
  p.head = Math.sin(ph * 2) * 3 - anger * 4;
  p.uN = 8 - sw * s;
  p.fNo = p.uN + 26;
  p.uF = 10 + sw * s;
  p.fFo = p.uF + 26;
  return p;
}

/** Stand to aim at `k` (0..1): the gun arm comes up level, he leans back a touch. */
export const aimBlend = (k: number): GatorPose => blendPose(G_POSES.stand, G_POSES.aim, clamp01(k));

const DEG = Math.PI / 180;
export const dir = (deg: number): Vec => [Math.sin(deg * DEG), Math.cos(deg * DEG)];
export const rot = ([x, y]: Vec, deg: number): Vec => {
  const r = deg * DEG;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};
const angleOf = (v: Vec): number => Math.atan2(v[1], v[0]) / DEG;

/** The torso's swell for a puff: much wider than taller (a balloon). */
export const swell = (look: GatorLook): Vec => {
  const p = look.puff ?? 0;
  const e = look.extra ?? 0;
  return [1 + 1.55 * p + e, 1 + 0.7 * p + e];
};

export type Limb = { from: Vec; mid: Vec; to: Vec };
export type GatorBones = {
  T: (l: Vec) => Vec; // torso-local to sprite space
  neck: Vec;
  headScale: number;
  legF: Limb & { hip: Vec };
  legN: Limb & { hip: Vec };
  armF: Limb;
  armN: Limb;
};

/** Where every joint is for `pose` and `look`, in sprite space. */
export function gatorBones(pose: GatorPose, look: GatorLook): GatorBones {
  const [sx, sy] = swell(look);
  const R: Vec = [pose.rx, pose.ry];
  const T = (l: Vec): Vec => {
    const v = rot([l[0] * sx, l[1] * sy], pose.torso);
    return [R[0] + v[0], R[1] + v[1]];
  };
  const leg = (hipL: Vec, foot: Vec) => {
    const hip = T(hipL);
    const s = ik(hip, foot, GATOR.THIGH, GATOR.SHIN);
    return { hip, from: hip, mid: s.knee, to: s.ankle };
  };
  const arm = (sh: Vec, u: number, f: number): Limb => {
    const S = T(sh);
    const du = dir(u + pose.torso * 0.6);
    const df = dir(f + pose.torso * 0.6);
    const E: Vec = [S[0] + du[0] * GATOR.UPPER, S[1] + du[1] * GATOR.UPPER];
    return { from: S, mid: E, to: [E[0] + df[0] * GATOR.FORE, E[1] + df[1] * GATOR.FORE] };
  };
  return {
    T,
    neck: T(G_NECK),
    headScale: GATOR.HEAD * (1 + 0.3 * (look.puff ?? 0)),
    legF: leg(G_HIP_F, pose.fF),
    legN: leg(G_HIP_N, pose.fN),
    armF: arm(G_SHOULDER_F, pose.uF, pose.fFo),
    armN: arm(G_SHOULDER_N, pose.uN, pose.fNo),
  };
}

/** The forearm's direction in degrees (0 = +x), which the gun follows. */
export const foreAngle = (arm: Limb): number => angleOf([arm.to[0] - arm.mid[0], arm.to[1] - arm.mid[1]]);

/** A point of the head art (its 0..160 space) in sprite space. */
export function headPoint(b: GatorBones, pose: GatorPose, p: Vec): Vec {
  const v = rot([(p[0] - HEAD_ORIGIN[0]) * b.headScale, (p[1] - HEAD_ORIGIN[1]) * b.headScale], pose.torso + pose.head);
  return [b.neck[0] + v[0], b.neck[1] + v[1]];
}

/** Points the effects need: the gun's muzzle, the top of the head (steam,
 *  shouts) and the torso's centre (the pop). */
export function gatorPoints(pose: GatorPose, look: GatorLook): { muzzle: Vec; headTop: Vec; belly: Vec } {
  const b = gatorBones(pose, look);
  const m = rot(MUZZLE, foreAngle(b.armN) + (look.spin ?? 0));
  return {
    muzzle: [b.armN.to[0] + m[0], b.armN.to[1] + m[1]],
    headTop: headPoint(b, pose, [74, 12]),
    belly: b.T([0, -30]),
  };
}

/** Sprite space to world px for a box whose top-left is (x, y), scaled by
 *  `scale`, mirrored (facing left) when `dir` < 0. */
export const gatorToWorld = (p: Vec, x: number, y: number, scale: number, facing: number): Vec => [
  x + (facing < 0 ? GATOR.W - p[0] : p[0]) * scale,
  y + p[1] * scale,
];
