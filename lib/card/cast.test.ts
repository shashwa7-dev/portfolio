import { describe, it, expect } from "vitest";
import { mulberry32 } from "./seed";
import { castFrom, castForVisitor } from "./cast";

describe("castFrom", () => {
  it("replays exactly from the same seed", () => {
    expect(castFrom(mulberry32(42))).toEqual(castFrom(mulberry32(42)));
  });

  it("produces pinned golden value", () => {
    // This value is frozen because the order of the picks is part of the card's
    // permanent identity. If this test fails, the fix is almost always to revert
    // the change to cast.ts, not to update the expected object. Adding a new
    // trait means appending the pick at the END of castFrom, never inserting it
    // among the existing ones.
    expect(castFrom(mulberry32(2026))).toEqual({
      hair: "long",
      glasses: "none",
      headwear: "none",
      brow: "arched",
      mouth: "smile",
      shade: 0.38310598609969015,
    });
  });

  it("keeps shade inside 0 to 1", () => {
    for (let i = 0; i < 2000; i++) {
      const c = castFrom(mulberry32(i));
      expect(c.shade).toBeGreaterThanOrEqual(0);
      expect(c.shade).toBeLessThanOrEqual(1);
    }
  });

  it("reaches every hair style within 5000 seeds", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 5000; i++) seen.add(castFrom(mulberry32(i)).hair);
    expect(seen.size).toBe(6);
  });

  it("leaves most faces without headwear", () => {
    let bare = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) if (castFrom(mulberry32(i)).headwear === "none") bare++;
    expect(bare / N).toBeGreaterThan(0.5);
  });
});

describe("castForVisitor", () => {
  it("is stable for the same id", () => {
    expect(castForVisitor("abc")).toEqual(castForVisitor("abc"));
  });

  it("does not change when a different salt would", () => {
    // The face must come off the 'face' stream only, so two ids that happen
    // to share an issue still differ in the face.
    expect(castForVisitor("abc")).not.toEqual(castForVisitor("abd"));
  });
});
