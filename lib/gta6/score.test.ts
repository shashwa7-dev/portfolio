import { describe, expect, it } from "vitest";
import { POINTS, scoreFor, totalScore } from "./score";
import { emptyTally, recordKill } from "./streak";

describe("scoreFor", () => {
  it("gives each animal its points for a lone kill", () => {
    expect(POINTS).toEqual({ rabbit: 100, iguana: 150, flamingo: 200, bigfoot: 1000 });
    expect(scoreFor("rabbit", 1)).toBe(100);
    expect(scoreFor("iguana", 1)).toBe(150);
    expect(scoreFor("flamingo", 1)).toBe(200);
    expect(scoreFor("bigfoot", 1)).toBe(1000);
  });
  it("adds 50% for a double", () => {
    expect(scoreFor("rabbit", 2)).toBe(150);
    expect(scoreFor("iguana", 2)).toBe(225);
    expect(scoreFor("flamingo", 2)).toBe(300);
    expect(scoreFor("bigfoot", 2)).toBe(1500);
  });
  it("doubles a triple or more", () => {
    expect(scoreFor("rabbit", 3)).toBe(200);
    expect(scoreFor("iguana", 3)).toBe(300);
    expect(scoreFor("flamingo", 5)).toBe(400);
    expect(scoreFor("bigfoot", 9)).toBe(2000);
  });
  it("treats a streak of 0 like a lone kill", () => {
    expect(scoreFor("iguana", 0)).toBe(150);
  });
});

describe("totalScore", () => {
  it("is 0 for an empty tally", () => {
    expect(totalScore(emptyTally())).toBe(0);
  });
  it("sums every kill at its own streak", () => {
    let t = emptyTally();
    t = recordKill(t, "rabbit", 1); // 100
    t = recordKill(t, "iguana", 2); // 225
    t = recordKill(t, "flamingo", 3); // 400
    t = recordKill(t, "rabbit", 4); // 200
    t = recordKill(t, "bigfoot", 1); // 1000
    expect(totalScore(t)).toBe(1925);
  });
});
