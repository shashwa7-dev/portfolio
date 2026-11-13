import { describe, expect, it } from "vitest";
import { ballsAtRest, createBalls, frameGravity, poke, stepBalls, type Ball, type Box } from "./bubbles";
import { STEP } from "./loop";

/** Deterministic stand-in for Math.random. */
function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const ball = (id: string, r: number, x: number, y: number, vx = 0, vy = 0): Ball => ({
  id, r, m: r * r, x, y, vx, vy, angle: 0, spin: 0, squash: 0,
});

describe("bubbles", () => {
  it("uses plain gravity in an upright frame", () => {
    expect(frameGravity(0, { x: 0, y: 0 })).toEqual({ x: 0, y: 1500 });
  });

  it("turns gravity sideways when the card is turned a quarter", () => {
    const g = frameGravity(Math.PI / 2, { x: 0, y: 0 });
    expect(Math.abs(g.x - 1500)).toBeLessThan(1e-9);
    expect(Math.abs(g.y)).toBeLessThan(1e-9);
  });

  it("stays in the box and never overlaps, even when poked", () => {
    const radii = [30, 25, 15, 14, 15, 14, 15, 14];
    const box: Box = { w: 208, h: 136 };
    const rand = seeded();
    const balls = createBalls(radii.map((r, i) => ({ id: `b${i}`, r })), box);
    let minGap = Infinity;
    for (let i = 0; i < 120 * 12; i++) {
      if (i > 0 && i % 480 === 0) poke(balls[(i / 480) % balls.length], rand);
      stepBalls(balls, box, STEP, frameGravity(0, { x: 0, y: 0 }));
      if (i < 600) continue;
      for (const b of balls) {
        expect(b.x).toBeGreaterThanOrEqual(b.r - 1);
        expect(b.x).toBeLessThanOrEqual(box.w - b.r + 1);
        expect(b.y).toBeGreaterThanOrEqual(b.r - 1);
        expect(b.y).toBeLessThanOrEqual(box.h - b.r + 1);
      }
      for (let a = 0; a < balls.length; a++)
        for (let c = a + 1; c < balls.length; c++) {
          const p = balls[a];
          const q = balls[c];
          minGap = Math.min(minGap, Math.hypot(q.x - p.x, q.y - p.y) - (p.r + q.r));
        }
    }
    expect(minGap).toBeGreaterThan(-0.5);
  });

  it("settles on the floor", () => {
    const box: Box = { w: 100, h: 100 };
    const balls = [ball("a", 15, 50, 20)];
    for (let i = 0; i < 2400; i++) stepBalls(balls, box, STEP, frameGravity(0, { x: 0, y: 0 }));
    expect(Math.abs(balls[0].y - 85)).toBeLessThan(0.5);
    expect(ballsAtRest(balls)).toBe(true);
  });

  it("moves a light ball more than a heavy one in a collision", () => {
    const box: Box = { w: 1000, h: 1000 };
    const small = ball("s", 10, 400, 500, 200, 0);
    const big = ball("b", 30, 450, 500, -200, 0);
    const balls = [small, big];
    for (let i = 0; i < 20; i++) stepBalls(balls, box, STEP, { x: 0, y: 0 });
    expect(Math.abs(small.vx - 200)).toBeGreaterThan(Math.abs(big.vx + 200));
  });

  it("rolls without slipping on the floor", () => {
    const box: Box = { w: 100000, h: 100 };
    const b = ball("r", 15, 100, 85, 200, 0);
    for (let i = 0; i < 600; i++) stepBalls([b], box, STEP, frameGravity(0, { x: 0, y: 0 }));
    expect(Math.abs(b.spin * b.r - b.vx)).toBeLessThan(5);
  });

  it("comes fully to rest, so the animation loop can sleep", () => {
    const box: Box = { w: 208, h: 136 };
    const balls = createBalls([30, 25, 15, 14, 15, 14, 15, 14].map((r, i) => ({ id: `b${i}`, r })), box);
    for (let i = 0; i < 120 * 20; i++) stepBalls(balls, box, STEP, frameGravity(0, { x: 0, y: 0 }));
    expect(ballsAtRest(balls)).toBe(true);
  });
});
