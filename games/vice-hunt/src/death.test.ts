import { describe, expect, it } from "vitest";
import { DEATHS, deathPose, newPose } from "./death";
import type { Kind } from "./types";

const KINDS: Kind[] = ["rabbit", "iguana", "flamingo", "bigfoot"];
const pose = (k: Kind, t: number, fall = 200) => ({ ...deathPose(k, t, fall, newPose()) });

describe("deathPose", () => {
  it("starts from the living pose for every kind", () => {
    for (const k of KINDS) {
      const p = pose(k, 0);
      expect(p.dx).toBeCloseTo(0);
      expect(p.dy).toBeCloseTo(0);
      expect(p.rot).toBeCloseTo(0);
      expect(p.sy).toBe(1);
      expect(p.alpha).toBe(1);
    }
  });

  it("durations", () => {
    expect(DEATHS.rabbit.duration).toBe(0.8);
    expect(DEATHS.iguana.duration).toBe(0.8);
    expect(DEATHS.flamingo.duration).toBe(1.1);
    expect(DEATHS.bigfoot.duration).toBe(1.4);
  });

  it("rabbit: hops, flips, lands on its back", () => {
    expect(pose("rabbit", 0.225).dy).toBeCloseTo(-36);
    const end = pose("rabbit", 0.8);
    expect(end).toMatchObject({ dx: 20, dy: 0, sy: 1, alpha: 0 });
    expect(end.rot).toBeCloseTo(-Math.PI);
  });

  it("iguana: on its back, slid forward, twitching more slowly", () => {
    expect(pose("iguana", 0.075).sy).toBeCloseTo(0);
    const end = pose("iguana", 0.8);
    expect(end.sy).toBeCloseTo(-1);
    expect(end).toMatchObject({ dx: 30, rot: 0, alpha: 0 });
    expect(end.dy).toBeCloseTo(0);
    const twitches = (from: number, to: number) => {
      let n = 0;
      for (let t = from; t < to; t += 0.005) if (pose("iguana", t).frame !== pose("iguana", t + 0.005).frame) n++;
      return n;
    };
    expect(twitches(0, 0.2)).toBeGreaterThan(twitches(0.6, 0.8)); // slowing down
  });

  it("flamingo: spirals down onto the ground line", () => {
    const end = pose("flamingo", 1.1, 250);
    expect(end).toMatchObject({ dx: 40, dy: 250, alpha: 0 });
    expect(end.rot).toBeCloseTo(-3 * Math.PI);
    expect(pose("flamingo", 0.9, 250).alpha).toBeCloseTo(2 / 3);
  });

  it("bigfoot: staggers back, then lies flat about its feet", () => {
    expect(pose("bigfoot", 0.35)).toMatchObject({ dx: -14, px: 0.4, py: 1 });
    expect(pose("bigfoot", 0.8).rot).toBeCloseTo(-Math.PI / 2);
    const end = pose("bigfoot", 1.4);
    expect(end.rot).toBeCloseTo(-Math.PI / 2);
    expect(end).toMatchObject({ dx: -14, dy: 0, alpha: 0 });
  });

  it("clamps past the end", () => {
    for (const k of KINDS) expect(pose(k, 99)).toEqual(pose(k, DEATHS[k].duration));
  });
});
