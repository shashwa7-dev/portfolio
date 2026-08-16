"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TocSection = { id: string; label: string };

/**
 * A table of contents pinned to the right of the viewport, collapsed to a
 * column of rules until you approach it.
 *
 * Collapsed by default because a long read already has one column of text and a
 * permanent second column of links competes with it. Ticks give you position
 * and length at a glance, which is most of what a table of contents is for, and
 * the labels arrive when you actually reach for them.
 *
 * Desktop only. Below `xl` there is no gutter to put it in without either
 * overlapping the text or squeezing the measure, and a phone already has a
 * scrollbar for position.
 */
export default function StickyScrollSpyTOC({
  sections,
  className,
}: {
  sections: TocSection[];
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  /** Kept in a ref rather than state: it changes on every scroll frame and
   *  nothing renders from it directly. */
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (sections.length === 0) return;

    // Copied into the effect rather than read through the ref in cleanup: the
    // ref could point at a different Set by teardown, and this way the effect
    // only ever touches the one it set up with.
    const seen = visible.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }
        // First in document order, not first reported: entries arrive in
        // whatever order the observer batched them, so trusting that ordering
        // makes the highlight flicker between neighbours on a fast scroll.
        const current = sections.find((s) => seen.has(s.id));
        if (current) setActive(current.id);
      },
      {
        /* A band near the top of the viewport rather than the whole of it. The
           top inset clears the sticky header; the bottom one stops a heading
           counting as current while it is still down by the fold. */
        rootMargin: "-88px 0px -55% 0px",
        threshold: 0,
      }
    );

    const observed = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    observed.forEach((el) => observer.observe(el));

    /* The band can be empty: between two short sections, and at the very
       bottom where the last heading has already scrolled above it. Falling back
       to the last heading passed keeps the marker from sticking on whatever was
       current several screens ago. */
    const onScroll = () => {
      if (seen.size > 0) return;
      const passed = observed.filter(
        (el) => el.getBoundingClientRect().top <= 88
      );
      const last = passed[passed.length - 1];
      setActive(last ? last.id : null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      seen.clear();
    };
  }, [sections]);

  if (sections.length === 0) return null;

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return; // let the browser follow the href instead
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    // Move the keyboard caret too, so the next Tab continues from the section
    // rather than from the link. `preventScroll` because the line above owns
    // the scrolling, and focus would otherwise jump it there instantly.
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      aria-label="On this page"
      /* `group` drives the expansion. `focus-within` is in there with `hover`
         so tabbing into it reveals the labels: without that a keyboard user
         moves through links they cannot read. */
      className={cn(
        "group fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block",
        className
      )}
    >
      <ul className="flex flex-col gap-1">
        {sections.map((s) => {
          const current = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => go(e, s.id)}
                aria-current={current ? "location" : undefined}
                className="flex items-center justify-end gap-3 rounded py-1 pl-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* The expanded width is capped to the gutter, not to the
                    label. Both routes that use this set a 760px column, so at
                    the xl breakpoint there are 236px between the column and the
                    right edge; a wider panel would open on top of the text it
                    is indexing. 2xl has room for the whole label, so it gets
                    it, and anything longer truncates rather than pushing left.
                    `title` carries the full text either way. */}
                <span
                  title={s.label}
                  className={cn(
                    "max-w-0 truncate text-right text-xs opacity-0",
                    "transition-[max-width,opacity] duration-base ease-out motion-reduce:transition-none",
                    "group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-within:max-w-[10rem] group-focus-within:opacity-100",
                    "2xl:group-hover:max-w-[15rem] 2xl:group-focus-within:max-w-[15rem]",
                    current ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
                {/* The rule is the control at rest. The current one is longer
                    as well as darker, so position survives a screenshot in
                    greyscale and does not rely on colour alone. */}
                <span
                  aria-hidden
                  className={cn(
                    "h-px shrink-0 transition-[width,background-color] duration-base ease-out motion-reduce:transition-none",
                    current
                      ? "w-6 bg-foreground"
                      : "w-3 bg-border-strong group-hover:bg-muted-foreground"
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
