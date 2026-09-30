import { describe, it, expect } from "vitest";
import { marginNotes } from "./marginNotes";

describe("marginNotes", () => {
  it("has at most three notes", () => {
    expect(Object.keys(marginNotes).length).toBeLessThanOrEqual(3);
  });
  it("keys notes by the row they annotate", () => {
    expect(Object.keys(marginNotes).sort()).toEqual(["dehidden", "mehfil", "shopos"]);
  });
  it("keeps notes short, gently rotated and free of em-dashes", () => {
    for (const n of Object.values(marginNotes)) {
      expect(n.text.length).toBeLessThanOrEqual(32);
      expect(Math.abs(n.rotate)).toBeLessThanOrEqual(4);
      expect(n.text).not.toContain("—");
    }
  });
});
