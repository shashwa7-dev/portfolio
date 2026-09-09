/**
 * The two vertical hairlines at the edges of the reading measure.
 *
 * Drawn as one absolutely positioned box with `border-x` rather than as two
 * separate lines, so the pair can never end up a pixel apart.
 *
 * It centres the way `Container` centres, and that is deliberate. An element
 * with `left-0 right-0`, a `max-width` and `mx-auto` is over-constrained, so
 * the auto margins split the remainder and centre it inside the same
 * containing block a Container sits in. Anything measured from the viewport
 * instead (`position: fixed`, or a body background) lands a few pixels off,
 * because `scrollbar-gutter: stable` on body means the viewport and the
 * content box are not the same width.
 *
 * Rendered once, from `app/layout.tsx`, inside a `relative` wrapper around the
 * whole page. That wrapper's height is the document's height, so the rails run
 * unbroken from the navbar to the foot of the footer without anyone having to
 * measure anything. Per-page Rails imports are forbidden, the same rule the
 * global Navbar already follows.
 *
 * Visibility is a plain `.page-rails` class rather than a Tailwind
 * `min-[900px]:block` variant, and that is not a style preference. This repo's
 * `screens` config contains objects (the `-md` / `-lg` max-width aliases),
 * which switches Tailwind's arbitrary `min-*` / `max-*` variants off. It drops
 * them silently: the class compiled to no CSS at all, so the rails kept the
 * `hidden` they were paired with and never appeared at any width, while lint
 * and the build both stayed green. Hidden below 900px, in `globals.css`,
 * alongside the band rules that share the threshold.
 */
export default function Rails() {
  return (
    <span
      aria-hidden
      className="page-rails pointer-events-none absolute inset-0 mx-auto max-w-[var(--measure)] border-x border-border"
    />
  );
}
