import { describe, expect, it } from "vitest";
import { CARD_W, HANG_CLEARANCE, HANG_EDGE, layout } from "./layout";

const MEASURE = 760;

describe("desktop card placement", () => {
  it("keeps the card clear of the hero column at every desktop width", () => {
    for (let width = 1280; width <= 2560; width += 16) {
      const { scale, anchorX } = layout("hang", width, MEASURE);
      const cardLeft = (anchorX - CARD_W / 2) * scale;
      const cardRight = (anchorX + CARD_W / 2) * scale;
      const heroRight = (width + MEASURE) / 2;
      expect(cardLeft - heroRight, `width ${width}`).toBeGreaterThanOrEqual(HANG_CLEARANCE - 0.5);
      expect(width - cardRight, `width ${width}`).toBeCloseTo(HANG_EDGE, 3);
    }
  });
});
