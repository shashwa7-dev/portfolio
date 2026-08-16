"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { blurSwapVariants, duration, ease } from "@/lib/motionVariants";
import { goToSection, type TocSection } from "@/app/hooks/useActiveSection";

/**
 * The small-screen half of the table of contents: a pill at the bottom that
 * opens a sheet of chapters.
 *
 * The rail the desktop uses needs a gutter to live in, and a phone has none. A
 * pill costs one line at the bottom of the screen, which is the one place on a
 * phone that is always reachable with a thumb.
 */
export default function MobileChapters({
  sections,
  active,
}: {
  sections: TocSection[];
  active: string | null;
}) {
  const [open, setOpen] = useState(false);
  /** Whether the sheet has been opened at least once, so closing it on first
   *  render does not steal focus from wherever the reader actually is. */
  const opened = useRef(false);
  const pillRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const index = sections.findIndex((s) => s.id === active);
  // Before the first heading scrolls in there is no current chapter, and
  // showing "0" would be wrong while showing the first would be a lie. The pill
  // reads as chapter one, unfilled.
  const position = index < 0 ? 0 : index + 1;
  const current = index < 0 ? sections[0] : sections[index];

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      /* `aria-modal` promises the rest of the page is unreachable, and nothing
         here is `inert`, so Tab is wrapped by hand. Without it the next Tab
         out of the sheet walks into the article still sitting behind it. */
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusable = sheet.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === sheet)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    /* The sheet scrolls internally, so the page behind it must not.
       `overflow: hidden` on the body is ignored by iOS Safari, which is the
       platform this component exists for, so the body is pinned and the
       position restored on close. `overscroll-contain` on the list handles a
       flick past its own end; this handles a drag started anywhere else. */
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    sheetRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      Object.assign(document.body.style, previous);
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  /* Focus goes back to the pill when the sheet closes, so dismissing it with
     Escape does not drop the caret at the top of the document. Skipped when a
     chapter was picked: that hands focus to the section instead. */
  const returnFocus = useRef(true);
  useEffect(() => {
    if (open) {
      opened.current = true;
      returnFocus.current = true;
      return;
    }
    if (opened.current && returnFocus.current) pillRef.current?.focus();
  }, [open]);

  /**
   * Picking a chapter cannot scroll straight away.
   *
   * While the sheet is open the body is pinned by the scroll lock, so a
   * `scrollIntoView` fired from the click moves nothing, and the lock's cleanup
   * then restores the old position on top of it. The reader gets the sheet
   * closing and the page exactly where it was.
   *
   * So the target is parked here and taken in the effect below, which React
   * runs after the lock has been undone.
   */
  const pending = useRef<string | null>(null);

  const pick = (id: string) => {
    returnFocus.current = false;
    pending.current = id;
    setOpen(false);
  };

  useEffect(() => {
    if (open) return;
    const id = pending.current;
    if (!id) return;
    pending.current = null;
    goToSection(id);
  }, [open]);

  return (
    <div className="xl:hidden">
      {/* `layout="size"` is what makes the width change smoothly. The pill is
          sized by its label, and a label swap is a layout change, which is not
          something a CSS transition can interpolate: `width: auto` has no two
          values to move between.

          Size and not position, deliberately. Layout animation measures in
          page coordinates, and the scroll lock pins the body, so closing the
          sheet changes this element's page position by a whole scroll offset
          while its position on screen does not move at all. Plain `layout`
          read that as travel and flew the pill in from the top of the
          document every time. */}
      {/* Centred by a flex parent rather than by `-translate-x-1/2`. A layout
          animation drives `transform` itself, so a translate used for centring
          gets overwritten mid-animation and the pill slides off to the left.
          The wrapper takes no pointer events, or it would cover the width of
          the page along the bottom. */}
      {/* `bottom` clears the home indicator on a notched phone, where a flat
          `bottom-4` lands inside it. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-6">
      <motion.button
        ref={pillRef}
        type="button"
        layout="size"
        transition={{ duration: duration.base, ease: ease.out }}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="chapter-sheet"
        /* `opacity-0` hides it from the eye and not from the keyboard, so
           while the sheet is open Tab would otherwise land on an invisible
           button sitting behind the scrim. */
        tabIndex={open ? -1 : 0}
        aria-hidden={open}
        /* `max-w-full` against the wrapper's padding is what stops a long
           chapter name stretching this to the edges; the label truncates. */
        className={cn(
          "pointer-events-auto flex max-w-full items-center gap-2.5",
          "rounded-full border border-border bg-elevated/90 py-2 pl-2 pr-3.5 shadow-lg backdrop-blur-md",
          "transition-[opacity] duration-base ease-out motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "pointer-events-none opacity-0"
        )}
      >
        <ProgressRing position={position} total={sections.length} />
        {/* `popLayout` takes the outgoing label out of flow as it leaves, so
            the incoming one is not pushed sideways by a word that is already
            on its way out. `initial={false}` keeps the first paint still
            rather than blurring in on load. */}
        <span className="min-w-0 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current?.id ?? "none"}
              variants={blurSwapVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="block truncate whitespace-nowrap text-xs font-medium text-foreground"
            >
              {current?.label}
            </motion.span>
          </AnimatePresence>
        </span>
        <ChevronUp aria-hidden className="h-3.5 w-3.5 shrink-0 text-subtle" />
      </motion.button>
      </div>

      {/* Kept mounted so it can animate both ways. `invisible` rather than
          `hidden` because it still removes the contents from the tab order,
          but unlike `display: none` it can be transitioned. */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 overscroll-contain bg-background/70 backdrop-blur-sm",
          "transition-[opacity,visibility] duration-base ease-out motion-reduce:transition-none",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      />

      <div
        id="chapter-sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chapters"
        tabIndex={-1}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card outline-none",
          "transition-[transform,visibility] duration-base ease-out motion-reduce:transition-none",
          open ? "visible translate-y-0" : "invisible translate-y-full"
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
          <p className="font-mono text-2xs uppercase tracking-label text-subtle">
            {position > 0
              ? `Chapter ${position} of ${sections.length}`
              : `${sections.length} chapters`}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chapters"
            className="-mr-1.5 rounded-full p-1.5 text-subtle transition-colors duration-fast ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        {/* Capped and scrolled internally: at fifteen chapters an uncapped
            sheet covers the article completely, and `dvh` so an iOS toolbar
            appearing does not push the last row under the fold. */}
        <ul className="max-h-[60dvh] overflow-y-auto overscroll-contain px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {sections.map((s, i) => {
            const isCurrent = s.id === active;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pick(s.id)}
                  aria-current={isCurrent ? "location" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                    "transition-colors duration-fast ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isCurrent ? "bg-elevated" : "hover:bg-elevated/60"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 shrink-0 font-mono text-2xs tabular-nums",
                      isCurrent ? "text-foreground" : "text-subtle"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm",
                      isCurrent
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * The chapter number inside a ring that fills as you go.
 *
 * Drawn with `stroke-dasharray` on a circle rather than with a conic gradient,
 * because a gradient cannot be given a round cap and the join at 0% shows as a
 * hard seam. The ring is rotated so it starts at twelve o'clock.
 */
function ProgressRing({ position, total }: { position: number; total: number }) {
  const r = 11;
  const circumference = 2 * Math.PI * r;
  const fraction = total > 0 ? position / total : 0;

  return (
    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      <svg viewBox="0 0 28 28" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          strokeWidth="2"
          className="stroke-border-strong"
        />
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="stroke-foreground transition-[stroke-dashoffset] duration-base ease-out motion-reduce:transition-none"
        />
      </svg>
      <span className="font-mono text-2xs tabular-nums text-foreground">
        {position > 0 ? position : 1}
      </span>
    </span>
  );
}
