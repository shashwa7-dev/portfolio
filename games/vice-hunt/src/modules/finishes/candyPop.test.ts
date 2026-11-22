import { describe, expect, it } from "vitest";
import type { GameEvent } from "../../events";
import { resolveFinish } from "../index";
import { BURST, GENTLE_TIME, POP_AT, candyPop, puffCurve } from "./candyPop";
import { begin, runToEnd } from "./testkit";

const DT = 1 / 60;
const shouts = (out: GameEvent[]) => out.flatMap((e) => (e.type === "callout" ? [e.text] : []));
const candies = (s: { parts: { kind: string }[] }) => s.parts.filter((p) => p.kind === "candy").length;

describe("candy-pop", () => {
  it("gulps air in three puffs up to full", () => {
    expect(puffCurve(0)).toBe(0);
    expect(puffCurve(0.6)).toBeGreaterThan(0.2);
    expect(puffCurve(0.6)).toBeLessThan(0.4);
    expect(puffCurve(2)).toBeCloseTo(1, 2);
    for (let t = 0; t < 3; t += 0.01) expect(puffCurve(t)).toBeLessThanOrEqual(1.04);
  });

  it("swells and floats up, candies squeezing out, then POPs into a hundred candies", () => {
    const { s } = begin(candyPop, "gator");
    const out: GameEvent[] = [];
    let squeezed = 0;
    let t = 0;
    while (t < POP_AT - 0.05) {
      candyPop.step(s, DT, out);
      t += DT;
      if (t > 0.8) expect(s.lift).toBeLessThan(0);
      squeezed = Math.max(squeezed, candies(s));
    }
    expect(squeezed).toBeGreaterThan(0);
    expect(shouts(out)).not.toContain("POP!");
    const before = candies(s);
    for (let i = 0; i < 6; i++) candyPop.step(s, DT, out);
    expect(shouts(out)).toEqual(["POP!"]);
    expect(s.popped).toBe(true);
    expect(candies(s) - before).toBeGreaterThanOrEqual(BURST - 10); // the odd squeezed one may have dropped off
    expect(BURST).toBe(100);
  });

  it("is done once the burst has rained down and gone", () => {
    const { s } = begin(candyPop, "gator");
    runToEnd(candyPop, s, DT, 20);
    expect(candyPop.done(s)).toBe(true);
    expect(s.parts).toHaveLength(0);
  });

  it("the gentle version swells a little and fades, a few candies, no POP", () => {
    const { s } = begin(candyPop, "gator");
    const gentle = resolveFinish("candy-pop", true);
    expect(gentle).not.toBe(candyPop);
    const out: GameEvent[] = [];
    let most = 0;
    let t = 0;
    while (!gentle.done(s) && t < 10) {
      gentle.step(s, DT, out);
      t += DT;
      most = Math.max(most, s.parts.length);
    }
    expect(shouts(out)).not.toContain("POP!");
    expect(most).toBeLessThanOrEqual(6);
    expect(s.alpha).toBe(0);
    expect(t).toBeGreaterThanOrEqual(GENTLE_TIME);
  });
});
