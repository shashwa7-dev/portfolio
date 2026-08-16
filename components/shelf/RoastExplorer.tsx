"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Check, Minus, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Scrubber from "@/components/ui/Scrubber";
import { ROAST_STOPS, type Fit, type RoastStop } from "@/lib/roasts";

/**
 * Pick a roast, see what to make with it.
 *
 * The article can tell you that dark roast suits milk and light roast suits
 * filter, but a reader has to hold four roasts against six brew methods to see
 * the pattern, and a table of twenty-four cells is a thing people skip. Moving
 * one slider and watching the answers change teaches the same grid in about
 * five seconds.
 *
 * The control is a slider rather than a row of buttons because roast is a
 * continuum, not four species, and it should say so. The stop names underneath
 * stay tappable, since dragging to an exact stop on a phone is fiddly.
 */

/**
 * The verdict column, as an icon plus a colour plus a word.
 *
 * Colour alone would fail anyone who cannot separate the two hues, so the icon
 * carries the same distinction in shape and the word carries it in text.
 *
 * "Tricky" is amber rather than red on purpose. Red would say do not, and the
 * page argues the opposite: light roast espresso is a real and respected style,
 * it is just the hardest thing on the list. Amber says proceed knowing that.
 */
const FIT: Record<Fit, { label: string; icon: typeof Check; className: string }> = {
  great: { label: "Great", icon: Check, className: "text-good" },
  works: { label: "Works", icon: Minus, className: "text-muted-foreground" },
  tricky: { label: "Tricky", icon: TriangleAlert, className: "text-caution" },
};

export default function RoastExplorer() {
  const [i, setI] = useState(2);
  const stop = ROAST_STOPS[i];
  const id = useId();

  return (
    /* Anchored so the shelf can link straight at the control. Landing on the
       section heading instead would put the thing the link promised about six
       hundred pixels below the fold. `scroll-mt` clears the sticky header. */
    <div
      id="roast-picker"
      className="my-8 scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="border-b border-border p-5 md:p-6">
        <p
          id={id}
          className="font-mono text-2xs uppercase tracking-label text-subtle"
        >
          Drag to change the roast
        </p>

        <Scrubber
          labelledBy={id}
          value={i}
          onValueChange={setI}
          min={0}
          max={ROAST_STOPS.length - 1}
          step={1}
          valueText={stop.name}
          ticks={ROAST_STOPS.map((_, n) => n)}
          fill={`linear-gradient(to right, ${ROAST_STOPS.map((s) => s.swatch).join(", ")})`}
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

      {/* All four panels stay in the document; only the active one is in
          flow. The other three are taken out of it and held at `invisible`,
          which keeps them out of the layout and out of the tab order while
          leaving their text where a crawler can read it. Rendering only the
          selected roast, as this first did, put one roast in the markup and
          hid the other three from search entirely.

          Holding all four in flow was the other thing tried, and it fixed the
          jump by making the card as tall as its longest roast. It also left
          the shorter ones sitting in up to forty pixels of slack, which reads
          as a mistake at the bottom of the card rather than as breathing room.

          So the height follows the active panel, and the swap is instant.
          There is no transition on any of this on purpose: dragging the slider
          is a continuous gesture, and a fade behind it meant the panel was
          still catching up with a roast the reader had already moved past.

          The padding sits on each panel rather than on this wrapper, so the
          absolutely positioned ones can be pinned with `inset-0` and land
          exactly where the in-flow one does. */}
      <div className="relative">
        {/* Swapping by visibility is not something screen readers reliably
            announce, so the change is reported here instead. */}
        <p className="sr-only" aria-live="polite">
          {stop.name} roast
        </p>

        {ROAST_STOPS.map((s, n) => (
          <div
            key={s.name}
            aria-hidden={n !== i}
            className={cn(
              "p-5 md:p-6",
              n === i
                ? "relative"
                : "pointer-events-none invisible absolute inset-0"
            )}
          >
            <RoastPanel stop={s} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RoastPanel({ stop }: { stop: RoastStop }) {
  return (
    <>
      <div className="flex items-start gap-4">
        {/* The bean is the answer to "what does this look like in the bag",
            which is the question the words underneath cannot answer. */}
        <Image
          src={stop.bean}
          alt={`A coffee bean roasted to ${stop.name.toLowerCase()}`}
          width={240}
          height={240}
          sizes="64px"
          className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
          style={{ filter: stop.beanFilter }}
        />
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {stop.name}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {stop.inTheRoaster}
          </p>
        </div>
      </div>

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
              <span className="ml-2 text-xs text-muted-foreground">{b.why}</span>
            </span>
            <Verdict fit={b.fit} />
          </li>
        ))}
      </ul>

      <p className="mt-5 rounded-xl bg-elevated p-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Remember this: </span>
        {stop.remember}
      </p>
    </>
  );
}

function Verdict({ fit }: { fit: Fit }) {
  const { label, icon: Icon, className } = FIT[fit];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1.5 font-mono text-2xs uppercase tracking-label",
        className
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {label}
    </span>
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
