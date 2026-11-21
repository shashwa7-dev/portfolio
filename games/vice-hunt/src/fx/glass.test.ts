import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng";
import { SPLAT_FADE_AT, SPLAT_FADE_FOR, addScratches, addSplat, createGlass, shake, shakeOffset, stepGlass } from "./glass";

describe("glass", () => {
  it("a splat is a 14-lobe blob with 5 flecks and 1 drip, 3 on a main one", () => {
    const g = createGlass();
    const s = addSplat(g, 100, 100, 40, false, mulberry32(2));
    expect(s.outline).toHaveLength(28);
    expect(s.flecks).toHaveLength(15);
    expect(s.drips).toHaveLength(2);
    expect(addSplat(g, 200, 100, 40, true, mulberry32(2)).drips).toHaveLength(6);
  });

  it("a splat goes after fading", () => {
    const g = createGlass();
    addSplat(g, 100, 100, 40, true, mulberry32(2));
    for (let t = 0; t < SPLAT_FADE_AT + SPLAT_FADE_FOR - 0.1; t += 0.05) stepGlass(g, 0.05);
    expect(g.marks).toHaveLength(1);
    stepGlass(g, 0.2);
    expect(g.marks).toHaveLength(0);
  });

  it("scratches are staggered", () => {
    const g = createGlass();
    addScratches(g, 1280, 720);
    expect(g.marks.map((m) => m.delay)).toEqual([0, 0.035, 0.07]);
    const gentle = createGlass();
    addScratches(gentle, 1280, 720, true);
    expect(gentle.marks.every((m) => m.delay === 0 && m.gentle)).toBe(true);
  });

  it("a shake settles back to rest", () => {
    const g = createGlass();
    shake(g, 10, 0.32);
    stepGlass(g, 0.05);
    const mid = shakeOffset(g);
    expect(Math.abs(mid.dx) + Math.abs(mid.dy)).toBeGreaterThan(0);
    stepGlass(g, 0.3);
    expect(shakeOffset(g)).toEqual({ dx: 0, dy: 0 });
  });
});
