// Bigfoot's skeleton, pure (no DOM). Sprite space is 160 x 225, facing
// right, ground at y 198 (the prototype's makeRig). Legs are two-bone IK from
// the hips to planted ankle targets; arms are forward kinematics from the
// shoulders, which follow the torso. Poses are named sets of numbers blended
// with a strong ease-in-out.

export const RIG = {
  OUT: "#160f12",
  NEAR: "#5a3f2e",
  FAR: "#3e2a20",
  HAND_N: "#7c5a45",
  HAND_F: "#5c4232",
  FOOT_N: "#3b2a20",
  FOOT_F: "#2c1e17",
  THIGH: 36,
  SHIN: 34,
  UPPER: 32,
  FORE: 30,
  GROUND: 198,
  W: 160,
  H: 225,
} as const;

export type Vec = [number, number];
export type Face = "calm" | "strain" | "relief";

// Root = pelvis; feet are ankle targets (sprite space); arm angles absolute
// degrees (0 = straight down, + = forward).
export type Pose = {
  rx: number;
  ry: number;
  torso: number;
  head: number;
  fF: Vec;
  fN: Vec;
  uF: number;
  fFo: number;
  uN: number;
  fNo: number;
  face: Face;
};

export const POSES = {
  stand: { rx: 86, ry: 132, torso: 0, head: 0, fF: [72, 194], fN: [104, 194], uF: 12, fFo: 22, uN: 8, fNo: 18, face: "calm" },
  squat: { rx: 80, ry: 164, torso: 22, head: -16, fF: [70, 194], fN: [106, 194], uF: 6, fFo: 38, uN: 2, fNo: 34, face: "strain" },
  relief: { rx: 80, ry: 160, torso: 14, head: -6, fF: [70, 194], fN: [106, 194], uF: 4, fFo: 30, uN: 0, fNo: 26, face: "relief" },
  jet: { rx: 80, ry: 162, torso: 30, head: -14, fF: [66, 196], fN: [102, 196], uF: -70, fFo: -100, uN: -74, fNo: -104, face: "relief" },
} as const satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const easeIO = (k: number): number => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOut = (k: number): number => 1 - Math.pow(1 - k, 3);

export const copy = (p: Pose): Pose => ({ ...p, fF: [p.fF[0], p.fF[1]], fN: [p.fN[0], p.fN[1]] });

/** Two-bone IK: hip H, ankle target A; the knee bends forward (+x). */
export function ik(H: Vec, A: Vec, L1: number, L2: number): { knee: Vec; ankle: Vec } {
  let dx = A[0] - H[0];
  let dy = A[1] - H[1];
  let d = Math.hypot(dx, dy);
  const max = L1 + L2 - 0.01;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  const a = Math.atan2(dy, dx);
  const c = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const k1: Vec = [H[0] + L1 * Math.cos(a - c), H[1] + L1 * Math.sin(a - c)];
  const k2: Vec = [H[0] + L1 * Math.cos(a + c), H[1] + L1 * Math.sin(a + c)];
  return { knee: k1[0] > k2[0] ? k1 : k2, ankle: [H[0] + dx, H[1] + dy] };
}

export function blend(a: Pose, b: Pose, k: number): Pose {
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
    face: k < 0.5 ? a.face : b.face,
  };
}

const WALK_RATE = 4.2; // rad/s of the step phase

/** The procedural walk: feet step in turn (lifted while swinging), hips bob,
 *  arms counter-swing. `recoil` (1 at a hit, falling to 0) jolts the torso. */
export function walkPose(t: number, recoil: number): Pose {
  const ph = t * WALK_RATE;
  const sF = Math.sin(ph);
  const sN = Math.sin(ph + Math.PI);
  const p = copy(POSES.stand);
  p.fF = [72 + sF * 14, 194 - Math.max(0, Math.cos(ph)) * 8];
  p.fN = [104 + sN * 14, 194 - Math.max(0, Math.cos(ph + Math.PI)) * 8];
  p.ry = 132 + Math.abs(Math.cos(ph)) * 2.5 - 1.5;
  p.uF = 12 - sF * 16;
  p.fFo = p.uF + 12;
  p.uN = 8 - sN * 16;
  p.fNo = p.uN + 12;
  p.torso = 3 - recoil * 14;
  p.head = recoil * 8;
  return p;
}

export const THROW_TIME = 0.55;
export const RELEASE = 0.62; // of THROW_TIME: the glob leaves the hand
const WIND = 0.6;

/** The near arm's overarm throw at `k` (0..1 of THROW_TIME): reach back and
 *  down, then a fast release toward the camera. Changes `pose` in place. */
export function throwArm(pose: Pose, k: number): Pose {
  if (k < WIND) {
    const e = easeIO(k / WIND);
    pose.uN = lerp(8, -75, e);
    pose.fNo = lerp(18, -125, e);
    pose.torso = lerp(3, -16, e);
    pose.ry += e * 4;
  } else {
    const e = easeOut(Math.min(1, (k - WIND) / (1 - WIND)));
    pose.uN = lerp(-75, 115, e);
    pose.fNo = lerp(-125, 95, e);
    pose.torso = lerp(-16, 20, e);
  }
  return pose;
}

// The death timeline as segments: [start, end, from, to, ease].
type Seg = [number, number, PoseName, PoseName, (k: number) => number];
const SEGS: readonly Seg[] = [
  [0, 0.14, "stand", "stand", easeOut], // recoil
  [0.14, 0.62, "stand", "squat", easeIO],
  [1.62, 1.86, "squat", "jet", easeOut],
];
export const SQUAT_AT = 0.62;
export const PUSH_AT = 1.6;
export const LAUNCH_AT = 1.86;

/** Bigfoot's pose `seq` seconds into his finish: recoil, the squat, a settle,
 *  the strain (0.8 to 1.6), one push, then the launch pose. */
export function finishPose(seq: number): Pose {
  let p: Pose = POSES.stand;
  for (const [a, b, from, to, ez] of SEGS) {
    if (seq >= b) p = POSES[to];
    else if (seq >= a) {
      p = blend(POSES[from], POSES[to], ez((seq - a) / (b - a)));
      break;
    }
  }
  p = copy(p);
  if (seq < 0.2) p.torso -= (1 - seq / 0.2) * 14; // the hit's recoil
  if (seq >= SQUAT_AT && seq < 0.78) p.ry += Math.sin(((seq - SQUAT_AT) / 0.16) * Math.PI) * 3; // settle
  if (seq >= 0.8 && seq < PUSH_AT) {
    p.rx += Math.sin(seq * 95) * 0.9; // strain
    p.torso += Math.sin(seq * 80) * 0.8;
  }
  if (seq >= PUSH_AT && seq < 1.75) p.ry -= Math.sin(((seq - PUSH_AT) / 0.15) * Math.PI) * 4; // the push
  return p;
}

/** Sprite space to world px for a box whose top-left is (x, y), scaled by
 *  `scale`, mirrored (facing left) when `dir` < 0. */
export function toWorld(sx: number, sy: number, x: number, y: number, scale: number, dir: number): Vec {
  return [x + (dir < 0 ? RIG.W - sx : sx) * scale, y + sy * scale];
}

/** The top of the rig's box when its ground line sits on `ground` px. */
export const rigTop = (ground: number, scale: number): number => ground - RIG.GROUND * scale;

/** Where the near hand is when the glob leaves it (prototype: 118, 96). */
export const HAND_AT_RELEASE: Vec = [118, 96];
