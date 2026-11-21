// The one particle system: poofs of dust and feathers, fireworks, smoke,
// fountain fish and splash droplets. `emit` and `stepParticles` are pure (no
// DOM; callers pass their rng's numbers in); `drawParticles` and `drawRings`
// take the context and keep no state.
import type { Rng } from "../rng";
import type { Art } from "../sprites";

export type ParticleKind = "dot" | "star" | "smoke" | "fish";

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // seconds once it shows
  age: number;
  size: number; // radius in px (a fish: its length)
  color: string;
  kind: ParticleKind;
  delay: number; // seconds before it shows and moves
  drag: number; // per second, taken off the velocity
  g: number; // its own gravity, px/s², added to stepParticles' gravity
  grow: number; // size at the end of its life, as a multiple of `size`
  spin: number; // rad/s: a dot that spins is a feather (a flat ellipse); a fish's wiggle phase
  alpha: number; // opacity at birth; fades to 0 over its life (fish do not fade)
};

export type ParticleSpec = Pick<Particle, "x" | "y" | "vx" | "vy" | "life" | "size" | "color" | "kind"> &
  Partial<Pick<Particle, "delay" | "drag" | "g" | "grow" | "spin" | "alpha">>;

export function emit(list: Particle[], spec: ParticleSpec): Particle {
  const p: Particle = { age: 0, delay: 0, drag: 0, g: 0, grow: 1, spin: 0, alpha: 1, ...spec };
  list.push(p);
  return p;
}

// Velocity that covers `d` px over `life` seconds under DRIFT_DRAG, an
// ease-out like the prototype's CSS puffs.
const DRIFT_DRAG = 3;
export const drift = (d: number, life: number): number =>
  (d * (DRIFT_DRAG / life)) / (1 - Math.exp(-DRIFT_DRAG));
export const driftDrag = (life: number): number => DRIFT_DRAG / life;

/** Moves, slows and ages every particle; drops the finished ones in place. */
export function stepParticles(list: Particle[], dt: number, gravity: number): void {
  let n = 0;
  for (const p of list) {
    if (p.delay > 0) {
      p.delay -= dt;
      list[n++] = p;
      continue;
    }
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const keep = Math.max(0, 1 - p.drag * dt);
    p.vx *= keep;
    p.vy = p.vy * keep + (gravity + p.g) * dt;
    if (p.age < p.life) list[n++] = p;
  }
  list.length = n;
}

// Splash rings: a flat ellipse that grows and fades, drawn procedurally.
export type Ring = { x: number; y: number; big: boolean; age: number };
export const RING_LIFE = 0.9;
const DROP = "rgba(233,251,255,.95)";

/** A splash at (x, y): a ring (logged in `rings`) and droplets thrown up. */
export function splash(parts: Particle[], rings: Ring[], x: number, y: number, big: boolean, rng: Rng): void {
  rings.push({ x, y, big, age: 0 });
  const w = big ? 90 : 46;
  for (let i = 0; i < (big ? 9 : 5); i++) {
    const life = 0.65;
    emit(parts, {
      kind: "dot",
      x: x + (rng() - 0.5) * w * 0.5,
      y,
      vx: drift((rng() - 0.5) * 50, life),
      vy: drift(-(20 + rng() * 40), life),
      drag: driftDrag(life),
      life,
      size: ((4 + rng() * 5) * 1.4 * 0.6) / 2,
      grow: 3,
      color: DROP,
    });
  }
}

export function stepRings(rings: Ring[], dt: number): void {
  for (const r of rings) r.age += dt;
}

export const ringsDone = (rings: Ring[]): boolean => rings.every((r) => r.age >= RING_LIFE);

export function drawRings(ctx: CanvasRenderingContext2D, rings: Ring[]): void {
  ctx.save();
  ctx.strokeStyle = "#e9fbff";
  ctx.lineWidth = 3;
  for (const r of rings) {
    if (r.age >= RING_LIFE) continue;
    const k = r.age / RING_LIFE;
    const e = 1 - (1 - k) ** 3; // ease-out
    const s = 0.3 + 1.1 * e;
    const w = (r.big ? 90 : 46) * s;
    ctx.globalAlpha = 1 - e;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, w / 2, w * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// The prototype's fishSvg (viewBox 26x12, head at the left), in any colour.
function drawFish(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = "#2b2234";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(2, 6);
  ctx.bezierCurveTo(6, 0, 14, 0, 19, 6);
  ctx.bezierCurveTo(14, 12, 6, 12, 2, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, 6);
  ctx.lineTo(25, 1);
  ctx.lineTo(23.5, 6);
  ctx.lineTo(25, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(9, 3);
  ctx.quadraticCurveTo(11, 6, 9, 9);
  ctx.stroke();
  ctx.fillStyle = "#2b2234";
  ctx.beginPath();
  ctx.arc(5.6, 5, 1.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const d = i % 2 ? r * 0.38 : r;
    ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
  ctx.fill();
}

/** Draws every visible particle. Fish are drawn as vector paths per colour
 *  (the `fish` extra is the pink one), so no tinted copies are kept. */
export function drawParticles(ctx: CanvasRenderingContext2D, list: Particle[], _art?: Art | null): void {
  ctx.save();
  for (const p of list) {
    if (p.delay > 0) continue;
    const k = Math.min(1, p.age / p.life);
    if (p.kind === "fish") {
      // Head (the left end) leads along the arc, with a wiggle.
      const ang = Math.atan2(p.vy, p.vx) + Math.PI + Math.sin((p.age + p.spin) * 22) * ((10 * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      const s = p.size / 26;
      ctx.scale(s, s);
      ctx.translate(-13, -6);
      drawFish(ctx, p.color);
      ctx.restore();
      continue;
    }
    const a = p.alpha * (1 - k);
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    const r = p.size * (1 + (p.grow - 1) * k);
    if (p.kind === "star") {
      drawStar(ctx, p.x, p.y, r);
    } else {
      ctx.beginPath();
      if (p.spin) ctx.ellipse(p.x, p.y, r, r * 0.35, p.spin * p.age, 0, Math.PI * 2);
      else ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
