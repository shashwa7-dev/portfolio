/**
 * The printing reveal: compositing only, no drawing code.
 *
 * CardMinter draws the finished card to an offscreen canvas exactly once
 * (with `drawTicket`, unchanged), then this module reveals that finished
 * frame onto the visible canvas top to bottom over time. `drawTicket` never
 * appears in this file: the pixels it produces are untouched, only when
 * they become visible changes. Kept framework and DOM free (window,
 * document and requestAnimationFrame are all passed in or defaulted, never
 * read directly) so it can be unit tested the same way the rest of
 * lib/card is, with a recording stub context and no browser.
 */

/** The subset of CanvasRenderingContext2D the reveal actually touches. */
export interface RevealCtx {
  clearRect(x: number, y: number, w: number, h: number): void;
  drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void;
  save(): void;
  restore(): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  globalAlpha: number;
  fillStyle: string | CanvasGradient | CanvasPattern;
}

export const DEFAULT_PRINT_DURATION_MS = 900;

/**
 * Parses the `--duration-print` custom property ("900ms", "0.9s", ...) into
 * milliseconds. Falls back to `fallback` for anything missing, empty, or not
 * a recognised CSS time, so a stripped or renamed token degrades to a
 * reasonable default instead of a broken animation.
 */
export function parsePrintDuration(
  raw: string | null | undefined,
  fallback: number = DEFAULT_PRINT_DURATION_MS
): number {
  if (!raw) return fallback;
  const match = raw.trim().match(/^(-?[\d.]+)(ms|s)?$/);
  if (!match) return fallback;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value < 0) return fallback;
  return match[2] === "s" ? value * 1000 : value;
}

export interface PrintRevealOptions {
  /** The visible canvas's own context. Cleared and redrawn every frame. */
  ctx: RevealCtx;
  /** The offscreen canvas the finished card was drawn to, once. */
  source: CanvasImageSource;
  /** Device-pixel size shared by the visible canvas and the source. */
  width: number;
  height: number;
  /** Resolved from --duration-print, in milliseconds. */
  durationMs: number;
  /** `window.matchMedia("(prefers-reduced-motion: reduce)").matches`, read by the caller: this module never touches `window` itself. */
  reducedMotion: boolean;
  /** Called once, after the final frame is drawn. */
  onDone?: () => void;
  /** Injectable for tests; default to real timers/rAF when omitted. */
  now?: () => number;
  raf?: (cb: FrameRequestCallback) => number;
  caf?: (handle: number) => void;
}

/**
 * Reveals `source` onto `ctx` top to bottom over `durationMs`, then stops.
 * Under reduced motion, draws the finished frame in a single call and never
 * schedules a frame at all.
 *
 * Returns a cancel function. Call it from the effect's cleanup so an unmount
 * mid-reveal cannot go on writing to a detached canvas.
 */
export function startPrintReveal(options: PrintRevealOptions): () => void {
  const {
    ctx,
    source,
    width,
    height,
    durationMs,
    reducedMotion,
    onDone,
    now = () => performance.now(),
    raf = (cb: FrameRequestCallback) => requestAnimationFrame(cb),
    caf = (handle: number) => cancelAnimationFrame(handle),
  } = options;

  const drawFrame = (t: number) => {
    const clamped = Math.min(1, Math.max(0, t));
    const sliceH = Math.round(height * clamped);
    ctx.clearRect(0, 0, width, height);
    if (sliceH > 0) {
      ctx.drawImage(source, 0, 0, width, sliceH, 0, 0, width, sliceH);
    }
    // The print head: a thin bright line at the reveal edge, fading out as
    // the reveal completes. Left out of the final frame so nothing is left
    // behind once the card is done.
    if (clamped < 1) {
      const headH = Math.max(2, Math.round(height * 0.004));
      ctx.save();
      ctx.globalAlpha = 1 - clamped;
      ctx.fillStyle = "#fffdf5";
      ctx.fillRect(0, Math.max(0, sliceH - headH), width, headH);
      ctx.restore();
    }
  };

  if (reducedMotion) {
    drawFrame(1);
    onDone?.();
    return () => {};
  }

  let handle = 0;
  let cancelled = false;
  const start = now();

  const tick = () => {
    if (cancelled) return;
    const elapsed = now() - start;
    const t = durationMs > 0 ? elapsed / durationMs : 1;
    if (t >= 1) {
      drawFrame(1);
      onDone?.();
      return;
    }
    drawFrame(t);
    handle = raf(tick);
  };

  handle = raf(tick);

  return () => {
    cancelled = true;
    caf(handle);
  };
}
