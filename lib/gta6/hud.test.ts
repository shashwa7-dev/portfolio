import { describe, expect, it } from "vitest";
import type { Kind } from "@games/vice-hunt";
import { damageLabel, heartFills, heartsLabel, hitLabel, penaltyLabel, rareCount } from "./hud";

describe("rareCount", () => {
  // The menu's rares, as the package's isRare and isEnabled would say (the
  // tiger is off): a hand-written stand-in, so lib/ never imports the game.
  const inMenu = (k: Kind) => ["cow", "shark", "merman", "ufo", "bigfoot"].includes(k);

  it("counts the met kinds the menu lists, and nothing else", () => {
    expect(rareCount([], inMenu)).toBe(0);
    expect(rareCount(["rabbit", "cow", "flamingo", "ufo"], inMenu)).toBe(2);
    expect(rareCount(["tiger", "bigfoot"], inMenu)).toBe(1); // a disabled rare met on a dev page
  });
});

describe("hearts", () => {
  it("labels health for readers", () => {
    expect(heartsLabel(1.5)).toBe("Health: 1.5 of 3");
    expect(heartsLabel(3)).toBe("Health: 3 of 3");
    expect(heartsLabel(0)).toBe("Health: 0 of 3");
  });

  it("fills each of the three hearts whole, half or not at all", () => {
    expect(heartFills(3)).toEqual([1, 1, 1]);
    expect(heartFills(2.5)).toEqual([1, 1, 0.5]);
    expect(heartFills(1.5)).toEqual([1, 0.5, 0]);
    expect(heartFills(0.5)).toEqual([0.5, 0, 0]);
    expect(heartFills(0)).toEqual([0, 0, 0]);
  });

  it("pops the hearts lost, a half as ½", () => {
    expect(damageLabel(0.5)).toBe("−½ ♥");
    expect(damageLabel(1.5)).toBe("−1.5 ♥");
    expect(damageLabel(1)).toBe("−1 ♥");
  });
});

describe("pop labels", () => {
  it("counts a hit that does not finish, out of more than one", () => {
    expect(hitLabel(1, 3, 0)).toBe("1 / 3");
    expect(hitLabel(2, 3, 0)).toBe("2 / 3");
  });

  it("says nothing for a finishing hit, a secret total, a one-hit kind or a penalised hit", () => {
    expect(hitLabel(3, 3, 0)).toBeNull(); // the kill or penalty pop says it
    expect(hitLabel(4, undefined, 0)).toBeNull(); // the UFO, Bigfoot
    expect(hitLabel(1, 1, 0)).toBeNull(); // a rabbit
    expect(hitLabel(1, 2, -500)).toBeNull(); // the cow: her −500 pops instead
  });

  it("writes a penalty with a minus sign", () => {
    expect(penaltyLabel(-500)).toBe("−500");
    expect(penaltyLabel(-250)).toBe("−250");
  });
});
