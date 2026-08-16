"use client";

import { cn } from "@/lib/utils";
import MobileChapters from "@/components/common/MobileChapters";
import {
  goToSection,
  useActiveSection,
  type TocSection,
} from "@/app/hooks/useActiveSection";

export type { TocSection };

/**
 * A table of contents pinned to the right of the viewport, collapsed to a
 * column of rules until you approach it.
 *
 * Collapsed by default because a long read already has one column of text and a
 * permanent second column of links competes with it. Ticks give you position
 * and length at a glance, which is most of what a table of contents is for, and
 * the labels arrive when you actually reach for them.
 *
 * The rail is desktop only: below `xl` there is no gutter to put it in without
 * either overlapping the text or squeezing the measure. Smaller screens get
 * `MobileChapters` instead, a pill at the bottom that opens a sheet. Both read
 * the same `useActiveSection`, so they cannot disagree about where you are.
 */
export default function StickyScrollSpyTOC({
  sections,
  className,
}: {
  sections: TocSection[];
  className?: string;
}) {
  const active = useActiveSection(sections);

  if (sections.length === 0) return null;

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Let the browser follow the href if the section is not on the page.
    if (goToSection(id)) e.preventDefault();
  };

  return (
    <>
    <nav
      aria-label="On this page"
      /* `group` drives the expansion. `focus-within` is in there with `hover`
         so tabbing into it reveals the labels: without that a keyboard user
         moves through links they cannot read. */
      className={cn(
        "group fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block",
        /* Capped and scrolled, like the mobile sheet. Rows grow from 14px to
           24px on hover, so a post with thirty headings expands to 720px and
           pushes its first and last entries off a laptop screen with no way to
           reach them. The scrollbar is hidden because the rules are the
           interface; the overflow is a backstop, not a feature. */
        "max-h-[70vh] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {/* No gap, and the row height is animated rather than fixed.
          Collapsed, this wants to be tight: it is a column of 1px rules and
          spacing them out makes it read as fifteen things rather than one
          scale. It cannot be as tight as it will go, though. At 8px the rules
          crowd into a texture and the current one stops standing out from its
          neighbours, so 14 is the compromise. Expanded it cannot be tight at
          all, because 12px labels in a 14px row would still collide.

          So the pitch itself is part of the expansion. The height also has to
          be explicit: an empty label span still carries its line box, which is
          what was quietly holding every row at 24px no matter what padding
          said. */}
      <ul className="flex flex-col">
        {sections.map((s) => {
          const current = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => go(e, s.id)}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "flex h-3.5 items-center justify-end gap-3 rounded pl-3 outline-none",
                  "transition-[height] duration-base ease-out motion-reduce:transition-none",
                  "group-hover:h-6 group-focus-within:h-6",
                  "focus-visible:ring-2 focus-visible:ring-ring"
                )}
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
                    "max-w-0 truncate text-right text-xs leading-none opacity-0",
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

    <MobileChapters sections={sections} active={active} />
    </>
  );
}
