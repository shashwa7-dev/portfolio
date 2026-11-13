import { describe, expect, it } from "vitest";
import { lightInCard } from "./light";

describe("light from the viewport's top-left corner", () => {
  it("points up and to the left from a card on the right of the screen", () => {
    const l = lightInCard({ x: 1200, y: 400 }, 0);
    expect(l.x).toBeLessThan(0);
    expect(l.y).toBeLessThan(0);
    expect(Math.hypot(l.x, l.y)).toBeCloseTo(1, 6);
    expect(Math.abs(l.x)).toBeGreaterThan(Math.abs(l.y));
  });

  it("turns with the card: a card swung a quarter turn sees the light rotated back", () => {
    const upright = lightInCard({ x: 600, y: 600 }, 0);
    const turned = lightInCard({ x: 600, y: 600 }, Math.PI / 2);
    // Card turned 90 degrees clockwise: in its own frame the light has turned 90 degrees anticlockwise.
    expect(turned.x).toBeCloseTo(upright.y, 6);
    expect(turned.y).toBeCloseTo(-upright.x, 6);
  });

  it("still has a direction when the card sits on the light itself", () => {
    const l = lightInCard({ x: 0, y: 0 }, 0);
    expect(Number.isFinite(l.x) && Number.isFinite(l.y)).toBe(true);
    expect(Math.hypot(l.x, l.y)).toBeCloseTo(1, 6);
  });
});
