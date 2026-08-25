import { describe, it, expect } from "vitest";
import {
  EXIT_REVEAL,
  FULL_REVEAL,
  REVEAL_BUDGET_MS,
  SETTLE_MS,
  timelineTotal,
} from "./revealSequence";

describe("the entry fits its budget", () => {
  it("stays under two seconds", () => {
    expect(timelineTotal(FULL_REVEAL)).toBeLessThan(REVEAL_BUDGET_MS);
  });

  it("reports a total that matches the last stage to finish", () => {
    const stages = [FULL_REVEAL.cardRise, FULL_REVEAL.flip, FULL_REVEAL.issueLine];
    const last = Math.max(...stages.map((s) => s.at + s.duration));
    expect(timelineTotal(FULL_REVEAL)).toBe(last);
  });
});

describe("the entry's stages are ordered", () => {
  it("finishes turning before the issue line starts", () => {
    const flipEnds = FULL_REVEAL.flip.at + FULL_REVEAL.flip.duration;
    expect(FULL_REVEAL.issueLine.at).toBeGreaterThanOrEqual(flipEnds);
  });

  it("rises before it finishes turning", () => {
    const flipEnds = FULL_REVEAL.flip.at + FULL_REVEAL.flip.duration;
    expect(FULL_REVEAL.cardRise.at).toBeLessThan(flipEnds);
  });

  it("starts every stage at or after zero and gives each a real duration", () => {
    for (const [stage, value] of Object.entries(FULL_REVEAL)) {
      expect(value.at, `${stage}.at`).toBeGreaterThanOrEqual(0);
      expect(value.duration, `${stage}.duration`).toBeGreaterThan(0);
    }
  });
});

describe("the exit reverses the entry", () => {
  it("reports a total that matches the last stage to finish", () => {
    const stages = [EXIT_REVEAL.flip, EXIT_REVEAL.sink];
    const last = Math.max(...stages.map((s) => s.at + s.duration));
    expect(timelineTotal(EXIT_REVEAL)).toBe(last);
  });

  it("finishes turning before it starts sinking", () => {
    // Not just for symmetry with the entry's own rise-before-flip ordering:
    // CardMinter relies on the turn finishing, as a live render, before it
    // nulls the state that starts the sink. See ExitTimeline's own comment.
    const flipEnds = EXIT_REVEAL.flip.at + EXIT_REVEAL.flip.duration;
    expect(EXIT_REVEAL.sink.at).toBeGreaterThanOrEqual(flipEnds);
  });

  it("starts every stage at or after zero and gives each a real duration", () => {
    for (const [stage, value] of Object.entries(EXIT_REVEAL)) {
      expect(value.at, `${stage}.at`).toBeGreaterThanOrEqual(0);
      expect(value.duration, `${stage}.duration`).toBeGreaterThan(0);
    }
  });

  it("finishes sooner than the entry, since leaving is quicker than arriving", () => {
    // The relationship is the design, not the exact numbers: this must not
    // silently invert if either timeline's durations change later.
    expect(timelineTotal(EXIT_REVEAL)).toBeLessThan(timelineTotal(FULL_REVEAL));
  });
});

describe("the settle before the reveal", () => {
  it("holds the finished set long enough to read, without being part of the reveal budget", () => {
    expect(SETTLE_MS).toBeGreaterThan(0);
    expect(SETTLE_MS).toBeLessThan(REVEAL_BUDGET_MS);
  });
});
