import { describe, it, expect } from "vitest";
import {
  FULL_REVEAL,
  REVEAL_BUDGET_MS,
  SETTLE_MS,
  SHORT_REVEAL,
  timelineTotal,
  type RevealTimeline,
} from "./revealSequence";

const TIMELINES: [string, RevealTimeline][] = [
  ["full", FULL_REVEAL],
  ["short", SHORT_REVEAL],
];

describe("the reveal fits its budget", () => {
  it.each(TIMELINES)("%s stays under two seconds", (_name, timeline) => {
    expect(timelineTotal(timeline)).toBeLessThan(REVEAL_BUDGET_MS);
  });

  it("reports a total that matches the last stage to finish", () => {
    for (const [name, timeline] of TIMELINES) {
      const stages = [timeline.cardRise, timeline.print, timeline.issueLine];
      const last = Math.max(...stages.map((s) => s.at + s.duration));
      expect(timelineTotal(timeline), name).toBe(last);
    }
  });
});

describe("the stages are ordered", () => {
  it.each(TIMELINES)("%s prints before the issue line starts", (_name, timeline) => {
    const printEnds = timeline.print.at + timeline.print.duration;
    expect(timeline.issueLine.at).toBeGreaterThanOrEqual(printEnds);
  });

  it("rises before it finishes printing, on the full timeline", () => {
    const printEnds = FULL_REVEAL.print.at + FULL_REVEAL.print.duration;
    expect(FULL_REVEAL.cardRise.at).toBeLessThan(printEnds);
  });

  it("starts every stage at or after zero and gives each a real duration", () => {
    for (const [name, timeline] of TIMELINES) {
      for (const [stage, value] of Object.entries(timeline)) {
        const s = value as { at: number; duration: number };
        expect(s.at, `${name}.${stage}.at`).toBeGreaterThanOrEqual(0);
        expect(s.duration, `${name}.${stage}.duration`).toBeGreaterThan(0);
      }
    }
  });
});

describe("the short timeline is the cheap one", () => {
  it("declares a card rise that does not meaningfully play", () => {
    // Not zero: both timelines declare every stage so they share one shape
    // and the consumer never branches on it, and "every stage has a real
    // duration" stays an invariant without an exception carved into it.
    // What matters here is that the stage is imperceptible, not what exact
    // sentinel expresses that, so this asserts the property rather than
    // the constant.
    expect(SHORT_REVEAL.cardRise.duration).toBeLessThan(0.01);
    expect(SHORT_REVEAL.cardRise.duration).toBeGreaterThan(0);
  });

  it("skips straight to print: nothing is scheduled before it", () => {
    expect(SHORT_REVEAL.print.at).toBe(0);
  });

  it("finishes sooner than the full sequence", () => {
    expect(timelineTotal(SHORT_REVEAL)).toBeLessThan(timelineTotal(FULL_REVEAL));
  });
});

describe("the settle before the reveal", () => {
  it("holds the finished set long enough to read, without being part of the reveal budget", () => {
    expect(SETTLE_MS).toBeGreaterThan(0);
    expect(SETTLE_MS).toBeLessThan(REVEAL_BUDGET_MS);
  });
});
