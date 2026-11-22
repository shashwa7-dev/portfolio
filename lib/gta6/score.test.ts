import { describe, expect, it } from "vitest";
import { breakdown, scoreFor, totalScore } from "./score";
import { emptyTally, recordKill, recordPenalty } from "./streak";

describe("scoreFor", () => {
  it("is the base for a lone kill", () => {
    expect(scoreFor(100, 1)).toBe(100);
    expect(scoreFor(100, 0)).toBe(100);
  });
  it("adds 50% for a double", () => {
    expect(scoreFor(100, 2)).toBe(150);
    expect(scoreFor(150, 2)).toBe(225);
  });
  it("doubles a triple or more", () => {
    expect(scoreFor(100, 3)).toBe(200);
    expect(scoreFor(3000, 5)).toBe(6000);
  });
});

describe("totalScore", () => {
  const e = (...points: number[]) => ({ entries: points.map((p) => ({ kind: "cow" as const, points: p })) });
  it("is 0 with no entries", () => {
    expect(totalScore(e())).toBe(0);
    expect(totalScore(emptyTally(["rabbit"]))).toBe(0);
  });
  it("clamps at zero at every step", () => {
    expect(totalScore(e(600, -500))).toBe(100);
    expect(totalScore(e(-500, 600))).toBe(600);
    expect(totalScore(e(200, -500, 600))).toBe(600);
  });
  it("folds kills and penalties from a tally", () => {
    let t = emptyTally(["rabbit", "cow"]);
    t = recordKill(t, "rabbit", 2, scoreFor(100, 2)); // 150
    t = recordPenalty(t, "cow", -500); // clamped to 0
    t = recordKill(t, "rabbit", 1, scoreFor(100, 1)); // 100
    expect(totalScore(t)).toBe(100);
  });
});

describe("breakdown", () => {
  const base = (k: string) => ({ rabbit: 100, iguana: 150, merman: 1000 })[k] ?? 0;
  const ALL = ["rabbit", "iguana", "merman", "cow"] as const;
  const sum = (b: ReturnType<typeof breakdown>) =>
    Object.values(b.earned).reduce((a, n) => a + n, 0) + b.streakBonus + b.floor;

  it("gives each kind its kills at base points, and the streak extra on its own line", () => {
    let t = emptyTally(ALL);
    t = recordKill(t, "rabbit", 1, 100);
    t = recordKill(t, "rabbit", 2, 150); // a double: +50
    t = recordKill(t, "iguana", 3, 300); // a triple: +150
    const b = breakdown(t, base);
    expect(b.earned.rabbit).toBe(200);
    expect(b.earned.iguana).toBe(150);
    expect(b.streakBonus).toBe(200);
    expect(b.floor).toBe(0);
    expect(sum(b)).toBe(totalScore(t));
  });

  it("puts a protected kind's penalties on its own line", () => {
    let t = recordKill(emptyTally(ALL), "merman", 1, 1000);
    t = recordPenalty(t, "cow", -500);
    t = recordPenalty(t, "cow", -500);
    const b = breakdown(t, base);
    expect(b.earned.cow).toBe(-1000);
    expect(sum(b)).toBe(totalScore(t));
  });

  it("shows what the zero floor kept, so the lines still add up to the score", () => {
    let t = recordPenalty(emptyTally(ALL), "cow", -500); // at 0, the score stays 0
    t = recordKill(t, "rabbit", 1, 100);
    const b = breakdown(t, base);
    expect(totalScore(t)).toBe(100);
    expect(b.floor).toBe(500);
    expect(sum(b)).toBe(100);
  });
});
