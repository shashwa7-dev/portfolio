import { describe, expect, it } from "vitest";
import { accuracy, callout, emptyTally, killLabel, recordKill, recordShot } from "./streak";

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

describe("tally", () => {
  it("counts shots, hits, kills and the best streak", () => {
    let t = emptyTally();
    t = recordShot(t, true);
    t = recordKill(t, "rabbit", 1);
    t = recordShot(t, false);
    t = recordShot(t, true);
    t = recordKill(t, "iguana", 1);
    t = recordShot(t, true);
    t = recordKill(t, "rabbit", 2);
    t = recordShot(t, true);
    t = recordKill(t, "flamingo", 3);
    t = recordShot(t, true);
    t = recordKill(t, "rabbit", 1);
    expect(t.shots).toBe(6);
    expect(t.hits).toBe(5);
    expect(t.kills).toEqual({ rabbit: 3, iguana: 1, flamingo: 1, cow: 0, tiger: 0, shark: 0, merman: 0, ufo: 0, bigfoot: 0 });
    expect(t.bestStreak).toBe(3);
  });
  it("does not change the tally it was given", () => {
    const t = emptyTally();
    recordShot(t, true);
    recordKill(t, "bigfoot", 1);
    expect(t).toEqual(emptyTally());
  });
});
