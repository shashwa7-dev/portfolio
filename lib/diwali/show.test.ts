import { describe, it, expect } from "vitest";
import {
  INITIAL, reduce, shouldPlayVideo, isOverlayOpen, videoReachedEnd, chakriBox,
  flyerTransform, toFlyerBox,
  type Phase, type ShowState, type ShowEvent,
} from "./show";
import { LADDOO_FRONT_INDEX, LADDOO_SPOTS } from "./laddoos";

const at = (phase: Phase, picked: number | null = null): ShowState => ({ phase, picked });

describe("reduce", () => {
  it("walks the happy path", () => {
    const events: ShowEvent[] = [
      { type: "LIGHT" }, { type: "FUSE_BURNT" }, { type: "CENTRE_HOLD_DONE" },
      { type: "VIDEO_ENDED" }, { type: "OPEN_PLATE" }, { type: "PICK", index: 3 },
      { type: "PICK_DONE" }, { type: "RETURNED" },
    ];
    const seen: ShowState[] = [];
    let s = INITIAL;
    for (const e of events) { s = reduce(s, e); seen.push(s); }
    expect(seen.map((x) => x.phase)).toEqual([
      "lit", "centre", "corner", "finale", "plate", "picked", "returning", "idle",
    ]);
    expect(seen[5].picked).toBe(3);
    expect(seen[7].picked).toBeNull();
  });
  it("ignores a second LIGHT", () => {
    const lit = at("lit");
    const centre = at("centre");
    expect(reduce(lit, { type: "LIGHT" })).toBe(lit);
    expect(reduce(centre, { type: "LIGHT" })).toBe(centre);
  });
  it("Skip and Esc go to the finale from centre and corner", () => {
    for (const p of ["centre", "corner"] as const) {
      expect(reduce(at(p), { type: "SKIP" }).phase).toBe("finale");
      expect(reduce(at(p), { type: "ESCAPE" }).phase).toBe("finale");
    }
  });
  it("Esc in the finale opens the plate; clicks elsewhere cannot leave", () => {
    const finale = at("finale");
    expect(reduce(finale, { type: "ESCAPE" }).phase).toBe("plate");
    expect(reduce(finale, { type: "RETURNED" })).toBe(finale);
    expect(reduce(finale, { type: "PICK", index: 0 })).toBe(finale);
  });
  it("ABORT returns to idle from any phase past idle", () => {
    const phases: Phase[] = ["lit", "centre", "corner", "finale", "plate", "picked", "returning"];
    for (const p of phases) expect(reduce(at(p, 4), { type: "ABORT" })).toEqual(INITIAL);
    expect(reduce(INITIAL, { type: "ABORT" })).toBe(INITIAL);
  });
  it("Esc on the plate picks the front-most laddoo", () => {
    expect(LADDOO_FRONT_INDEX).toBe(LADDOO_SPOTS.length - 1);
    expect(reduce(at("plate"), { type: "ESCAPE" })).toEqual(at("picked", LADDOO_FRONT_INDEX));
    const picked = at("picked", 2);
    expect(reduce(picked, { type: "ESCAPE" })).toBe(picked);
  });
  it("picks once", () => {
    const picked = at("picked", 2);
    const next = reduce(picked, { type: "PICK", index: 1 });
    expect(next).toBe(picked);
    expect(next.picked).toBe(2);
  });
});

describe("helpers", () => {
  const phases: Phase[] = ["idle", "lit", "centre", "corner", "finale", "plate", "picked", "returning"];
  it("video plays only during the show", () => {
    for (const p of phases) expect(shouldPlayVideo(p)).toBe(p === "centre" || p === "corner");
  });
  it("overlay is closed only for idle and lit", () => {
    for (const p of phases) expect(isOverlayOpen(p)).toBe(p !== "idle" && p !== "lit");
  });
  it("ends at 1:07", () => {
    expect(videoReachedEnd(66.9)).toBe(false);
    expect(videoReachedEnd(67)).toBe(true);
    expect(videoReachedEnd(80)).toBe(true);
  });
  it("chakri box", () => {
    expect(chakriBox("centre", 1280, 800)).toEqual({ size: 288, x: 496, y: 256 });
    expect(chakriBox("corner", 1280, 800)).toEqual({ size: 120, x: 1112, y: 632 });
    expect(chakriBox("corner", 390, 844)).toEqual({ size: 80, x: 278, y: 732 });
    expect(chakriBox("centre", 390, 844).size).toBeCloseTo(140.4, 5);
  });
});

describe("flyerTransform", () => {
  const base = chakriBox("centre", 1280, 800);
  it("is the identity at the centre box", () => {
    expect(flyerTransform(toFlyerBox(base), base)).toBe("translate(0px, 0px) scale(1) rotate(0deg)");
  });
  it("moves, scales and turns onto another box by its centre", () => {
    expect(flyerTransform({ cx: 100, cy: 50, size: 72, rotate: -4 }, base)).toBe(
      "translate(-540px, -350px) scale(0.25) rotate(-4deg)",
    );
    expect(flyerTransform(toFlyerBox(chakriBox("corner", 1280, 800)), base)).toBe(
      "translate(532px, 292px) scale(0.4166666666666667) rotate(0deg)",
    );
  });
});
