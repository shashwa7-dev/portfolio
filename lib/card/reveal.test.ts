import { describe, it, expect, vi } from "vitest";
import { startPrintReveal, parsePrintDuration, prefersReducedMotion, DEFAULT_PRINT_DURATION_MS } from "./reveal";
import type { RevealCtx } from "./reveal";

/**
 * A minimal recording stub, the same spirit as makeStubCtx in ticket.test.ts
 * but scoped to the handful of methods the reveal actually calls.
 */
function makeStubCtx() {
  const calls: string[] = [];
  const ctx: RevealCtx = {
    globalAlpha: 1,
    fillStyle: "",
    clearRect: (...args) => calls.push(`clearRect(${args.join(",")})`),
    // The image source itself isn't meaningful in a string log (and stringifies
    // to "[object Object]"), so only the numeric slice/position args are kept,
    // the same filtering convention makeStubCtx uses in ticket.test.ts.
    drawImage: ((...args: unknown[]) =>
      calls.push(
        `drawImage(${args.filter((a): a is number => typeof a === "number").join(",")})`
      )) as RevealCtx["drawImage"],
    fillRect: (...args) => calls.push(`fillRect(${args.join(",")})`),
    save: () => calls.push("save"),
    restore: () => calls.push("restore"),
  };
  return { ctx, calls };
}

/** A fake source is never inspected, only forwarded to drawImage. */
const SOURCE = {} as CanvasImageSource;

describe("parsePrintDuration", () => {
  it("parses a millisecond token", () => {
    expect(parsePrintDuration("900ms")).toBe(900);
  });

  it("parses a second token", () => {
    expect(parsePrintDuration("0.9s")).toBe(900);
  });

  it("parses a bare number as milliseconds", () => {
    expect(parsePrintDuration("450")).toBe(450);
  });

  it("tolerates the surrounding whitespace getComputedStyle returns", () => {
    expect(parsePrintDuration("  900ms  ")).toBe(900);
  });

  it("falls back for missing, empty or unrecognised values", () => {
    expect(parsePrintDuration(null)).toBe(DEFAULT_PRINT_DURATION_MS);
    expect(parsePrintDuration(undefined)).toBe(DEFAULT_PRINT_DURATION_MS);
    expect(parsePrintDuration("")).toBe(DEFAULT_PRINT_DURATION_MS);
    expect(parsePrintDuration("auto")).toBe(DEFAULT_PRINT_DURATION_MS);
    expect(parsePrintDuration("-100ms")).toBe(DEFAULT_PRINT_DURATION_MS);
  });

  it("honours a caller-supplied fallback", () => {
    expect(parsePrintDuration(undefined, 250)).toBe(250);
  });
});

describe("prefersReducedMotion", () => {
  it("returns true when matchMedia reports the preference", () => {
    const win = {
      matchMedia: (query: string) => ({ matches: query.includes("reduce") }),
    } as unknown as Window;
    expect(prefersReducedMotion(win)).toBe(true);
  });

  it("returns false when matchMedia reports no preference", () => {
    const win = {
      matchMedia: () => ({ matches: false }),
    } as unknown as Window;
    expect(prefersReducedMotion(win)).toBe(false);
  });

  it("returns false, not a throw, when matchMedia is entirely absent", () => {
    const win = {} as unknown as Window;
    expect(() => prefersReducedMotion(win)).not.toThrow();
    expect(prefersReducedMotion(win)).toBe(false);
  });

  it("returns false when window itself is undefined", () => {
    expect(prefersReducedMotion(undefined)).toBe(false);
  });
});

describe("startPrintReveal, reduced motion", () => {
  it("draws the finished card in a single frame and never schedules one", () => {
    const { ctx, calls } = makeStubCtx();
    const raf = vi.fn();
    const caf = vi.fn();
    const onDone = vi.fn();

    startPrintReveal({
      ctx,
      source: SOURCE,
      width: 1200,
      height: 1500,
      durationMs: 900,
      reducedMotion: true,
      onDone,
      raf,
      caf,
    });

    expect(raf).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledTimes(1);
    // One clear, one full-height drawImage, and no print-head fillRect: the
    // finished frame has nothing left revealing.
    expect(calls).toEqual([
      "clearRect(0,0,1200,1500)",
      "drawImage(0,0,1200,1500,0,0,1200,1500)",
    ]);
  });
});

describe("startPrintReveal, animated", () => {
  it("reveals top to bottom across frames, then stops", () => {
    const { ctx, calls } = makeStubCtx();
    const onDone = vi.fn();
    let queued: FrameRequestCallback | null = null;
    let elapsed = 0;

    startPrintReveal({
      ctx,
      source: SOURCE,
      width: 1200,
      height: 1500,
      durationMs: 900,
      reducedMotion: false,
      onDone,
      now: () => elapsed,
      raf: (cb) => {
        queued = cb;
        return 1;
      },
      caf: () => {},
    });

    // First frame is scheduled, not drawn synchronously.
    expect(calls).toEqual([]);
    expect(queued).not.toBeNull();

    // Halfway through: a partial slice, plus the print head.
    elapsed = 450;
    queued!(elapsed);
    expect(calls.some((c) => c.startsWith("drawImage(0,0,1200,750,0,0,1200,750)"))).toBe(true);
    expect(calls.some((c) => c.startsWith("fillRect"))).toBe(true);
    expect(onDone).not.toHaveBeenCalled();

    // Past the duration: the full frame, no head, onDone fires once.
    elapsed = 1000;
    queued!(elapsed);
    expect(calls[calls.length - 1]).toBe("drawImage(0,0,1200,1500,0,0,1200,1500)");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("cancels the loop on unmount: cancel() stops further frames", () => {
    const { ctx, calls } = makeStubCtx();
    const onDone = vi.fn();
    let queued: FrameRequestCallback | null = null;
    const caf = vi.fn();

    const cancel = startPrintReveal({
      ctx,
      source: SOURCE,
      width: 1200,
      height: 1500,
      durationMs: 900,
      reducedMotion: false,
      onDone,
      now: () => 100,
      raf: (cb) => {
        queued = cb;
        return 7;
      },
      caf,
    });

    const before = calls.length;
    cancel();
    expect(caf).toHaveBeenCalledWith(7);

    // Simulate a browser that fails to actually cancel the frame (or a
    // frame already in flight when cancel ran): the internal guard must
    // still refuse to draw or double-fire onDone.
    queued!(100);
    expect(calls.length).toBe(before);
    expect(onDone).not.toHaveBeenCalled();
  });
});
