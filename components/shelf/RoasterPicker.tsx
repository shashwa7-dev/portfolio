"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { roasters, roasterInitials, type Bean } from "@/lib/coffee";

/**
 * Roaster chips over a list of what I drank from whichever one is selected.
 *
 * The chips are a horizontally scrolling row rather than a grid of cards. A
 * grid grows a new row for every roaster added, and on a phone that pushed the
 * rest of the page down each time the list got longer. A row stays one row tall
 * at four roasters or fourteen, and scrolls sideways instead.
 *
 * This is the only interactive piece on the shelf, so it is the only client
 * component. Everything else on the route stays a server component.
 */
export default function RoasterPicker() {
  const [active, setActive] = useState(roasters[0].slug);
  const current = roasters.find((r) => r.slug === active) ?? roasters[0];

  return (
    <div className="space-y-6">
      {/* `-mx-6 px-6` lets the row bleed to the container edge while it scrolls,
          so a chip is never visually clipped mid-way by the page gutter. */}
      <div
        role="tablist"
        aria-label="Roasters"
        className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {roasters.map((r) => {
          const selected = r.slug === active;
          return (
            <button
              key={r.slug}
              role="tab"
              aria-selected={selected}
              aria-controls="roaster-panel"
              onClick={() => setActive(r.slug)}
              className="flex w-[76px] shrink-0 flex-col items-center gap-2 text-center sm:w-[84px]"
            >
              {/* Selected gains a shadow and full-strength logo; the others
                  recede to 45% opacity. Deliberately no vertical movement: the
                  row is an `overflow-x-auto` scroller, which clips in the block
                  direction too, so a lifted chip had its top border shaved off. */}
              <span
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full border bg-card p-2.5 transition-[box-shadow,border-color] duration-base ease-out sm:h-16 sm:w-16",
                  selected
                    ? "border-border-strong shadow-[0_2px_12px_-2px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.55)]"
                    : "border-border hover:border-border-strong"
                )}
              >
                {r.logo ? (
                  <Image
                    src={r.logo}
                    alt=""
                    width={64}
                    height={64}
                    className={cn(
                      "h-full w-full object-contain grayscale transition-opacity duration-base ease-out",
                      selected ? "opacity-100" : "opacity-45"
                    )}
                  />
                ) : (
                  <span
                    className={cn(
                      "font-mono text-sm transition-colors",
                      selected ? "text-foreground" : "text-subtle"
                    )}
                  >
                    {roasterInitials(r.name)}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "max-w-full truncate text-2xs",
                  selected ? "font-semibold text-foreground" : "text-subtle"
                )}
              >
                {r.name}
              </span>
              {r.inRotation && (
                <span
                  aria-label="In rotation"
                  title="In rotation"
                  className="h-1 w-1 rounded-full bg-foreground"
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        id="roaster-panel"
        role="tabpanel"
        className="overflow-hidden rounded-2xl border border-border"
      >
        {current.beans.map((bean, i) => (
          <BeanRow key={bean.name} bean={bean} first={i === 0} />
        ))}
      </div>
    </div>
  );
}

function BeanRow({ bean, first }: { bean: Bean; first: boolean }) {
  return (
    <div className={cn("bg-card p-5", !first && "border-t border-border")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{bean.name}</p>
          <p className="mt-0.5 font-mono text-2xs uppercase tracking-label text-subtle">
            {[bean.roast, bean.origin].filter(Boolean).join("  ·  ")}
          </p>
        </div>
        {bean.rating ? (
          <Rating value={bean.rating} />
        ) : (
          <span className="shrink-0 pt-1 font-mono text-2xs text-border-strong">
            not yet
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{bean.note}</p>
      {bean.link && (
        <Link
          href={bean.link.href}
          className="group mt-2.5 inline-flex items-center gap-1 text-sm text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
        >
          {bean.link.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/**
 * Dots rather than stars. Stars would be the first decorative shape on a site
 * that is otherwise strictly typographic, and they carry a review-site tone
 * this list is trying to avoid.
 */
function Rating({ value }: { value: number }) {
  return (
    <span
      className="flex shrink-0 gap-1 pt-1.5"
      role="img"
      aria-label={`${value} out of 5`}
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
  );
}
