import { describe, expect, it } from "vitest";
import { breeze, cardPose, createLanyard, ENTRANCE, entranceY, lanyardAtRest, LANYARD, REEL, reelLength, setAnchor, setReel, stepLanyard, toLocal } from "./lanyard";
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

describe("natural dangling", () => {
  it("keeps swaying gently in the breeze and never comes to rest", () => {
    const s = createLanyard({ x: 200, y: -40 }, 0);
    let maxAngle = 0;
    let stillSeconds = 0;
    let movedThisSecond = 0;
    for (let i = 0; i < 120 * 60; i++) {
      stepLanyard(s, STEP, null, LANYARD, breeze(i * STEP));
      if (i < 120 * 10) continue;
      maxAngle = Math.max(maxAngle, Math.abs(cardPose(s).angle));
      movedThisSecond = Math.max(movedThisSecond, s.moved);
      if (i % 120 === 119) {
        // A swing slows at its ends, but every second the card visibly moves.
        if (movedThisSecond < 0.1) stillSeconds++;
        movedThisSecond = 0;
      }
    }
    expect(stillSeconds).toBe(0);
    expect(maxAngle).toBeGreaterThan(0.02);
    expect(maxAngle).toBeLessThan(0.15);
  });

  it("drops in from above the page and lands on its anchor", () => {
    expect(entranceY(0, -40)).toBeLessThan(-40 - 800);
    expect(entranceY(ENTRANCE.seconds, -40)).toBe(-40);
    expect(entranceY(ENTRANCE.seconds * 2, -40)).toBe(-40);
    for (let t = 0; t < ENTRANCE.seconds; t += 0.05) {
      expect(entranceY(t + 0.05, -40)).toBeGreaterThanOrEqual(entranceY(t, -40));
    }
  });
});

describe("feeding out of the slit", () => {
  it("eases the strap from short to full length", () => {
    expect(reelLength(0)).toBeCloseTo(REEL.from, 5);
    expect(reelLength(REEL.seconds)).toBe(1);
    expect(reelLength(REEL.seconds * 3)).toBe(1);
    for (let t = 0; t < REEL.seconds; t += 0.02) expect(reelLength(t + 0.02)).toBeGreaterThanOrEqual(reelLength(t));
  });

  it("lowers the card smoothly, with no jump between steps", () => {
    const s = createLanyard({ x: 200, y: 20 }, 0, LANYARD, REEL.from);
    let prev = cardPose(s).clip.y;
    let maxJump = 0;
    for (let i = 0; i < 120 * 3; i++) {
      setReel(s, reelLength(i * STEP));
      stepLanyard(s, STEP, null);
      const y = cardPose(s).clip.y;
      maxJump = Math.max(maxJump, Math.abs(y - prev));
      prev = y;
    }
    // About 2 px a step at most, at 120 steps a second: a glide, not a snap.
    expect(maxJump).toBeLessThan(2.5);
    expect(Math.abs(prev - (20 + LANYARD.segments * LANYARD.segLen))).toBeLessThan(2);
  });
});
