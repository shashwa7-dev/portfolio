import { describe, it, expect } from "vitest";
import { ISSUES } from "./issues";
import { DICE_BANDS } from "./dice";
import type { IssueKey } from "./types";

const KEYS: IssueKey[] = ["definitive", "commemorative", "firstDay", "misprint", "inverted"];

describe("ISSUES", () => {
  it("chances sum to 100", () => {
    const total = Object.values(ISSUES).reduce((n, i) => n + i.chance, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it("takes chance, label and range from the dice bands, not its own copy", () => {
    /* The point of this test is that there is exactly one place a rarity
       number can be wrong. If someone hand-edits a percentage into
       issues.ts, this fails. */
    for (const key of KEYS) {
      const band = DICE_BANDS.find((b) => b.key === key)!;
      expect(ISSUES[key].chance, key).toBe(band.chance);
      expect(ISSUES[key].label, key).toBe(band.label);
      expect(ISSUES[key].range, key).toEqual([band.min, band.max]);
    }
  });

  it("no longer carries a share of cards, which stopped being true when rolls became unlimited", () => {
    for (const issue of Object.values(ISSUES)) {
      expect(issue).not.toHaveProperty("share");
    }
  });

  it("gives every issue but Definitive a five stop gradient", () => {
    expect(ISSUES.definitive.sticker).toBeNull();
    for (const key of ["commemorative", "firstDay", "misprint", "inverted"] as IssueKey[]) {
      expect(ISSUES[key].sticker).toHaveLength(5);
    }
  });

  it("inverts only the rarest issue", () => {
    const inverting = Object.values(ISSUES).filter((i) => i.inverted).map((i) => i.key);
    expect(inverting).toEqual(["inverted"]);
  });

  it("has no em-dash in any display name or label", () => {
    for (const issue of Object.values(ISSUES)) {
      expect(issue.name).not.toContain("—");
      expect(issue.label).not.toContain("—");
    }
  });

  it("orders the ranges so a higher total is never a commoner issue", () => {
    const byMin = [...Object.values(ISSUES)].sort((a, b) => a.range[0] - b.range[0]);
    for (let i = 1; i < byMin.length; i++) {
      expect(byMin[i].chance).toBeLessThan(byMin[i - 1].chance);
    }
  });
});
