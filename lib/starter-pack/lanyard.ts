/**
 * The starter pack's lanyard: a verlet strap hanging from an anchor above the
 * page, with the card as a heavy rigid arm from the clip to the card's centre.
 *
 * Pure: no DOM. Coordinates are the card's unscaled pixels; the component
 * converts pointer positions with `toLocal`.
 */
export type Vec = { x: number; y: number };
export type Particle = Vec & { px: number; py: number; invMass: number };

export type LanyardParams = {
  segments: number;
  segLen: number;
  armLen: number;
  armInvMass: number;
  gravity: number;
  damping: number;
  iterations: number;
};

export const LANYARD: LanyardParams = {
  segments: 11,
  segLen: 22,
  armLen: 317,
  armInvMass: 1 / 8,
  gravity: 2000,
  damping: 0.996,
  iterations: 24,
};

export type LanyardState = {
  anchor: Vec;
  /** `points[0]` is pinned to `anchor`; the last point is the clip. */
  points: Particle[];
  /** The card's centre. */
  arm: Particle;
  /** The arm's smoothed acceleration, px/s². */
  acc: Vec;
  /** Largest distance any particle moved in the last step. */
  moved: number;
  vel: Vec;
};

const ACC_LIMIT = 6000;
const ACC_SMOOTH = 0.15;

function particle(x: number, y: number, invMass: number): Particle {
  return { x, y, px: x, py: y, invMass };
}

export function createLanyard(anchor: Vec, swingX = 110, p: LanyardParams = LANYARD): LanyardState {
  const points: Particle[] = [];
  for (let i = 0; i <= p.segments; i++) points.push(particle(anchor.x, anchor.y + i * p.segLen, i === 0 ? 0 : 1));
  const clip = points[p.segments];
  const dy = Math.sqrt(Math.max(0, p.armLen * p.armLen - swingX * swingX));
  return {
    anchor: { ...anchor },
    points,
    arm: particle(clip.x + swingX, clip.y + dy, p.armInvMass),
    acc: { x: 0, y: 0 },
    moved: Infinity,
    vel: { x: 0, y: 0 },
  };
}

export function setAnchor(s: LanyardState, anchor: Vec): void {
  s.anchor = { ...anchor };
  s.moved = Infinity;
}

function satisfy(a: Particle, b: Particle, len: number): void {
  const w = a.invMass + b.invMass;
  if (w === 0) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1e-6;
  const f = (d - len) / d / w;
  a.x += dx * f * a.invMass;
  a.y += dy * f * a.invMass;
  b.x -= dx * f * b.invMass;
  b.y -= dy * f * b.invMass;
}

export function stepLanyard(s: LanyardState, dt: number, drag: Vec | null, p: LanyardParams = LANYARD): void {
  const all = [...s.points, s.arm];
  const before = all.map((q) => ({ x: q.x, y: q.y }));
  for (const q of all) {
    if (q.invMass === 0) continue;
    const vx = (q.x - q.px) * p.damping;
    const vy = (q.y - q.py) * p.damping;
    q.px = q.x;
    q.py = q.y;
    q.x += vx;
    q.y += vy + p.gravity * dt * dt;
  }
  const pin = () => {
    s.points[0].x = s.anchor.x;
    s.points[0].y = s.anchor.y;
    if (drag) {
      s.arm.x = drag.x;
      s.arm.y = drag.y;
    }
  };
  pin();
  const clip = s.points[p.segments];
  for (let k = 0; k < p.iterations; k++) {
    for (let i = 0; i < p.segments; i++) satisfy(s.points[i], s.points[i + 1], p.segLen);
    satisfy(clip, s.arm, p.armLen);
    pin();
  }

  let moved = 0;
  all.forEach((q, i) => {
    moved = Math.max(moved, Math.hypot(q.x - before[i].x, q.y - before[i].y));
  });
  s.moved = moved;

  const vx = (s.arm.x - before[before.length - 1].x) / dt;
  const vy = (s.arm.y - before[before.length - 1].y) / dt;
  let ax = (vx - s.vel.x) / dt;
  let ay = (vy - s.vel.y) / dt;
  s.vel = { x: vx, y: vy };
  const m = Math.hypot(ax, ay);
  if (m > ACC_LIMIT) {
    ax *= ACC_LIMIT / m;
    ay *= ACC_LIMIT / m;
  }
  s.acc = { x: s.acc.x * (1 - ACC_SMOOTH) + ax * ACC_SMOOTH, y: s.acc.y * (1 - ACC_SMOOTH) + ay * ACC_SMOOTH };
}

/** The clip position and the card's angle (CSS clockwise radians, 0 = hanging straight). */
export function cardPose(s: LanyardState): { clip: Vec; angle: number } {
  const clip = s.points[s.points.length - 1];
  return { clip: { x: clip.x, y: clip.y }, angle: Math.atan2(-(s.arm.x - clip.x), s.arm.y - clip.y) };
}

export function lanyardAtRest(s: LanyardState, eps = 0.02): boolean {
  return s.moved < eps;
}

export function toLocal(client: Vec, rect: { left: number; top: number }, scale: number): Vec {
  return { x: (client.x - rect.left) / scale, y: (client.y - rect.top) / scale };
}
