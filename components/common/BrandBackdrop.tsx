import BrandBackdropFill from "@/components/common/BrandBackdropFill";
import { BRAND_BOX_CLASS, BRAND_SIZE, dotsPath } from "@/components/common/brandBitmap";

/**
 * The brand mark as a large, faint dot-matrix background: pinned to the top
 * right of the homepage and running off the page's top and right edges. Dots
 * fill in around the pointer on hover devices (BrandBackdropFill).
 *
 * Dots are grouped by diagonal, each group two paths, rather than ~900 circles:
 * that keeps the markup small and gives the load-in (`.brand-backdrop`) about
 * 60 animations to run instead of 900.
 */
const DIAGONALS = Array.from({ length: BRAND_SIZE * 2 - 1 }, (_, diagonal) => ({
  diagonal,
  lit: dotsPath("#", diagonal),
  unlit: dotsPath(".", diagonal),
}));

export default function BrandBackdrop() {
  return (
    /* The wrapper is what clips the bleed, so the mark can never widen the page.
       Its height only has to clear the mark's largest visible part. */
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] select-none overflow-hidden"
    >
      {/* Size and offsets scale together, so the bleed keeps its proportions
          from a phone (320px) up to wide screens (620px). */}
      <svg
        viewBox={`0 0 ${BRAND_SIZE} ${BRAND_SIZE}`}
        className={`brand-backdrop ${BRAND_BOX_CLASS} opacity-[0.13] dark:opacity-[0.17]`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.64}
        strokeLinecap="round"
      >
        {DIAGONALS.map(({ diagonal, lit, unlit }) => (
          <g key={diagonal} style={{ "--dot": diagonal } as React.CSSProperties}>
            {lit && <path d={lit} />}
            {unlit && <path d={unlit} opacity={0.12} />}
          </g>
        ))}
      </svg>
      <BrandBackdropFill />
    </div>
  );
}
