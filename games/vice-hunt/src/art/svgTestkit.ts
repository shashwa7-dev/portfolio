import { expect } from "vitest";

// A complete SVG document: one root <svg> with explicit width, height and
// viewBox on the root tag, closed at the very end.
export function expectSvgDocument(svg: string): void {
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

