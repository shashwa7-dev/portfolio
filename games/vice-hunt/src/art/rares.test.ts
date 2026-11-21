import { describe, expect, it } from "vitest";
import { EXTRA, RARE_FRAMES, type ExtraId } from "./rares";
import { SPRITES } from "./sprites";
import { KINDS } from "../creatures";

const EXTRA_IDS: readonly ExtraId[] = [
  "cowGarland",
  "sharkRocket",
  "ufoEmpty",
  "alienChute",
  "tigerFace",
  "tigerPaw",
  "pile",
  "fish",
];

const FRAME_COUNTS = { cow: 2, tiger: 2, shark: 2, merman: 2, ufo: 2 } as const;

// A complete SVG document: one root <svg> with explicit width, height and
// viewBox on the root tag, closed at the very end.
function expectSvgDocument(svg: string): void {
  expect(svg.startsWith("<svg ")).toBe(true);
  expect(svg.trimEnd().endsWith("</svg>")).toBe(true);
  const root = svg.slice(0, svg.indexOf(">") + 1);
  expect(root).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(root).toMatch(/ width="\d+(\.\d+)?"/);
  expect(root).toMatch(/ height="\d+(\.\d+)?"/);
  expect(root).toMatch(/ viewBox="-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+"/);
  // Classes and CSS have no meaning in a canvas image: none left behind.
  expect(svg).not.toContain("class=");
  expect(svg).not.toContain("<!--");
}

describe("rare creature art", () => {
  it("has the agreed frame count for each rare", () => {
    for (const [kind, n] of Object.entries(FRAME_COUNTS)) {
      expect(RARE_FRAMES[kind as keyof typeof FRAME_COUNTS]).toHaveLength(n);
    }
  });

  it("makes every frame a complete SVG document", () => {
    for (const frames of Object.values(RARE_FRAMES)) frames.forEach(expectSvgDocument);
  });

  it("has every extra, each a complete SVG document", () => {
    for (const id of EXTRA_IDS) expectSvgDocument(EXTRA[id]);
    expect(Object.keys(EXTRA).sort()).toEqual([...EXTRA_IDS].sort());
  });

  it("bakes the poses: the two frames of each rare differ", () => {
    for (const [a, b] of Object.values(RARE_FRAMES)) expect(a).not.toBe(b);
  });

  it("gives the special states their changes", () => {
    expect(EXTRA.ufoEmpty).not.toContain("#8ee06a"); // no green pilot in the dome
    expect(RARE_FRAMES.ufo[0]).toContain("#8ee06a");
    expect(EXTRA.cowGarland).toContain("#f7a01c"); // marigolds on
    expect(RARE_FRAMES.cow[0]).not.toContain("#f7a01c");
    expect(EXTRA.fish).toContain("#f49ea3");
  });

  it("feeds the sprite table for every kind", () => {
    for (const k of KINDS) expect(SPRITES[k].length).toBeGreaterThanOrEqual(2);
    for (const k of Object.keys(RARE_FRAMES) as (keyof typeof RARE_FRAMES)[]) {
      expect(SPRITES[k]).toBe(RARE_FRAMES[k]);
    }
  });
});
