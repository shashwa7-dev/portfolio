"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ROAST_STOPS, type Fit } from "@/lib/roasts";

/**
 * Pick a roast, see what to make with it.
 *
 * The article can tell you that dark roast suits milk and light roast suits
 * filter, but a reader has to hold four roasts against six brew methods to see
 * the pattern, and a table of twenty-four cells is a thing people skip. Moving
 * one slider and watching the answers change teaches the same grid in about
 * five seconds.
 *
 * It is a native `<input type="range">` rather than a row of buttons, for two
 * reasons. Roast is a continuum, not four species, and the control should say
 * so. And a range input arrives with arrow keys, Home, End, a focus ring and a
 * screen-reader announcement already working, none of which a div would have.
 */

const FIT_LABEL: Record<Fit, string> = {
  great: "Great",
  works: "Works",
  tricky: "Tricky",
};

export default function RoastExplorer() {
  const [i, setI] = useState(2);
  const stop = ROAST_STOPS[i];
  const id = useId();

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-5 md:p-6">
        <p
          id={id}
          className="font-mono text-2xs uppercase tracking-label text-subtle"
        >
          Drag to change the roast
        </p>

        <RoastScrubber
          labelledBy={id}
          index={i}
          onChange={setI}
          className="mt-3"
        />

        <div className="mt-2 flex justify-between gap-2">
          {ROAST_STOPS.map((s, n) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setI(n)}
              /* The labels double as targets. Dragging to an exact stop on a
                 phone is fiddly, and a reader who has already read the word
                 will try to tap it. */
              className={cn(
                "text-2xs transition-colors duration-fast ease-out",
                n === i
                  ? "font-semibold text-foreground"
                  : "text-subtle hover:text-muted-foreground"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Announced on change, because the whole point of the control is the
          text underneath it and a sighted user gets that for free. */}
      <div aria-live="polite" className="p-5 md:p-6">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          {stop.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {stop.inTheRoaster}
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Meter label="Acidity" value={stop.acidity} hint={stop.acidityHint} />
          <Meter label="Body" value={stop.body} hint={stop.bodyHint} />
        </div>

        <p className="mt-5 font-mono text-2xs uppercase tracking-label text-subtle">
          Tastes like
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {stop.taste}
        </p>

        <p className="mt-5 font-mono text-2xs uppercase tracking-label text-subtle">
          Make it as
        </p>
        <ul className="mt-2 border-t border-border">
          {stop.brews.map((b) => (
            <li
              key={b.method}
              className="flex items-baseline justify-between gap-4 border-b border-border py-2.5"
            >
              <span className="min-w-0">
                <span className="text-sm text-foreground">{b.method}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {b.why}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono text-2xs uppercase tracking-label",
                  b.fit === "great"
                    ? "text-foreground"
                    : b.fit === "works"
                      ? "text-muted-foreground"
                      : "text-subtle"
                )}
              >
                {FIT_LABEL[b.fit]}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-xl bg-elevated p-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Remember this: </span>
          {stop.remember}
        </p>
      </div>
    </div>
  );
}

/**
 * The track: a capsule you can drag, click or arrow through.
 *
 * It replaced a native `<input type="range">`, which is the safe choice and
 * looked like a browser widget dropped into the page. What it gave away for
 * free has to be rebuilt by hand here, so this carries the full slider
 * contract: `role="slider"` with min, max and now, plus `aria-valuetext` so a
 * screen reader announces "Medium-dark" rather than "2".
 *
 * The value is an index, not a quantity. Pointer position is converted to the
 * nearest stop rather than a continuous number, so the thumb always lands on a
 * roast and a click anywhere on the track picks the closest one.
 *
 * Motion is CSS rather than a spring library: `duration-fast` and `ease-out`
 * resolve to the tokens in `lib/motionVariants.ts`, which is the only sanctioned
 * curve in this codebase, and the whole thing is two transitions.
 */
function RoastScrubber({
  index,
  onChange,
  labelledBy,
  className,
}: {
  index: number;
  onChange: (i: number) => void;
  labelledBy: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const last = ROAST_STOPS.length - 1;
  const pct = (index / last) * 100;

  const fromPointer = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return index;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return Math.round(ratio * last);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowUp"
        ? index + 1
        : e.key === "ArrowLeft" || e.key === "ArrowDown"
          ? index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    onChange(Math.min(last, Math.max(0, next)));
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-labelledby={labelledBy}
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={index}
      aria-valuetext={ROAST_STOPS[index].name}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.preventDefault();
        trackRef.current?.setPointerCapture(e.pointerId);
        setDragging(true);
        onChange(fromPointer(e.clientX));
      }}
      onPointerMove={(e) => dragging && onChange(fromPointer(e.clientX))}
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
      {/* The roast ramp, revealed left to right. Clipped rather than resized:
          a gradient on a growing box would slide its own colours along with
          the thumb, so dark would never be at the dark end. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          !dragging && "transition-[clip-path] duration-fast ease-out motion-reduce:transition-none"
        )}
        style={{
          clipPath: `inset(0 ${100 - pct}% 0 0)`,
          background: `linear-gradient(to right, ${ROAST_STOPS.map((s) => s.swatch).join(", ")})`,
        }}
      />

      {/* Ticks for the two interior stops. The outer two sit under the thumb
          at its end positions, where a mark would only ever be covered up. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {ROAST_STOPS.slice(1, -1).map((s, n) => (
          <span
            key={s.name}
            className="absolute top-1/2 h-1.5 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/25"
            style={{ left: `${((n + 1) / last) * 100}%` }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
          !dragging && "transition-[left] duration-fast ease-out motion-reduce:transition-none"
        )}
        style={{ left: `${pct}%` }}
      >
        {/* Ink thumb with a ring in the card colour, because it has to stay
            visible against four backgrounds: bare track at the light end and
            near-black gradient at the dark end, in both themes. Ink alone
            disappears into dark roast in light mode; the ring is what saves it.
            Inset a little at the ends so it reads as a mark on the track
            rather than half a mark falling off it. */}
        <span
          className="block h-6 w-1 rounded-full bg-foreground ring-2 ring-card"
          style={{ marginLeft: index === 0 ? 3 : index === last ? -3 : 0 }}
        />
      </div>
    </div>
  );
}

/**
 * Five dots rather than a number out of five. The same idiom the bean ratings
 * on `/shelf` use, so the two pages read as one site.
 */
function Meter({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-2xs uppercase tracking-label text-subtle">
          {label}
        </span>
        <span
          className="flex gap-1"
          role="img"
          aria-label={`${label}: ${value} out of 5`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                n <= value ? "bg-foreground" : "bg-border-strong"
              )}
            />
          ))}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
