import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { TILT_CLASSES, TILT_CARD_CLASSES, TINT_CLASSES, tilt, tiltMd, tint } from "./candy";

describe("tilt", () => {
  it("cycles the seven slots that stay within 2 degrees", () => {
    expect(TILT_CLASSES).toEqual([
      "tilt-a", "tilt-b", "tilt-c", "tilt-d", "tilt-e", "tilt-f", "tilt-g",
    ]);
    expect(TILT_CLASSES).not.toContain("tilt-h");
    expect(TILT_CLASSES).not.toContain("tilt-i");
  });
  it("is deterministic and wraps", () => {
    expect(tilt(0)).toBe("tilt-a");
    expect(tilt(6)).toBe("tilt-g");
    expect(tilt(7)).toBe("tilt-a");
    expect(tilt(-1)).toBe("tilt-b");
    expect(tilt(3)).toBe(tilt(3));
  });
});

describe("tiltMd", () => {
  it("only ever picks the two sub-degree card slots", () => {
    expect(TILT_CARD_CLASSES).toEqual(["tilt-md-f", "tilt-md-g"]);
    for (let i = 0; i < 20; i++) {
      expect(TILT_CARD_CLASSES).toContain(tiltMd(i));
    }
  });
  it("alternates neighbours", () => {
    expect(tiltMd(0)).toBe("tilt-md-f");
    expect(tiltMd(1)).toBe("tilt-md-g");
    expect(tiltMd(2)).toBe("tilt-md-f");
  });
});

describe("tint", () => {
  it("cycles the five candy tints as full class strings", () => {
    expect(TINT_CLASSES).toEqual([
      "candy:bg-candy-pink",
      "candy:bg-candy-mint",
      "candy:bg-candy-butter",
      "candy:bg-candy-sky",
      "candy:bg-candy-lavender",
    ]);
    expect(tint(0)).toBe("candy:bg-candy-pink");
    expect(tint(5)).toBe("candy:bg-candy-pink");
    expect(tint(7)).toBe("candy:bg-candy-butter");
  });
});

describe("tilt classes against globals.css", () => {
  it("keeps every tilt class within the caps this module promises", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    const degreesByName = new Map<string, number>();
    const re = /\.(tilt-(?:md-)?[a-i])\s*\{\s*transform:\s*rotate\((-?[\d.]+)deg\)/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(css)) !== null) {
      degreesByName.set(match[1], Number(match[2]));
    }

    for (const name of TILT_CLASSES) {
      expect(degreesByName.has(name)).toBe(true);
      expect(Math.abs(degreesByName.get(name)!)).toBeLessThanOrEqual(2);
    }

    for (const name of TILT_CARD_CLASSES) {
      expect(degreesByName.has(name)).toBe(true);
      expect(Math.abs(degreesByName.get(name)!)).toBeLessThan(1);
    }
  });
});
