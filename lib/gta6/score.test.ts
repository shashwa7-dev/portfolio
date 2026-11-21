import { describe, expect, it } from "vitest";
import { scoreFor, totalScore } from "./score";
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
