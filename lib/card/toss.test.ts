import { describe, it, expect } from "vitest";
import { ARCS, tossKeyframes, type Arc } from "./toss";

/** Pulls the y component out of a `translate(Xpx, Ypx)` transform string. */
function translateY(transform: unknown): number {
  const match = String(transform).match(/translate\([^,]+,\s*(-?[\d.]+)px\)/);
  if (!match) throw new Error(`no translate() in "${transform}"`);
  return parseFloat(match[1]);
}

/** Pulls the degrees out of a `rotate(Ndeg)` transform string. */
function rotateDeg(transform: unknown): number {
  const match = String(transform).match(/rotate\((-?[\d.]+)deg\)/);
  if (!match) throw new Error(`no rotate() in "${transform}"`);
  return parseFloat(match[1]);
}

const arc: Arc = { outX: 24, upY: -150, spin: 540 };

describe("tossKeyframes", () => {
  it("has three keyframes at offsets 0, 0.5 and 1", () => {
    const frames = tossKeyframes(arc);
    expect(frames.map((f) => f.offset)).toEqual([0, 0.5, 1]);
  });

  it("starts and ends docked, translate y of 0", () => {
    const [first, , last] = tossKeyframes(arc);
    expect(translateY(first.transform)).toBe(0);
    expect(translateY(last.transform)).toBe(0);
  });

  it("peaks above the dock, at the arc's own upY", () => {
    const [, apex] = tossKeyframes(arc);
    const y = translateY(apex.transform);
    expect(y).toBeLessThan(0);
    expect(y).toBe(arc.upY);
  });

  it("lands on the arc's full spin", () => {
    const [, , last] = tossKeyframes(arc);
    expect(rotateDeg(last.transform)).toBe(arc.spin);
  });

  it("gives the rise and the fall different per-keyframe easings", () => {
    // The rise (offset 0 -> 0.5) and the fall (offset 0.5 -> 1) are driven
    // by the easing declared on the keyframe that STARTS each segment, so
    // that's offset 0 for the rise and offset 0.5 for the fall. A version
    // that only checked "some easing exists" would still pass a broken
    // single-curve build; this checks the two are actually different.
    const [rise, fall] = tossKeyframes(arc);
    expect(rise.easing).toBeTruthy();
    expect(fall.easing).toBeTruthy();
    expect(rise.easing).not.toBe(fall.easing);
  });
});

describe("ARCS", () => {
  it("holds exactly two arcs", () => {
    expect(ARCS).toHaveLength(2);
  });

  it("gives the two dice different apex heights", () => {
    const [a, b] = ARCS;
    expect(a.upY).not.toBe(b.upY);
  });

  it("spins the two dice in opposite directions", () => {
    const [a, b] = ARCS;
    expect(Math.sign(a.spin)).not.toBe(Math.sign(b.spin));
  });
});
