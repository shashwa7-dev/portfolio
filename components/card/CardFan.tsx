import { cn } from "@/lib/utils";

/**
 * Three blank cards fanned open, as decoration.
 *
 * The card is generative and per-visitor, so nothing decorative can show a
 * real one: a screenshot of a minted card would print one visitor's portrait
 * and serial as though it belonged to whoever is looking. Three blank stocks
 * sidestep that. No portrait, no serial, no name, only a sample of the range
 * of editions that exist.
 *
 * Everything is derived from `w`, the width of one card, so the fan has one
 * shape at every size rather than a second set of hand-picked offsets per
 * use. The ratios come from the tuned fan in the homepage nudge: cards are
 * 1.3 times as tall as they are wide, the box is twice a card wide, and the
 * three offsets are 0.385, 0.115 and 0.154 of a card's width. Rotations are
 * fixed in degrees, since an angle does not scale.
 *
 * A component rather than markup copied into each caller. `CardNudge` still
 * carries its own copy of this fan on the branch that reshaped the footer;
 * when that lands it should take this instead, and delete its own.
 */

/**
 * Real issue stocks, copied by eye from `STOCK` in `lib/card/ticket.ts`:
 * commemorative, first day, and the rare black inverted stock. Definitive
 * and misprint are left out, both sitting within a hair of commemorative's
 * cream. Local constants rather than an import from `lib/card/`, because
 * this is a decorative approximation and not a rendering of a real card:
 * coupling it to the card feature's internals over three hex strings would
 * be the wrong kind of reuse. If `STOCK` changes, update this by eye.
 */
const FAN_STOCKS = ["#f4eede", "#eef1ef", "#17161a"];

export default function CardFan({
  w,
  className,
}: {
  /** The width of one card, in px. Everything else is derived from it. */
  w: number;
  className?: string;
}) {
  const h = w * 1.3;
  /* Each card keeps its centring offset (the 50%) and its fan offset in one
     translate: Tailwind's translate-x and translate-y utilities each own a
     single CSS variable, so a second one would overwrite the first rather
     than add to it. Written as inline transforms here for the same reason,
     since the offsets are computed. */
  const card = "absolute left-1/2 top-1/2 rounded-[3px] border border-border-strong";
  const box = { width: w, height: h };

  return (
    <span
      aria-hidden="true"
      className={cn("relative block shrink-0 select-none", className)}
      style={{ width: w * 2, height: h * 1.2 }}
    >
      <span
        className={card}
        style={{
          ...box,
          backgroundColor: FAN_STOCKS[0],
          transform: `translate(calc(-50% - ${w * 0.385}px), -50%) rotate(-10deg)`,
        }}
      />
      <span
        className={card}
        style={{
          ...box,
          backgroundColor: FAN_STOCKS[1],
          transform: `translate(calc(-50% - ${w * 0.115}px), -50%) rotate(-3deg)`,
        }}
      />
      {/* The rare black stock, drawn last so ordinary stacking order puts it
          on top. It keeps a border like the other two: against a near-black
          page in dark theme it would otherwise have no edge at all. */}
      <span
        className={cn(card, "shadow-sm")}
        style={{
          ...box,
          backgroundColor: FAN_STOCKS[2],
          transform: `translate(calc(-50% + ${w * 0.154}px), -50%) rotate(7deg)`,
        }}
      />
    </span>
  );
}
