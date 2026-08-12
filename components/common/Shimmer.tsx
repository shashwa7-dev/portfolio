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
 * The sheen is tinted with `--background`, not white. These surfaces are painted
 * in `--foreground`, which inverts between themes, so a white sheen would be
 * invisible in dark mode where the surface is already near-white. Tinting with
 * the background token means the highlight always contrasts with whatever it
 * sweeps across.
 *
 * `motion-reduce:hidden` removes it outright. It is decoration with no state to
 * convey, so there is nothing to degrade gracefully to.
 */
export default function Shimmer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative overflow-hidden", className)}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/40 to-transparent group-hover:animate-shimmer motion-reduce:hidden"
      />
    </span>
  );
}
