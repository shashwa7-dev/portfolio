/**
 * The 'SHIPPED' pod's bubbles: balls in a box that lives on the swinging card.
 *
 * Gravity is given in the card's frame (see `frameGravity`), so when the card
 * turns or jolts, the balls feel it. Mass follows area (r²), so a small ball
 * bounces off a big one and barely moves it. Balls roll along the floor with
 * a spin that tends toward no slip. Pure: no DOM.
 */
import type { Vec } from "./lanyard";

export type Ball = {
  id: string;
  r: number;
  m: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  squash: number;
};

/** The pod's inner box, origin at its top left. */
export type Box = { w: number; h: number };

export const BUBBLES = {
  gravity: 1500,
  wallRestitution: 0.5,
  ballRestitution: 0.6,
  rollCoupling: 0.04,
  airDrag: 0.9992,
  spinDrag: 0.9996,
  /** Below this speed (px/s) a bounce off the floor or another ball stops dead. */
  restSpeed: 25,
  /** Rolling resistance per step while on the floor. */
  floorFriction: 0.997,
  squashDecay: 0.86,
} as const;

export function createBalls(defs: { id: string; r: number }[], box: Box): Ball[] {
  const gap = box.w / (defs.length + 1);
  return defs.map((d, i) => ({
    id: d.id,
    r: d.r,
    m: d.r * d.r,
    x: Math.min(box.w - d.r, Math.max(d.r, gap * (i + 1))),
    y: d.r + (i % 3) * 10,
    vx: (i - (defs.length - 1) / 2) * 30,
    vy: 0,
    angle: 0,
    spin: 0,
    squash: 0,
  }));
}

/**
 * What a ball on the card feels: world gravity minus the card's own
 * acceleration, turned into the card's frame by `-angle`.
 */
export function frameGravity(angle: number, acc: Vec, g: number = BUBBLES.gravity): Vec {
  const k = g / 2000;
  const fx = -acc.x * k;
  const fy = g - acc.y * k;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: fx * c + fy * s, y: -fx * s + fy * c };
}

/** Below this closing speed (px/s) two bubbles touching make no clack. */
export const CLACK_MIN_SPEED = 60;

/**
 * Advances the bubbles one step. Returns the closing speed (px/s) of every
 * bubble-on-bubble hit in this step, for the clack sound.
 */
export function stepBalls(balls: Ball[], box: Box, dt: number, gravity: Vec): number[] {
  const hits: number[] = [];
  const B = BUBBLES;
  const start = balls.map((b) => ({ x: b.x, y: b.y }));
  for (const b of balls) {
    b.vx += gravity.x * dt;
    b.vy += gravity.y * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < b.r) {
      b.x = b.r;
      b.vx = Math.abs(b.vx) * B.wallRestitution;
    }
    if (b.x > box.w - b.r) {
      b.x = box.w - b.r;
      b.vx = -Math.abs(b.vx) * B.wallRestitution;
    }
    if (b.y < b.r) {
      b.y = b.r;
      b.vy = Math.abs(b.vy) * B.wallRestitution;
    }
    if (b.y > box.h - b.r) {
      b.y = box.h - b.r;
      b.vy = Math.abs(b.vy) < B.restSpeed ? 0 : -Math.abs(b.vy) * B.wallRestitution;
      // Friction at the floor drives spin toward rolling without slipping.
      const slip = b.vx - b.spin * b.r;
      b.vx -= slip * B.rollCoupling;
      b.spin += (slip * B.rollCoupling * 0.4) / b.r;
      b.vx *= B.floorFriction;
    }
    b.vx *= B.airDrag;
    b.vy *= B.airDrag;
    b.spin *= B.spinDrag;
    b.angle += b.spin * dt;
    b.squash *= B.squashDecay;
  }

  // One pass with impulses, then a few position-only passes: a single pass
  // lets a wall clamp push one ball back into its neighbour.
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const v = separate(balls[i], balls[j], pass === 0);
        if (v > 0) hits.push(v);
      }
    }
    for (const b of balls) {
      b.x = Math.min(box.w - b.r, Math.max(b.r, b.x));
      b.y = Math.min(box.h - b.r, Math.max(b.r, b.y));
    }
  }

  // A ball wedged by its neighbours or a wall keeps being handed velocity it
  // can never use, so it would never read as resting. When it has barely
  // moved, its velocity is what it actually did.
  balls.forEach((b, i) => {
    const ax = (b.x - start[i].x) / dt;
    const ay = (b.y - start[i].y) / dt;
    if (Math.hypot(ax, ay) < B.restSpeed / 2) {
      b.vx = ax;
      b.vy = ay;
    }
  });
  return hits;
}

/** Pushes two overlapping balls apart; returns the closing speed if it applied an impulse, else 0. */
function separate(p: Ball, q: Ball, withImpulse: boolean): number {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const d = Math.hypot(dx, dy);
  const min = p.r + q.r;
  if (d >= min || d === 0) return 0;
  const nx = dx / d;
  const ny = dy / d;
  const over = min - d;
  const tm = p.m + q.m;
  p.x -= (nx * over * q.m) / tm;
  p.y -= (ny * over * q.m) / tm;
  q.x += (nx * over * p.m) / tm;
  q.y += (ny * over * p.m) / tm;
  if (!withImpulse) return 0;
  const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
  if (rv >= 0) return 0;
  const e = -rv < BUBBLES.restSpeed ? 0 : BUBBLES.ballRestitution;
  const imp = (-(1 + e) * rv) / (1 / p.m + 1 / q.m);
  p.vx -= (imp * nx) / p.m;
  p.vy -= (imp * ny) / p.m;
  q.vx += (imp * nx) / q.m;
  q.vy += (imp * ny) / q.m;
  return -rv;
}

/** A press: the ball squashes and jumps. The same push sends light balls further. */
export function poke(ball: Ball, rand: () => number = Math.random): void {
  const k = 900 / Math.sqrt(ball.m);
  ball.vy = (-(380 + rand() * 160) * k * 1.4) / 30;
  ball.vx += ((rand() - 0.5) * 260 * k) / 30;
  ball.spin += (rand() - 0.5) * 14;
  ball.squash = 1;
}

export function ballsAtRest(balls: Ball[], eps = 2): boolean {
  return balls.every((b) => Math.hypot(b.vx, b.vy) < eps);
}
