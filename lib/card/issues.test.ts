import { describe, it, expect } from "vitest";
import { ISSUES, issueFrom, type IssueKey } from "./issues";

describe("ISSUES", () => {
  it("shares sum to 100", () => {
    const total = Object.values(ISSUES).reduce((n, i) => n + i.share, 0);
    expect(total).toBeCloseTo(100, 6);
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

  it("has no em-dash in any display name", () => {
    for (const issue of Object.values(ISSUES)) {
      expect(issue.name).not.toContain("—");
    }
  });
});

describe("issueFrom", () => {
  it("is stable for the same id", () => {
    expect(issueFrom("abc-123")).toBe(issueFrom("abc-123"));
  });

  it("lands within a point of the declared shares over 100k ids", () => {
    const counts: Record<string, number> = {
      definitive: 0, commemorative: 0, firstDay: 0, misprint: 0, inverted: 0,
    };
    const N = 100_000;
    for (let i = 0; i < N; i++) counts[issueFrom(`visitor-${i}`)]++;

    expect((counts.definitive / N) * 100).toBeGreaterThan(59);
    expect((counts.definitive / N) * 100).toBeLessThan(61);
    expect((counts.commemorative / N) * 100).toBeGreaterThan(26);
    expect((counts.commemorative / N) * 100).toBeLessThan(28);
    expect((counts.firstDay / N) * 100).toBeGreaterThan(11);
    expect((counts.firstDay / N) * 100).toBeLessThan(13);
    // 1% of 100k is 1000, 0.1% is 100. Wide bands: this is checking the
    // bands are wired to the right issues, not that the PRNG is perfect.
    expect(counts.misprint).toBeGreaterThan(700);
    expect(counts.misprint).toBeLessThan(1300);
    expect(counts.inverted).toBeGreaterThan(50);
    expect(counts.inverted).toBeLessThan(170);
  });

  it("can actually reach the rarest issue", () => {
    const seen = new Set<IssueKey>();
    for (let i = 0; i < 100_000; i++) seen.add(issueFrom(`v${i}`));
    expect(seen.size).toBe(5);
  });
});
