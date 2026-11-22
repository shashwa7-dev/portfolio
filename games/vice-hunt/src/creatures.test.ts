import { describe, expect, it } from "vitest";
import { CREATURES, KINDS, isRare, kindsWhere, penaltyFor, pointsFor, streaks, type Prey, type Protected } from "./creatures";

describe("creature registry", () => {
  it("every kind has a lane, a size with positive w and h, and hits[0] <= hits[1]", () => {
    for (const k of KINDS) {
      const c = CREATURES[k];
      expect(["sky", "ground", "sea"]).toContain(c.lane);
      expect(c.size[0]).toBeGreaterThan(0);
      expect(c.size[1]).toBeGreaterThan(0);
      expect(c.rule.hits[0]).toBeLessThanOrEqual(c.rule.hits[1]);
    }
  });

  it("lists kinds in registry order and groups them by role", () => {
    expect(KINDS).toEqual(["rabbit", "iguana", "flamingo", "cow", "tiger", "shark", "merman", "ufo", "bigfoot", "ostrich", "gator"]);
    expect(kindsWhere("prey")).toEqual(["rabbit", "iguana", "flamingo"]);
    expect(kindsWhere("protected")).toEqual(["cow", "tiger"]);
    expect(kindsWhere("hostile")).toEqual(["bigfoot", "gator"]);
  });

  it("isRare is true for exactly the eight rares", () => {
    expect(KINDS.filter(isRare)).toEqual(["cow", "tiger", "shark", "merman", "ufo", "bigfoot", "ostrich", "gator"]);
  });

  it("has the roller ostrich and the candy gator", () => {
    expect(CREATURES.ostrich).toMatchObject({
      enabled: true, role: "trophy", lane: "ground", rule: { hits: [3, 3] }, points: 700,
      spawn: { perMinute: 0.4 }, size: [96, 133], move: "skate", hit: "pluck", finish: "plucked",
    });
    expect(CREATURES.gator).toMatchObject({
      enabled: true, role: "hostile", lane: "ground", rule: { hits: [5, 6] }, points: 1200,
      spawn: { perMinute: 0.35 }, size: [120, 152], move: "swagger", finish: "candy-pop",
      threat: { kind: "returns-fire", perShot: 0.5, max: 1.5, attack: "candy-gun" },
    });
    expect("boss" in CREATURES.gator).toBe(false);
    expect(streaks("ostrich")).toBe(true);
    expect(streaks("gator")).toBe(false);
  });

  it("only prey and trophy kills build streaks", () => {
    expect(streaks("cow")).toBe(false);
    expect(streaks("tiger")).toBe(false);
    expect(streaks("shark")).toBe(true);
    expect(streaks("rabbit")).toBe(true);
    expect(streaks("bigfoot")).toBe(false);
  });

  it("pointsFor reads the record, 0 for protected", () => {
    expect(pointsFor("ufo")).toBe(1000);
    expect(pointsFor("bigfoot")).toBe(3000);
    expect(pointsFor("cow")).toBe(0);
  });

  it("penaltyFor: cow on every hit, tiger only on the finish, others none", () => {
    expect(penaltyFor("cow", 1, false)).toBe(-500);
    expect(penaltyFor("cow", 2, true)).toBe(-500);
    expect(penaltyFor("tiger", 1, false)).toBe(0);
    expect(penaltyFor("tiger", 3, true)).toBe(-250);
    expect(penaltyFor("shark", 3, true)).toBe(0);
  });

  it("invalid role combinations do not type-check", () => {
    const base = {
      lane: "ground", size: [1, 1], speed: [1, 1], spawn: { weight: 1 }, rule: { hits: [1, 1] },
      move: "strut", hit: "none", finish: "falls",
    } as const;
    // @ts-expect-error a prey has no threat
    const prey: Prey = { ...base, role: "prey", points: 1, threat: { kind: "retaliates", damage: 1, attack: "claw-swipe" } };
    // @ts-expect-error a protected creature has no points
    const prot: Protected = { ...base, role: "protected", penalty: { perHit: -1 }, points: 5 };
    expect([prey, prot]).toHaveLength(2);
  });
});
