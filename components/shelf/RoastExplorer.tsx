"use client";

import { useId, useState } from "react";
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
        <label
          htmlFor={id}
          className="font-mono text-2xs uppercase tracking-label text-subtle"
        >
          Drag to change the roast
        </label>

        {/* The border is not decoration. The dark swatch is nearly the same
            value as the card in dark mode, so without an outline the scale
            looks like it stops somewhere around medium-dark. */}
        <div
          aria-hidden
          className="mt-3 h-2 rounded-full border border-border"
          style={{
            background: `linear-gradient(to right, ${ROAST_STOPS.map((s) => s.swatch).join(", ")})`,
          }}
        />

        <input
          id={id}
          type="range"
          min={0}
          max={ROAST_STOPS.length - 1}
          step={1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-valuetext={stop.name}
          className="mt-2 w-full cursor-pointer accent-foreground"
        />

        <div className="flex justify-between gap-2">
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
