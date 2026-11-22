import { describe, expect, it } from "vitest";
import { accuracy, callout, emptyTally, hitCount, killLabel, recordHit, recordKill, recordPenalty, recordShot } from "./streak";

describe("callout", () => {
  it("says nothing for a lone kill", () => {
    expect(callout(1)).toBeNull();
    expect(callout(0)).toBeNull();
  });
  it("calls a double, then a triple for three or more", () => {
    expect(callout(2)).toBe("DOUBLE!");
    expect(callout(3)).toBe("TRIPLE!");
    expect(callout(7)).toBe("TRIPLE!");
  });
});

describe("accuracy", () => {
  it("is 0 with no shots, not NaN", () => {
    expect(accuracy(0, 0)).toBe(0);
  });
  it("is a whole percentage of hits over shots", () => {
    expect(accuracy(7, 11)).toBe(64);
    expect(accuracy(3, 3)).toBe(100);
    expect(accuracy(0, 5)).toBe(0);
    expect(accuracy(1, 3)).toBe(33);
  });
});

describe("killLabel", () => {
  it("names the animal in capitals", () => {
    expect(killLabel("flamingo")).toBe("FLAMINGO");
    expect(killLabel("bigfoot")).toBe("BIGFOOT");
  });
});

const ALL = ["rabbit", "iguana", "flamingo", "cow", "tiger", "shark", "merman", "ufo", "bigfoot"] as const;
const zeros = Object.fromEntries(ALL.map((k) => [k, 0]));

describe("tally", () => {
  it("starts with every kind at zero", () => {
    const t = emptyTally(ALL);
    expect(t.hits).toEqual(zeros);
    expect(t.kills).toEqual(zeros);
    expect(t.met).toEqual([]);
    expect(t.entries).toEqual([]);
  });
  it("counts shots, kills, the best streak and the log", () => {
    let t = emptyTally(ALL);
    t = recordShot(t);
    t = recordKill(t, "rabbit", 1, 100);
    t = recordShot(t);
    t = recordKill(t, "rabbit", 3, 200);
    expect(t.shots).toBe(2);
    expect(t.kills).toEqual({ ...zeros, rabbit: 2 });
    expect(t.bestStreak).toBe(3);
    expect(t.log).toEqual([{ kind: "rabbit", streak: 1 }, { kind: "rabbit", streak: 3 }]);
    expect(t.entries).toEqual([{ kind: "rabbit", points: 100 }, { kind: "rabbit", points: 200 }]);
  });
  it("counts hits per kind and records a kind as met once", () => {
    let t = emptyTally(ALL);
    t = recordHit(t, "cow");
    t = recordHit(t, "cow");
    expect(t.hits.cow).toBe(2);
    expect(t.met).toEqual(["cow"]);
    expect(hitCount(t)).toBe(2);
  });
  it("one cow brought down by its two hits counts as one cow downed, not two", () => {
    let t = emptyTally(ALL);
    t = recordHit(t, "cow", false);
    t = recordHit(t, "cow", true); // the finishing hit
    expect(t.downed.cow).toBe(1);
    expect(t.kills.cow).toBe(0); // still never a kill
  });
  it("a penalty adds a negative entry and no kill", () => {
    const t = recordPenalty(emptyTally(ALL), "cow", -500);
    expect(t.kills.cow).toBe(0);
    expect(t.entries).toEqual([{ kind: "cow", points: -500 }]);
  });
  it("does not change the tally it was given", () => {
    const t = emptyTally(ALL);
    recordShot(t);
    recordHit(t, "cow");
    recordKill(t, "bigfoot", 1, 1000);
    recordPenalty(t, "cow", -500);
    expect(t).toEqual(emptyTally(ALL));
  });
});
