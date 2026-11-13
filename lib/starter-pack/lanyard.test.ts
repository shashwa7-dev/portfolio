import { describe, expect, it } from "vitest";
import { breeze, cardPose, carryLanyard, createLanyard, ENTRANCE, entranceY, lanyardAtRest, LANYARD, setAnchor, stepLanyard, toLocal } from "./lanyard";
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

  it("drops in from above the page and lands softly on its anchor", () => {
    expect(entranceY(0, -40)).toBeLessThan(-40 - 800);
    expect(entranceY(ENTRANCE.seconds, -40)).toBe(-40);
    expect(entranceY(ENTRANCE.seconds * 2, -40)).toBe(-40);
    let lowest = -Infinity;
    for (let t = 0; t <= ENTRANCE.seconds; t += 0.01) lowest = Math.max(lowest, entranceY(t, -40));
    // One soft overshoot below the anchor, then back: a landing, not a slam.
    expect(lowest - -40).toBeGreaterThan(10);
    expect(lowest - -40).toBeLessThan(60);
    // Still by the end: the hand-off to the breeze has no visible step.
    expect(Math.abs(entranceY(ENTRANCE.seconds - 1e-6, -40) - -40)).toBeLessThan(0.5);
  });

  it("carries the rig in without stretching the strap or slamming the card", () => {
    const restY = -40;
    const s = createLanyard({ x: 200, y: restY - ENTRANCE.drop }, 0);
    const strap = LANYARD.segments * LANYARD.segLen;
    let t = 0;
    let maxStretch = 0;
    let maxJerk = 0;
    let lastVy = 0;
    for (let i = 0; i < 120 * 3; i++) {
      t += STEP;
      if (t <= ENTRANCE.seconds + STEP) carryLanyard(s, 0, entranceY(t, restY) - s.anchor.y, STEP);
      stepLanyard(s, STEP, null);
      let len = 0;
      for (let k = 0; k < s.points.length - 1; k++) {
        len += Math.hypot(s.points[k + 1].x - s.points[k].x, s.points[k + 1].y - s.points[k].y);
      }
      maxStretch = Math.max(maxStretch, Math.abs(len / strap - 1));
      // From the second step: the first only picks up the starting speed.
      if (i > 0) maxJerk = Math.max(maxJerk, Math.abs(s.vel.y - lastVy));
      lastVy = s.vel.y;
    }
    expect(s.anchor.y).toBeCloseTo(restY, 5);
    expect(maxStretch).toBeLessThan(0.01);
    // A gentle brake (under 12,000 px/s²): the old drop lost about 2,600 px/s in a tenth of a second.
    expect(maxJerk).toBeLessThan(100);
    expect(Math.abs(s.arm.y - (restY + strap + LANYARD.armLen))).toBeLessThan(1);
  });
});
