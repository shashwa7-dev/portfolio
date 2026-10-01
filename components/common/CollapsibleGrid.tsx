"use client";

import { Children, useState, type ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react/ssr";

/**
 * A card grid that shows its first `visible` items and hides the rest behind
 * a "Show all" toggle, with a fade over the last visible row so the cut reads
 * as "there is more" rather than as the end of the list.
 *
 * Built for /work/<org>'s Projects grid, where nine cards pushed the diary
 * (the page's real content) several screens down. The hidden cards are not
 * rendered until opened, so a closed grid costs only what it shows. With
 * `visible` items or fewer it renders a plain grid and no toggle.
 */
export default function CollapsibleGrid({
  children,
  visible = 4,
  className = "grid grid-cols-1 gap-4 sm:grid-cols-2",
}: {
  children: ReactNode;
  visible?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const items = Children.toArray(children);

  if (items.length <= visible) return <div className={className}>{items}</div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className={className}>{open ? items : items.slice(0, visible)}</div>
        {!open && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent"
          />
        )}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-full border border-border-strong px-4 py-1.5 font-mono text-2xs uppercase tracking-label text-muted-foreground transition-colors duration-base ease-out hover:bg-muted hover:text-foreground candy:border-2 candy:border-foreground candy:bg-white candy:text-foreground"
        >
          {open ? "Show less" : `Show all ${items.length}`}
          <CaretDown
            aria-hidden
            weight="bold"
            className={`h-3 w-3 transition-transform duration-base ease-out ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
