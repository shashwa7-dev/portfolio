import { describe, expect, it } from "vitest";
import { OSTRICH_EXTRA, OSTRICH_FRAMES, type OstrichPart } from "./ostrich";
import { SPRITES } from "./sprites";
import { expectSvgDocument } from "./svgTestkit";

const PARTS: readonly OstrichPart[] = ["ostLegF", "ostLegN", "ostTail", "ostBody", "ostBare", "ostWing", "ostNeck", "ostCollar", "ostNeckShock"];

describe("roller ostrich art", () => {
  it("has two frames and every part, each a complete SVG document in the 130 x 180 box", () => {
    expect(OSTRICH_FRAMES).toHaveLength(2);
    expect(OSTRICH_FRAMES[0]).not.toBe(OSTRICH_FRAMES[1]);
    expect(Object.keys(OSTRICH_EXTRA).sort()).toEqual([...PARTS].sort());
    for (const svg of [...OSTRICH_FRAMES, ...PARTS.map((p) => OSTRICH_EXTRA[p])]) {
      expectSvgDocument(svg);
      expect(svg).toContain('viewBox="0 0 130 180"');
    }
  });

  it("wears look B, Sunset Leopard", () => {
    expect(OSTRICH_EXTRA.ostBody).toContain("#ff8a1f"); // orange into pink
    expect(OSTRICH_EXTRA.ostBody).toContain("#ff3d8b");
    expect(OSTRICH_EXTRA.ostBody).toContain("#b05cff"); // purple rosettes
    expect(OSTRICH_EXTRA.ostTail).toContain("#1fe0c4");
    expect(OSTRICH_EXTRA.ostLegN).toContain("#9b5cff"); // purple skates
    expect(OSTRICH_EXTRA.ostBare).not.toContain("#b05cff");
  });

  it("feeds the sprite table", () => {
    expect(SPRITES.ostrich).toBe(OSTRICH_FRAMES);
  });
});
