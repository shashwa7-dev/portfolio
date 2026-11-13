import { describe, expect, it } from "vitest";
import { cardPose, createLanyard, lanyardAtRest, LANYARD, setAnchor, stepLanyard, toLocal } from "./lanyard";
import { STEP } from "./loop";

const run = (s: ReturnType<typeof createLanyard>, n: number, drag: { x: number; y: number } | null = null) => {
  for (let i = 0; i < n; i++) stepLanyard(s, STEP, drag);
};

describe("lanyard", () => {
  it("settles hanging straight", () => {
    const s = createLanyard({ x: 200, y: -40 });
    // The opening swing dies out in about 20 s at 120 Hz.
    run(s, 2400);
    const { clip, angle } = cardPose(s);
    expect(Math.abs(angle)).toBeLessThan(0.01);
    expect(Math.abs(Math.hypot(s.arm.x - clip.x, s.arm.y - clip.y) - LANYARD.armLen)).toBeLessThan(0.5);
    expect(Math.abs(clip.y - (-40 + LANYARD.segments * LANYARD.segLen))).toBeLessThan(1);
    expect(lanyardAtRest(s)).toBe(true);
  });

  it("gives a negative angle when the card swings right", () => {
    const s = createLanyard({ x: 200, y: -40 }, 0);
    const clip = s.points[s.points.length - 1];
    s.arm.x = clip.x + 100;
    expect(cardPose(s).angle).toBeLessThan(0);
  });

  it("pins the arm to the drag point", () => {
    const s = createLanyard({ x: 200, y: -40 });
    run(s, 60, { x: 400, y: 300 });
    expect(s.arm.x).toBe(400);
    expect(s.arm.y).toBe(300);
    for (let i = 0; i < s.points.length - 1; i++) {
      const a = s.points[i];
      const b = s.points[i + 1];
      expect(Math.abs(Math.hypot(b.x - a.x, b.y - a.y) - LANYARD.segLen)).toBeLessThan(1);
    }
  });

  it("follows a moved anchor", () => {
    const s = createLanyard({ x: 200, y: -40 });
    setAnchor(s, { x: 500, y: -40 });
    run(s, 1200);
    expect(Math.abs(cardPose(s).clip.x - 500)).toBeLessThan(1);
  });

  it("maps a pointer through the card's scale", () => {
    expect(toLocal({ x: 160, y: 130 }, { left: 100, top: 100 }, 0.6)).toEqual({ x: 100, y: 50 });
  });
});
