import { cn } from "@/lib/utils";

/**
 * Wraps a small surface and sweeps a soft sheen across it on hover.
 *
 * **The sweep is hover-triggered, not ambient, and that is not a limitation.**
 * A looping shimmer is exactly the pattern this repo's motion audit rejected
 * elsewhere: a permanent animation on something you scroll past competes for
 * attention every second it is on screen, and cannot be justified by frequency.
 * It also cannot be reconciled with "subtle". Firing once per hover keeps the
 * effect and removes the cost, and it matches how every other image surface here
 * already behaves, rewarding a pointer rather than demanding one.
 *
 * Requires a `group` on an ancestor, since the trigger is `group-hover`. Putting
 * the group on a wrapper rather than on this element is deliberate: it lets the
 * whole component that owns the sheen be the hover target, which is usually
 * larger and easier to hit than the strip being decorated.
 *
 * `tone` picks the sheen's tint, and the choice follows from whether the surface
 * beneath it changes with the theme.
 *
 * - `media` (default) is a fixed white. Use it on scrims over images, where the
 *   surface is a constant regardless of theme. A palette token would be wrong
 *   here: `--foreground` inverts, so it would be a *darker* smear in one theme.
 * - `surface` is tinted with `--foreground`. Use it on palette surfaces like
 *   `bg-card`, which invert with the theme, so the sheen must invert alongside
 *   them. A fixed white sheen on a light card is simply invisible.
 *
 * The distinction is the whole reason this prop exists rather than one hardcoded
 * tint, and getting it backwards produces a shimmer that appears to work in
 * whichever theme you happened to develop in.
 *
 * `motion-reduce:hidden` removes it outright. It is decoration with no state to
 * convey, so there is nothing to degrade gracefully to.
 */
export default function Shimmer({
  children,
  className,
  tone = "media",
}: {
  children: React.ReactNode;
  /** Must include a display utility: this component sets none of its own. */
  className?: string;
  tone?: "media" | "surface";
}) {
  return (
    <span className={cn("relative overflow-hidden", className)}>
      {children}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent group-hover:animate-shimmer motion-reduce:hidden",
          tone === "media" ? "via-white/30" : "via-foreground/20"
        )}
      />
    </span>
  );
}
