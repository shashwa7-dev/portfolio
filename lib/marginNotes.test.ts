import { describe, it, expect } from "vitest";
import { marginNotes } from "./marginNotes";

describe("marginNotes", () => {
  it("has at most four notes", () => {
    expect(Object.keys(marginNotes).length).toBeLessThanOrEqual(4);
  });
  it("keys notes by the row they annotate", () => {
    expect(Object.keys(marginNotes).sort()).toEqual(["dehidden", "kiryoku", "mehfil", "shopos"]);
  });
  it("keeps notes short, gently rotated and free of em-dashes", () => {
    for (const n of Object.values(marginNotes)) {
      expect(n.text.length).toBeLessThanOrEqual(32);
      expect(Math.abs(n.rotate)).toBeLessThanOrEqual(4);
      expect(n.text).not.toContain("—");
    }
  });
  it("gives each project its own voice", () => {
    expect(marginNotes.mehfil.text).toBe("Carvaan, but in your browser");
    expect(marginNotes.kiryoku.text).toBe("a tiny proxy that says no");
  });
});
