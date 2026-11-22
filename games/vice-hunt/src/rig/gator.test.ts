import { describe, expect, it } from "vitest";
import { GATOR_FRAMES } from "../art/gator";
import { SPRITES } from "../art/sprites";
import { expectSvgDocument } from "../art/svgTestkit";
import { MOVES } from "../modules";
import { mulberry32 } from "../rng";
import { createWorld, spawn } from "../world";
import { G_POSES, aimBlend, angerOf, gatorColors, gatorPoints, gatorSpeed, gatorWalk } from "./gator";

const hue = (hsl: string) => Number(/hsl\((\d+(?:\.\d+)?)/.exec(hsl)?.[1]);

describe("candy gator rig", () => {
  it("gets angry with hits, fully red one hit before the last", () => {
    expect(angerOf(0, 6)).toBe(0);
    expect(angerOf(5, 6)).toBe(1);
    expect(angerOf(2, 5)).toBe(0.5);
    expect(angerOf(9, 5)).toBe(1);
  });

  it("goes green to yellow to red", () => {
    expect(hue(gatorColors(0).skin)).toBe(135);
    expect(hue(gatorColors(0.5).skin)).toBeCloseTo(68.5, 1);
    expect(hue(gatorColors(1).skin)).toBe(2);
  });

  it("walks with planted feet near the stand pose and never below the ground", () => {
    for (const a of [0, 1]) {
      for (let t = 0; t < 3; t += 0.05) {
        const p = gatorWalk(t, a);
        expect(Math.abs(p.fN[0] - G_POSES.stand.fN[0])).toBeLessThanOrEqual(16);
        expect(Math.abs(p.fF[0] - G_POSES.stand.fF[0])).toBeLessThanOrEqual(16);
        expect(p.fN[1]).toBeLessThanOrEqual(200);
        expect(p.fF[1]).toBeLessThanOrEqual(200);
      }
    }
  });

  it("aims the gun forward: the muzzle is out in front at full aim", () => {
    const pts = gatorPoints(aimBlend(1), { anger: 0, gun: true });
    expect(pts.muzzle[0]).toBeGreaterThan(140);
    const down = gatorPoints(aimBlend(0), { anger: 0, gun: true });
    expect(down.muzzle[1]).toBeGreaterThan(pts.muzzle[1]);
  });

  it("swaggers faster when angry and stands still while shooting", () => {
    expect(gatorSpeed(0)).toBeCloseTo(0.065);
    expect(gatorSpeed(1)).toBeCloseTo(0.125);
    const rng = mulberry32(2);
    const world = createWorld(1000, 500, rng);
    const a = spawn(world, rng, "gator");
    expect(MOVES.swagger.advance?.(a, 1 / 60, rng)).toBe(true);
    a.shootK = 0.3;
    expect(MOVES.swagger.advance?.(a, 1 / 60, rng)).toBe(false);
    a.shootK = undefined;
    a.hits = a.hp - 1;
    const x0 = a.x;
    MOVES.swagger.advance?.(a, 1 / 60, rng);
    expect(Math.abs(a.x - x0)).toBeCloseTo(Math.abs(a.vx) * (0.125 / 0.065 - 1) / 60, 5);
  });

  it("has two HUD frames, complete SVG documents", () => {
    GATOR_FRAMES.forEach(expectSvgDocument);
    expect(SPRITES.gator).toBe(GATOR_FRAMES);
  });
});
