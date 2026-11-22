import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng";
import { CANDY_COLORS, randomCandy } from "./candy";

describe("candy", () => {
  it("rolls one of five shapes in the palette's colours", () => {
    const rng = mulberry32(3);
    const shapes = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const c = randomCandy(rng);
      shapes.add(c.shape);
      expect(CANDY_COLORS).toContain(c.color);
      expect(CANDY_COLORS).toContain(c.color2);
    }
    expect([...shapes].sort()).toEqual([0, 1, 2, 3, 4]);
  });
});
