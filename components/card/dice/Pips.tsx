import type { Die } from "@/lib/card/types";

/** Pip layout per face, on a 3x3 grid indexed 0 to 8. */
const PIPS: Record<Die, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Drawn as circles rather than set as the unicode dice characters, which
 * render at wildly different weights and baselines across platforms. This
 * is the same reason the card prints its roll as text rather than glyphs.
 *
 * Shared by both skins: CubeDice uses it for every face of the live cube
 * and for its results row; TossDice uses it only for its results row (its
 * own airborne dice are a different, materially-lit SVG, not this flat
 * icon). Everything the two skins need differs only by size, so `className`
 * is the only prop: a die's value and its pip geometry are the same fact
 * everywhere, stated once here.
 */
export default function Pips({ value, className }: { value: Die; className?: string }) {
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="27"
        height="27"
        rx="6"
        className="fill-[var(--dice-stock)] stroke-[var(--dice-ink)]"
        strokeWidth="2"
      />
      {PIPS[value].map((slot) => (
        <circle
          key={slot}
          cx={8 + (slot % 3) * 7}
          cy={8 + Math.floor(slot / 3) * 7}
          r="2.1"
          className="fill-[var(--dice-ink)]"
        />
      ))}
    </svg>
  );
}
