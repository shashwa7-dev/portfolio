"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A capsule track you can drag, click or arrow through.
 *
 * Built rather than reached for because a native `<input type="range">` is
 * styleable only through vendor pseudo-elements, and the result still reads as
 * a browser widget dropped into the page.
 *
 * Giving up the native input means rebuilding what it provided for free, so
 * this carries the whole slider contract: `role="slider"` with min, max and
 * now, arrow keys in both axes, Home and End, and `aria-valuetext` so a screen
 * reader can announce a name instead of an index.
 *
 * Motion is two CSS transitions on the repo's `duration-fast` and `ease-out`
 * tokens rather than a spring library, and both are dropped while dragging so
 * the thumb tracks the finger exactly instead of easing along behind it.
 */
export type ScrubberProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accessible name. Omit only when `labelledBy` points at visible text. */
  label?: string;
  labelledBy?: string;
  /** What a screen reader should say instead of the raw number. */
  valueText?: string;
  /** Values to mark on the track. Marks at `min` or `max` are dropped, since
   *  the thumb parks on top of them. */
  ticks?: number[];
  /** CSS background for the filled portion. Defaults to solid ink at low
   *  opacity; pass a gradient to make the fill mean something. */
  fill?: string;
  className?: string;
};

export default function Scrubber({
  value,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.01,
  label,
  labelledBy,
  valueText,
  ticks = [],
  fill,
  className,
}: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const range = max - min;
  const pctOf = (v: number) => (range > 0 ? ((v - min) / range) * 100 : 0);
  const pct = pctOf(value);

  const commit = (raw: number) => {
    const snapped = Math.round((raw - min) / step) * step + min;
    // Rounding to the step can leave 0.30000000000000004, which is invisible
    // in a percentage but shows up the moment a caller renders the number.
    const fixed = Number(snapped.toFixed(6));
    onValueChange(Math.min(max, Math.max(min, fixed)));
  };

  const fromPointer = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return value;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return min + ratio * range;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowUp"
        ? value + step
        : e.key === "ArrowLeft" || e.key === "ArrowDown"
          ? value - step
          : e.key === "Home"
            ? min
            : e.key === "End"
              ? max
              : null;
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.preventDefault();
        trackRef.current?.setPointerCapture(e.pointerId);
        setDragging(true);
        commit(fromPointer(e.clientX));
      }}
      onPointerMove={(e) => {
        if (dragging) commit(fromPointer(e.clientX));
      }}
      onPointerUp={(e) => {
        trackRef.current?.releasePointerCapture(e.pointerId);
        setDragging(false);
      }}
      onPointerCancel={() => setDragging(false)}
      className={cn(
        "relative h-11 cursor-pointer touch-none select-none overflow-hidden rounded-xl border border-border bg-elevated outline-offset-2",
        className
      )}
    >
      {/* Clipped rather than resized. A gradient on a box that grows drags its
          own colours along with the thumb, so the far end of the ramp would
          never actually sit at the far end of the track. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          !dragging &&
            "transition-[clip-path] duration-fast ease-out motion-reduce:transition-none"
        )}
        style={{
          clipPath: `inset(0 ${100 - pct}% 0 0)`,
          background: fill ?? "hsl(var(--foreground) / 0.14)",
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {ticks
          .filter((t) => t > min && t < max)
          .map((t) => (
            <span
              key={t}
              className="absolute top-1/2 h-1.5 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
              style={{ left: `${pctOf(t)}%` }}
            />
          ))}
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
          !dragging &&
            "transition-[left] duration-fast ease-out motion-reduce:transition-none"
        )}
        style={{ left: `${pct}%` }}
      >
        {/* Ink with a ring in the card colour, so it survives both a bare track
            and a saturated fill underneath it, in either theme. Ink alone
            disappears into a dark fill in light mode. Nudged in at the ends so
            it reads as a mark on the track rather than half a mark falling off
            the edge of it. */}
        <span
          className="block h-6 w-1 rounded-full bg-foreground ring-2 ring-card"
          style={{ marginLeft: pct <= 0 ? 3 : pct >= 100 ? -3 : 0 }}
        />
      </div>
    </div>
  );
}
