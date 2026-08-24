import { describe, it, expect } from "vitest";
import {
  FULL_REVEAL,
  REVEAL_BUDGET_MS,
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
      const stages = [
        timeline.backdropIn,
        timeline.cardForward,
        timeline.print,
        timeline.issueStamp,
        timeline.backdropOut,
      ];
      const last = Math.max(...stages.map((s) => s.at + s.duration));
      expect(timelineTotal(timeline), name).toBe(last);
    }
  });
});

describe("the stages are ordered", () => {
  it.each(TIMELINES)("%s prints before it stamps the issue", (_name, timeline) => {
    const printEnds = timeline.print.at + timeline.print.duration;
    expect(timeline.issueStamp.at).toBeGreaterThanOrEqual(printEnds);
  });

  it("brings the card forward before it finishes printing, so the two overlap", () => {
    const printEnds = FULL_REVEAL.print.at + FULL_REVEAL.print.duration;
    expect(FULL_REVEAL.cardForward.at).toBeLessThan(printEnds);
  });

  it("releases the backdrop only after the issue has landed", () => {
    const stampEnds = FULL_REVEAL.issueStamp.at + FULL_REVEAL.issueStamp.duration;
    expect(FULL_REVEAL.backdropOut.at).toBeGreaterThanOrEqual(stampEnds);
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
  it("declares a backdrop that does not meaningfully play", () => {
    // Not zero: both timelines declare every stage so they share one shape
    // and the consumer never branches on it, and "every stage has a real
    // duration" stays an invariant without an exception carved into it.
    // What matters here is that the stage is imperceptible, not what exact
    // sentinel expresses that, so this asserts the property rather than
    // the constant.
    expect(SHORT_REVEAL.backdropIn.duration).toBeLessThan(0.01);
    expect(SHORT_REVEAL.backdropIn.duration).toBeGreaterThan(0);
    expect(SHORT_REVEAL.backdropOut.duration).toBeLessThan(0.01);
    expect(SHORT_REVEAL.backdropOut.duration).toBeGreaterThan(0);
  });

  it("finishes sooner than the full sequence", () => {
    expect(timelineTotal(SHORT_REVEAL)).toBeLessThan(timelineTotal(FULL_REVEAL));
  });
});
