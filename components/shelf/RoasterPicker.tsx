"use client";

import { useRef, useState } from "react";
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * The tab roles promise keyboard behaviour that has to be supplied by hand:
   * one stop in the tab order for the whole set, arrows to move between them,
   * Home/End to jump. Without this a screen reader announces "tab 1 of 4" and
   * then the arrow keys do nothing, which is worse than plain buttons.
   */
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const delta =
      e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    let next = -1;
    if (delta) next = (i + delta + roasters.length) % roasters.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = roasters.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(roasters[next].slug);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="space-y-6">
      {/* `-mx-6 px-6` lets the row bleed to the container edge while it scrolls,
          so a chip is never visually clipped mid-way by the page gutter. */}
      <div
        role="tablist"
        aria-label="Roasters"
        className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {roasters.map((r, i) => {
          const selected = r.slug === active;
          return (
            <button
              key={r.slug}
              id={`roaster-tab-${r.slug}`}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              aria-selected={selected}
              aria-controls="roaster-panel"
              tabIndex={selected ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => setActive(r.slug)}
              className="flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-24"
            >
              {/* A bag rather than a disc, because that is the thing you
                  actually pick up in a shop. The pouch is one shared PNG with
                  the roaster's mark printed onto its front face.

                  Deliberately no vertical movement on select: the row is an
                  `overflow-x-auto` scroller, which clips in the block direction
                  too, so a lifted chip had its top shaved off. */}
              {/* Square, matching the source file. The pouch art is a square
                  image, so a non-square box letterboxes it and every percentage
                  below stops describing the place on the bag it was measured
                  against. */}
              <span className="relative block aspect-square w-full">
                <Image
                  src="/shelf/pouch-white.webp"
                  alt=""
                  fill
                  sizes="(min-width: 640px) 96px, 80px"
                  className={cn(
                    "object-contain transition-opacity duration-base ease-out",
                    selected ? "opacity-100" : "opacity-40"
                  )}
                />
                {/* Centred, because this bag is shot straight on. Measured
                    from the file's alpha rather than by eye: the artwork spans
                    x 80..275 of 360, so its centre is 49.3% and the panel wants
                    a symmetric box. The old 29/39 split was for the previous
                    bag, which was photographed at an angle with its face left
                    of centre. */}
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    left: "33%",
                    right: "33%",
                    top: "38%",
                    bottom: "42%",
                  }}
                >
                  {r.logo ? (
                    <Image
                      src={r.logo}
                      alt=""
                      width={64}
                      height={64}
                      /* The optimizer refuses SVG unless `dangerouslyAllowSVG`
                         is set, and it answers 400 rather than falling through,
                         so an SVG logo renders as nothing at all. Vector art
                         has nothing to gain from resizing anyway. */
                      unoptimized={r.logo.endsWith(".svg")}
                      /* Flattened to a solid dark mark, which is how one colour
                         gets printed on a light bag. `brightness-0` rather than
                         greyscale alone: greyscale keeps a pale logo pale, and
                         a pale mark on a white bag is no mark at all. The
                         previous bag was dark, so this was `grayscale invert`
                         to print white. */
                      className={cn(
                        "h-full w-full object-contain brightness-0 transition-opacity duration-base ease-out",
                        selected ? "opacity-95" : "opacity-50"
                      )}
                    />
                  ) : (
                    <span
                      /* Dark in both themes, because the bag is an image and
                         stays white in both. `text-foreground dark:text-background`
                         reads oddly but is the pair that means "near-black
                         either way" in these tokens. */
                      className={cn(
                        "font-mono text-2xs text-foreground transition-opacity duration-base ease-out dark:text-background",
                        selected ? "opacity-95" : "opacity-50"
                      )}
                    >
                      {roasterInitials(r.name)}
                    </span>
                  )}
                </span>
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

      {/* `tabIndex={0}` because three of the four panels contain no focusable
          element, so without it a keyboard user tabbing off the chips skips
          the content region entirely. */}
      <div
        id="roaster-panel"
        role="tabpanel"
        aria-labelledby={`roaster-tab-${current.slug}`}
        tabIndex={0}
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
