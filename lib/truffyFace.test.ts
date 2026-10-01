import { describe, expect, it } from "vitest";
import {
  FACE,
  blinkPlan,
  lookAt,
  lookFor,
  pickMood,
  type MoodInput,
} from "./truffyFace";

const calm: MoodInput = {
  hidden: false,
  chat: "closed",
  idleMs: 0,
  distance: 1000,
  sinceFastMs: Infinity,
  sinceBackMs: Infinity,
};

describe("lookAt", () => {
  it("looks straight ahead when the target is on the centre", () => {
    expect(lookAt({ x: 10, y: 10 }, { x: 10, y: 10 })).toEqual({ x: 0, y: 0 });
  });

  it("points toward the target", () => {
    const l = lookAt({ x: 100, y: 0 }, { x: 0, y: 0 }, 200);
    expect(l.x).toBeCloseTo(0.5);
    expect(l.y).toBeCloseTo(0);
  });

  it("never leaves the unit circle, however far the cursor is", () => {
    const l = lookAt({ x: 5000, y: -5000 }, { x: 0, y: 0 }, 200);
    expect(Math.hypot(l.x, l.y)).toBeCloseTo(1);
    expect(l.x).toBeGreaterThan(0);
    expect(l.y).toBeLessThan(0);
  });
});

describe("pickMood", () => {
  it("is idle when nothing is going on", () => {
    expect(pickMood(calm)).toBe("idle");
  });

  it("is happy when the cursor is close", () => {
    expect(pickMood({ ...calm, distance: FACE.nearPx - 1 })).toBe("happy");
  });

  it("is startled just after a fast movement, and not after", () => {
    expect(pickMood({ ...calm, sinceFastMs: 100 })).toBe("startled");
    expect(pickMood({ ...calm, sinceFastMs: FACE.startleMs + 1 })).toBe("idle");
  });

  it("is startled before happy, so a fast swoop onto it still reads", () => {
    expect(pickMood({ ...calm, sinceFastMs: 100, distance: 10 })).toBe("startled");
  });

  it("falls asleep after the idle threshold", () => {
    expect(pickMood({ ...calm, idleMs: FACE.sleepAfterMs - 1 })).toBe("idle");
    expect(pickMood({ ...calm, idleMs: FACE.sleepAfterMs })).toBe("sleepy");
  });

  it("perks up for a moment after the tab comes back", () => {
    expect(pickMood({ ...calm, sinceBackMs: 200 })).toBe("happy");
    expect(pickMood({ ...calm, sinceBackMs: FACE.perkMs + 1 })).toBe("idle");
  });

  it("is away while the tab is hidden, whatever else is true", () => {
    expect(pickMood({ ...calm, hidden: true, chat: "replying", distance: 0 })).toBe("away");
  });

  it("follows the chat ahead of the cursor", () => {
    expect(pickMood({ ...calm, chat: "typing", distance: 0 })).toBe("listening");
    expect(pickMood({ ...calm, chat: "thinking", idleMs: 1e9 })).toBe("thinking");
    expect(pickMood({ ...calm, chat: "replying", sinceFastMs: 0 })).toBe("talking");
  });

  it("still reacts to the cursor while the chat is open but quiet", () => {
    expect(pickMood({ ...calm, chat: "idle", distance: 10 })).toBe("happy");
  });
});

describe("lookFor", () => {
  it("lets the cursor drive the eyes in cursor moods", () => {
    for (const m of ["idle", "happy", "startled", "talking"] as const) {
      expect(lookFor(m)).toBeNull();
    }
  });

  it("holds a fixed gaze in the others", () => {
    expect(lookFor("away")!.y).toBeGreaterThan(0);
    expect(lookFor("listening")!.y).toBeGreaterThan(0);
    expect(lookFor("thinking")!.y).toBeLessThan(0);
    expect(lookFor("sleepy")).toEqual({ x: 0, y: expect.any(Number) });
  });
});

describe("blinkPlan", () => {
  it("waits between the min and max gap", () => {
    expect(blinkPlan(0, 0.9).waitMs).toBe(FACE.blinkMinMs);
    expect(blinkPlan(1, 0.9).waitMs).toBe(FACE.blinkMaxMs);
  });

  it("sometimes blinks twice", () => {
    expect(blinkPlan(0.5, 0).double).toBe(true);
    expect(blinkPlan(0.5, 0.99).double).toBe(false);
  });
});
