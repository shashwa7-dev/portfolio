import { cn } from "@/lib/utils";

/**
 * Marks something as currently live. One shape, matching the "Currently building"
 * badge on the Experience rows and "Open to work" in the hero, so a live-status
 * signal reads the same way everywhere.
 *
 * Three things were removed rather than restyled.
 *
 * It had four variants (`default`, `overlay`, `pill`, `minimal`) and exactly one
 * call site, which used `pill`. The other three could never render.
 *
 * Every variant was green: a green border, a green fill and green text. That
 * contradicts the rule recorded in `About.tsx`, that green is the dot and nothing
 * else, because a filled hue on a deliberately hueless page reads as an intrusion.
 * The dot keeps the colour, which is the part it earns.
 *
 * The dot also carried `animate-pulse`. A permanent ambient loop is what this
 * repo's motion audit rejected, and a badge that pulses forever on a page you
 * scroll past is the clearest case of it.
 */
export function ActiveBadge({
  label = "Active",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border-strong px-2 py-0.5 font-mono text-2xs font-medium uppercase tracking-label text-muted-foreground",
        className
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
      {label}
    </span>
  );
}
