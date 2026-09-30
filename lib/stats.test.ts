import { describe, it, expect } from "vitest";
import { stats, tickerStats } from "./stats";

describe("tickerStats", () => {
  it("lists the five highlights in ticker order", () => {
    expect(tickerStats.map((s) => s.n)).toEqual(["1M+", "12+", "30+", "10K+", "5+ yrs"]);
  });
  it("gives every item a caption and no em-dashes", () => {
    for (const s of tickerStats) {
      expect(s.c.length).toBeGreaterThan(0);
      expect(`${s.c} ${s.context ?? ""}`).not.toContain("—");
    }
  });
  it("keeps the OG card's first three stats stable", () => {
    expect(stats.slice(0, 3).map((s) => s.n)).toEqual(["1M+", "12+", "30+"]);
  });
  it("describes the years as building web apps", () => {
    expect(stats.find((s) => s.n === "5+ yrs")?.c).toBe("building web apps");
  });
});
