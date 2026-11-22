import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng";
import { CANDY_FADE, CANDY_KNOCKED, CANDY_STICK, addCandy, addSplat, addScratches, candyAt, createGlass, knockCandy, shake, shakeOffset, stepGlass, SPLAT_FADE_AT, SPLAT_FADE_FOR, type Candy } from "./glass";
import { randomCandy } from "./candy";

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

  it("candyAt finds the topmost stuck candy and skips knocked or fading ones", () => {
    const g = createGlass();
    const rng = mulberry32(4);
    const a = addCandy(g, 100, 100, 40, 0, randomCandy(rng), false);
    const b = addCandy(g, 110, 100, 40, 0, randomCandy(rng), false);
    expect(candyAt(g, 105, 100)).toBe(b);
    expect(candyAt(g, 300, 100)).toBeNull();
    knockCandy(b, rng);
    expect(candyAt(g, 105, 100)).toBe(a);
    for (let t = 0; t < CANDY_STICK + 0.1; t += 0.05) stepGlass(g, 0.05);
    expect(candyAt(g, 100, 100)).toBeNull(); // a is fading now
  });

  it("a knocked candy falls and is gone after a moment", () => {
    const g = createGlass();
    const c = addCandy(g, 100, 100, 40, 0, randomCandy(mulberry32(1)), false);
    knockCandy(c, mulberry32(2));
    let maxY = c.y;
    for (let t = 0; t < CANDY_KNOCKED - 0.1; t += 0.05) {
      stepGlass(g, 0.05);
      maxY = Math.max(maxY, (g.marks[0] as Candy).y);
    }
    expect(maxY).toBeGreaterThan(100);
    stepGlass(g, 0.2);
    expect(g.marks).toHaveLength(0);
  });

  it("a stuck candy stays put for its time, then fades out", () => {
    const g = createGlass();
    addCandy(g, 100, 100, 40, 0, randomCandy(mulberry32(1)), false);
    for (let t = 0; t < CANDY_STICK + CANDY_FADE - 0.1; t += 0.05) stepGlass(g, 0.05);
    expect(g.marks).toHaveLength(1);
    stepGlass(g, 0.2);
    expect(g.marks).toHaveLength(0);
  });
});
