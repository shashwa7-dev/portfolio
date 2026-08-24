import { describe, it, expect } from "vitest";
import {
  DICE_BANDS,
  MAX_TOTAL,
  MIN_TOTAL,
  isPerfect,
  issueFromTotal,
  pipTotal,
  rollPair,
} from "./dice";
import { mulberry32 } from "./seed";
import type { Die, IssueKey, RollSet } from "./types";

/**
 * Every one of the 6^6 = 46,656 possible sets, as pip totals.
 *
 * Six explicit loops rather than a recursive product: this is the assertion
 * the published odds rest on, and it should be obvious by reading that it
 * enumerates exactly six dice of six faces and nothing else.
 */
function everyTotal(): number[] {
  const totals: number[] = [];
  for (let a = 1; a <= 6; a++)
    for (let b = 1; b <= 6; b++)
      for (let c = 1; c <= 6; c++)
        for (let d = 1; d <= 6; d++)
          for (let e = 1; e <= 6; e++)
            for (let f = 1; f <= 6; f++) totals.push(a + b + c + d + e + f);
  return totals;
}

const ALL = 46_656;

const set = (a: Die, b: Die, c: Die, d: Die, e: Die, f: Die): RollSet =>
  [
    [a, b],
    [c, d],
    [e, f],
  ] as const;

describe("DICE_BANDS", () => {
  it("tiles 6 to 36 with no gap and no overlap", () => {
    for (let total = MIN_TOTAL; total <= MAX_TOTAL; total++) {
      const hits = DICE_BANDS.filter((b) => total >= b.min && total <= b.max);
      expect(hits, `total ${total}`).toHaveLength(1);
    }
  });

  it("covers every issue exactly once", () => {
    const keys = DICE_BANDS.map((b) => b.key).sort();
    expect(keys).toEqual(
      ["commemorative", "definitive", "firstDay", "inverted", "misprint"].sort()
    );
  });

  it("declares chances that sum to 100", () => {
    const total = DICE_BANDS.reduce((n, b) => n + b.chance, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it("has no em-dash in any label", () => {
    for (const band of DICE_BANDS) expect(band.label).not.toContain("—");
  });
});

describe("the published odds are true", () => {
  /* The load-bearing test of this whole feature. Every possible outcome is
     enumerated and counted, so the page and the card cannot advertise a
     number the dice do not actually produce. If this fails, the copy is
     lying, not the test. */
  it("matches every band's declared chance against all 46,656 outcomes", () => {
    const totals = everyTotal();
    expect(totals).toHaveLength(ALL);

    const counts: Record<string, number> = {};
    for (const t of totals) {
      const key = issueFromTotal(t);
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const expected: Record<IssueKey, number> = {
      inverted: 28,
      misprint: 890,
      firstDay: 5830,
      commemorative: 14414,
      definitive: 25494,
    };

    for (const band of DICE_BANDS) {
      expect(counts[band.key], band.key).toBe(expected[band.key]);
      expect((counts[band.key] / ALL) * 100, band.key).toBeCloseTo(band.chance, 5);
    }

    const summed = Object.values(expected).reduce((n, c) => n + c, 0);
    expect(summed).toBe(ALL);
  });

  it("rounds each label to the chance it claims", () => {
    for (const band of DICE_BANDS) {
      const claimed = parseFloat(band.label);
      // Two significant figures below 1, one decimal place above it: the
      // labels are display values, so this checks they round from the
      // real number rather than being typed independently of it.
      const tolerance = band.chance < 1 ? 0.005 : 0.05;
      expect(Math.abs(claimed - band.chance), band.key).toBeLessThan(tolerance);
    }
  });
});

describe("issueFromTotal", () => {
  it("puts each boundary on the right side", () => {
    const cases: [number, IssueKey][] = [
      [6, "definitive"],
      [21, "definitive"],
      [22, "commemorative"],
      [25, "commemorative"],
      [26, "firstDay"],
      [29, "firstDay"],
      [30, "misprint"],
      [33, "misprint"],
      [34, "inverted"],
      [36, "inverted"],
    ];
    for (const [total, key] of cases) expect(issueFromTotal(total), `total ${total}`).toBe(key);
  });

  it("clamps rather than throwing on a total no set can produce", () => {
    expect(issueFromTotal(0)).toBe("definitive");
    expect(issueFromTotal(99)).toBe("inverted");
  });
});

describe("pipTotal", () => {
  it("adds all six dice", () => {
    expect(pipTotal(set(1, 1, 1, 1, 1, 1))).toBe(6);
    expect(pipTotal(set(6, 6, 6, 6, 6, 6))).toBe(36);
    expect(pipTotal(set(3, 4, 5, 2, 6, 1))).toBe(21);
  });
});

describe("isPerfect", () => {
  it("is true only for six sixes", () => {
    expect(isPerfect(set(6, 6, 6, 6, 6, 6))).toBe(true);
    expect(isPerfect(set(6, 6, 6, 6, 6, 5))).toBe(false);
    expect(isPerfect(set(5, 6, 6, 6, 6, 6))).toBe(false);
  });

  it("is false for a 35, which is the nearest miss", () => {
    const nearMiss = set(6, 6, 6, 6, 6, 5);
    expect(pipTotal(nearMiss)).toBe(35);
    expect(issueFromTotal(pipTotal(nearMiss))).toBe("inverted");
    expect(isPerfect(nearMiss)).toBe(false);
  });
});

describe("rollPair", () => {
  it("only ever returns faces 1 through 6", () => {
    const R = mulberry32(12345);
    for (let i = 0; i < 5_000; i++) {
      const [a, b] = rollPair(R);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(6);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(6);
      expect(Number.isInteger(a)).toBe(true);
      expect(Number.isInteger(b)).toBe(true);
    }
  });

  it("reaches every face", () => {
    const R = mulberry32(999);
    const seen = new Set<number>();
    for (let i = 0; i < 5_000; i++) rollPair(R).forEach((d) => seen.add(d));
    expect(seen.size).toBe(6);
  });

  it("replays exactly for the same injected Rand, which is what makes it testable", () => {
    expect(rollPair(mulberry32(7))).toEqual(rollPair(mulberry32(7)));
  });

  it("does not return the same pair forever", () => {
    const R = mulberry32(42);
    const pairs = new Set<string>();
    for (let i = 0; i < 200; i++) pairs.add(rollPair(R).join(","));
    expect(pairs.size).toBeGreaterThan(10);
  });
});
