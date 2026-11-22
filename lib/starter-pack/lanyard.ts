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
  /** Velocity from `carryLanyard` since the last step, px/s: the bubbles feel it, the strap does not. */
  carry: Vec;
};

const ACC_LIMIT = 6000;
const ACC_SMOOTH = 0.15;

function particle(x: number, y: number, invMass: number): Particle {
  return { x, y, px: x, py: y, invMass };
}

export function createLanyard(anchor: Vec, swingX = 110, p: LanyardParams = LANYARD): LanyardState {
  const points: Particle[] = [];
  const seg = p.segLen;
  for (let i = 0; i <= p.segments; i++) points.push(particle(anchor.x, anchor.y + i * seg, i === 0 ? 0 : 1));
  const clip = points[p.segments];
  const dy = Math.sqrt(Math.max(0, p.armLen * p.armLen - swingX * swingX));
  return {
    anchor: { ...anchor },
    points,
    arm: particle(clip.x + swingX, clip.y + dy, p.armInvMass),
    acc: { x: 0, y: 0 },
    moved: Infinity,
    vel: { x: 0, y: 0 },
    carry: { x: 0, y: 0 },
  };
}

export function setAnchor(s: LanyardState, anchor: Vec): void {
  s.anchor = { ...anchor };
  s.moved = Infinity;
}

/**
 * Moves the anchor and the whole rig with it, current and previous positions
 * alike, so the strap neither stretches nor gains speed from the move. The
 * move still counts toward the arm's velocity and acceleration, so the
 * bubbles feel the drop-in land.
 */
export function carryLanyard(s: LanyardState, dx: number, dy: number, dt: number): void {
  s.anchor.x += dx;
  s.anchor.y += dy;
  for (const q of [...s.points, s.arm]) {
    q.x += dx;
    q.y += dy;
    q.px += dx;
    q.py += dy;
  }
  s.carry.x += dx / dt;
  s.carry.y += dy / dt;
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

/**
 * `wind` is a sideways push on the card in px/s² (see `breeze`), so it keeps
 * dangling instead of hanging dead still.
 */
function integrate(q: Particle, damping: number, drop: number): void {
  const vx = (q.x - q.px) * damping;
  const vy = (q.y - q.py) * damping;
  q.px = q.x;
  q.py = q.y;
  q.x += vx;
  q.y += vy + drop;
}

function pin(s: LanyardState, drag: Vec | null): void {
  s.points[0].x = s.anchor.x;
  s.points[0].y = s.anchor.y;
  if (drag) {
    s.arm.x = drag.x;
    s.arm.y = drag.y;
  }
}

/**
 * One physics step. Allocation-free: it runs 120 times a second for as long
 * as the card is on screen, so it reuses each particle's previous position
 * (px, py) instead of building arrays.
 */
export function stepLanyard(
  s: LanyardState,
  dt: number,
  drag: Vec | null,
  p: LanyardParams = LANYARD,
  wind = 0,
): void {
  const drop = p.gravity * dt * dt;
  for (let i = 1; i < s.points.length; i++) integrate(s.points[i], p.damping, drop);
  integrate(s.arm, p.damping, drop);
  s.arm.x += wind * dt * dt;
  pin(s, drag);
  const clip = s.points[p.segments];
  for (let k = 0; k < p.iterations; k++) {
    for (let i = 0; i < p.segments; i++) satisfy(s.points[i], s.points[i + 1], p.segLen);
    satisfy(clip, s.arm, p.armLen);
    pin(s, drag);
  }

  // px, py hold where each particle was before this step.
  let moved = Math.hypot(s.arm.x - s.arm.px, s.arm.y - s.arm.py);
  for (let i = 1; i < s.points.length; i++) {
    const q = s.points[i];
    moved = Math.max(moved, Math.hypot(q.x - q.px, q.y - q.py));
  }
  s.moved = moved;

  const vx = (s.arm.x - s.arm.px) / dt + s.carry.x;
  const vy = (s.arm.y - s.arm.py) / dt + s.carry.y;
  s.carry.x = 0;
  s.carry.y = 0;
  let ax = (vx - s.vel.x) / dt;
  let ay = (vy - s.vel.y) / dt;
  s.vel.x = vx;
  s.vel.y = vy;
  const m = Math.hypot(ax, ay);
  if (m > ACC_LIMIT) {
    ax *= ACC_LIMIT / m;
    ay *= ACC_LIMIT / m;
  }
  s.acc.x = s.acc.x * (1 - ACC_SMOOTH) + ax * ACC_SMOOTH;
  s.acc.y = s.acc.y * (1 - ACC_SMOOTH) + ay * ACC_SMOOTH;
}

/** The card's swing angle (CSS clockwise radians) without allocating; see cardPose. */
export function armAngle(s: LanyardState): number {
  const clip = s.points[s.points.length - 1];
  return Math.atan2(-(s.arm.x - clip.x), s.arm.y - clip.y);
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

/**
 * A light, never-repeating breeze in px/s²: three slow waves at unrelated
 * periods, so the card sways a few degrees forever and never looks looped.
 */
export const BREEZE = { strength: 70, periods: [3.7, 5.9, 2.3], weights: [1, 0.6, 0.35] } as const;

export function breeze(t: number): number {
  let f = 0;
  BREEZE.periods.forEach((period, i) => {
    f += BREEZE.weights[i] * Math.sin((2 * Math.PI * t) / period + i * 1.3);
  });
  return BREEZE.strength * f;
}

/**
 * The drop-in: the whole rig is carried from above the page to its place on
 * a damped spring, so it arrives moving, eases in with one soft overshoot and
 * is still (under half a pixel off) by `seconds`. `v0` is the starting speed
 * as a fraction of `drop` per second.
 */
export const ENTRANCE = { seconds: 1.35, drop: 1100, zeta: 0.8, omega: 6, v0: 3.5 } as const;

export function entranceY(t: number, restY: number): number {
  if (t >= ENTRANCE.seconds) return restY;
  const { zeta, omega, v0, drop } = ENTRANCE;
  const k = Math.max(0, t);
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  const left = Math.exp(-zeta * omega * k) * (Math.cos(wd * k) + ((zeta * omega - v0) / wd) * Math.sin(wd * k));
  return restY - drop * left;
}
