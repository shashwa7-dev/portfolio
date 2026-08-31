"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { ISSUES } from "@/lib/card/issues";
import { specimenData } from "@/lib/card/specimens";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import { CARD_FONTS } from "@/lib/card/fonts";
import { backdropFadeVariants, layoutMorph } from "@/lib/motionVariants";
import type { CardData, IssueKey } from "@/lib/card/types";

/**
 * The five issues as a rarity table, rarest first, each row showing the card
 * it produces. Clicking one opens it large.
 *
 * This replaced a grid of five specimens drawn at roughly 230px each, which
 * left the plate detail too small to read and stranded two cards on a ragged
 * `md:grid-cols-3` row. The cards are back, but as thumbnails beside the
 * thing that actually differs between issues: what each one changes, what
 * you have to roll for it, and how often that lands. The detail lives in the
 * zoom, where there is room for it.
 *
 * Every number is read from `ISSUES`, which reads them from the counted 6d6
 * distribution in `lib/card/dice.ts`. Nothing here is typed by hand, so a
 * band that changes cannot leave this table stating the old odds.
 */

const MARK_SRC = "/brand-mark.png";

/**
 * Each card is drawn once, at a size big enough for the zoom, into an
 * offscreen canvas. The thumbnail and the overlay are both `drawImage` blits
 * of that one master.
 *
 * This is the whole reason the cards can come back. `drawTicket` hands the
 * portrait engine `CARD_W` whatever the display size, so the engine does its
 * full generative work on every call: drawing a thumbnail and then a zoom
 * would pay that twice per issue, and re-opening a zoom would pay it again.
 * Blitting costs nothing after the first draw, so five issues cost five
 * draws for the life of the page, and opening a card is instant.
 *
 * 720px wide covers a 360px overlay on a 2x display. Above that the blit is
 * upscaling, which is why the overlay is capped below it.
 */
const MASTER_W = 720;
const MASTER_H = Math.round((MASTER_W * CARD_H) / CARD_W);

/**
 * What each issue changes about the card, checked against `drawTicket`
 * rather than written from the names. Misprint really does print the inner
 * rule and the portrait twice out of register; First day really does swap
 * the postmark's legend and ink to teal; Inverted really does turn the
 * portrait over. A sixth issue that changed nothing but a colour would have
 * no true line to write here, which is the test for whether it earns a name.
 */
const CHANGES: Record<IssueKey, string> = {
  inverted: "The portrait prints upside down, on black stock",
  misprint: "The plate slips: rule and portrait print twice, off register",
  firstDay: "A first-day postmark, cancelled in teal",
  commemorative: "A commemorative overprint struck across the face",
  definitive: "The standard issue, no overprint",
};

/** Rarest first, sorted by the real per-roll chance rather than a hand-kept
 *  order, so the ladder cannot disagree with the numbers in it. */
const LADDER = Object.values(ISSUES).sort((a, b) => a.chance - b.chance);

/** Identifies a drawing for the cache. The visitor's own card changes when
 *  they rename it, re-roll it or regenerate the portrait, and each of those
 *  has to invalidate; a specimen never changes at all. */
function cacheKey(key: IssueKey, own: CardData | null): string {
  if (!own) return key;
  return `own:${own.visitorId}:${own.serial}:${own.name}:${own.issue.key}:${own.roll
    .flat()
    .join("")}`;
}

/** Blits a master canvas into a visible one at the width it is given. */
function CardBlit({
  master,
  className,
  label,
}: {
  master: HTMLCanvasElement | null;
  className: string;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || !master) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = c.clientWidth;
    if (!cssW) return;
    c.width = Math.round(cssW * dpr);
    c.height = Math.round(((cssW * CARD_H) / CARD_W) * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(master, 0, 0, c.width, c.height);
  }, [master]);

  return (
    <canvas ref={ref} className={className} role="img" aria-label={label} />
  );
}

export default function IssueLadder({ card }: { card: CardData | null }) {
  const [ready, setReady] = useState(false);
  const [zoomed, setZoomed] = useState<IssueKey | null>(null);
  const markRef = useRef<HTMLImageElement | null>(null);
  const masters = useRef(new Map<string, HTMLCanvasElement>());
  /* Bumped after a draw so the blits re-run: the cache lives in a ref, which
     does not trigger a render on its own. */
  const [drawn, setDrawn] = useState(0);
  /* The control that opened the overlay, so focus goes back where it was. */
  const opener = useRef<HTMLElement | null>(null);

  /* Canvas draws text in whatever face is loaded at draw time, so nothing can
     be drawn before the webfonts and the brand mark have settled. Loaded once
     and shared across all five. A decode failure still draws, with mark null. */
  useEffect(() => {
    let cancelled = false;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const img = new Image();
    img.src = MARK_SRC;
    const markReady = img
      .decode()
      .then(() => {
        if (!cancelled) markRef.current = img;
      })
      .catch(() => {
        if (!cancelled) markRef.current = null;
      });
    Promise.all([fontsReady, markReady]).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const masterFor = useCallback(
    (key: IssueKey, own: CardData | null): HTMLCanvasElement | null => {
      if (!ready) return null;
      const id = cacheKey(key, own);
      const hit = masters.current.get(id);
      if (hit) return hit;
      const off = document.createElement("canvas");
      off.width = MASTER_W;
      off.height = MASTER_H;
      const ctx = off.getContext("2d");
      if (!ctx) return null;
      // Drawn in the export's own coordinate space and scaled, so the
      // portrait engine's size-derived DETAIL and K match what a download
      // produces. Same fix as CardMinter's visible canvas.
      ctx.scale(MASTER_W / CARD_W, MASTER_H / CARD_H);
      drawTicket(ctx, own ?? specimenData(key), CARD_W, CARD_H, {
        ...CARD_FONTS,
        mark: markRef.current,
      });
      // Only ever one of the visitor's own card in here. The key carries
      // their name, serial and roll, so every re-roll, rename and portrait
      // regeneration mints a new entry, and a 720x900 canvas is around
      // 2.6MB of pixel data. Rolling is the thing this page invites you to
      // do repeatedly, so without this the cache grows by a few megabytes
      // per throw and never gives any of it back. The five specimens never
      // change and are never evicted.
      if (own) {
        const stale: string[] = [];
        masters.current.forEach((_, k) => {
          if (k.startsWith("own:")) stale.push(k);
        });
        stale.forEach((k) => masters.current.delete(k));
      }
      masters.current.set(id, off);
      return off;
    },
    [ready]
  );

  /* Draw all five once the fonts land, and redraw the visitor's own row when
     their card changes. Everything else is served from the cache. */
  useEffect(() => {
    if (!ready) return;
    for (const issue of LADDER) {
      masterFor(issue.key, card && card.issue.key === issue.key ? card : null);
    }
    setDrawn((n) => n + 1);
  }, [ready, card, masterFor]);

  const close = useCallback(() => {
    setZoomed(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, close]);

  const ownFor = (key: IssueKey) =>
    card && card.issue.key === key ? card : null;

  const zoomIssue = zoomed ? ISSUES[zoomed] : null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        What you are rolling for
      </h2>
      <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">
        Six dice, thrown three times. What they add up to decides which issue
        your card prints on. The odds are per roll, not a share of cards, and
        you can roll as many times as you like.
      </p>

      <ul className="mt-6">
        {LADDER.map((issue) => {
          const own = ownFor(issue.key);
          const mine = own !== null;
          return (
            <li
              key={issue.key}
              // `aria-current`, not a colour alone: the row for the card a
              // visitor is holding is genuinely the current one, and a
              // background change says nothing to a screen reader.
              aria-current={mine ? "true" : undefined}
              // No radius. The rows carry a bottom rule, and a rounded
              // corner pulls that line away from the row's own edges, which
              // reads as a detached tab rather than as a table.
              className={`relative grid grid-cols-[44px_1fr] items-start gap-x-3.5 border-b border-border px-2 py-3.5 last:border-b-0 sm:px-3 ${
                mine ? "bg-elevated" : ""
              }`}
            >
              {/* The card itself, small. Only this is a button: the text
                  beside it is information, not a control, and making the
                  whole row clickable would give a screen reader one target
                  announcing every column at once. */}
              <button
                type="button"
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  setZoomed(issue.key);
                }}
                aria-label={`Enlarge the ${issue.name} card`}
                className="block w-11 rounded-[3px] transition-transform duration-fast ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {/* The shared-layout source. The overlay carries the same
                    `layoutId`, so opening animates this exact box out to the
                    centre and closing animates it back into the row it came
                    from.

                    Hidden while zoomed: with two elements sharing a
                    layoutId both are laid out, and leaving this one painted
                    shows a second copy in the row underneath the one that
                    just flew out of it. `visibility`, not unmounting, since
                    Framer measures this box to know where to fly back to. */}
                <motion.span
                  layoutId={`issue-card-${issue.key}`}
                  transition={layoutMorph}
                  className="block"
                  style={{ visibility: zoomed === issue.key ? "hidden" : "visible" }}
                >
                  <CardBlit
                    key={drawn}
                    master={masterFor(issue.key, own)}
                    className="block w-full rounded-[3px] shadow-sm ring-1 ring-border-strong"
                    label={
                      mine
                        ? `Your ${issue.name} card`
                        : `Example of a ${issue.name} card`
                    }
                  />
                </motion.span>
              </button>

              <div className="min-w-0">
                {/* Name and odds on one baseline, the way a list of prices
                    reads. The percentage is the number a visitor is actually
                    weighing, so it gets the end of the line rather than a
                    column of its own; `shrink-0` keeps it there when the
                    name is long. */}
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {issue.name}
                    {mine && (
                      <span className="ml-2 font-mono text-2xs uppercase tracking-label text-subtle">
                        yours
                      </span>
                    )}
                  </p>
                  <p className="shrink-0 font-mono text-2xs uppercase tracking-label text-foreground">
                    {issue.label}
                    <span className="ml-1 text-subtle">per roll</span>
                  </p>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {CHANGES[issue.key]}
                </p>

                {/* What to roll for it. Quiet, because it is the answer to a
                    question asked second: a visitor reads the odds to decide
                    whether they want it, and this only afterwards. */}
                <p className="mt-1.5 font-mono text-2xs uppercase tracking-label text-subtle">
                  Totals {issue.range[0]} to {issue.range[1]}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* The zoom target. The container is always mounted and inert
          (`pointer-events-none`, nothing inside it when closed) rather than
          rendered with the overlay: it is what centres the card, and Framer
          needs the destination box to exist to animate a shared layout into
          it. An unmounted parent would also take the exit animation down
          with it the moment the card closes.

          Centring is flexbox, deliberately, not `left-1/2` with a
          `-translate-x-1/2`. A layout animation drives `transform`, so a
          transform of our own on the same element is overwritten mid-flight
          and the card lands off-centre. */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-6">
        <AnimatePresence>
          {zoomIssue && (
            <>
              <motion.div
                key="backdrop"
                variants={backdropFadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={close}
                className="pointer-events-auto absolute inset-0 bg-background/85 backdrop-blur-sm"
                aria-hidden="true"
              />

              <motion.div
                key="panel"
                role="dialog"
                aria-modal="true"
                aria-label={`${zoomIssue.name} card, enlarged`}
                className="pointer-events-auto relative flex w-full max-w-[340px] flex-col items-center"
              >
                {/* Only the card carries the layoutId, so only the card
                    morphs. The caption under it fades on its own: stretching
                    a line of type from thumbnail width to full width is the
                    part of a shared-layout transition that always looks
                    wrong. */}
                {/* Both ends of the pair carry the same transition: Framer
                    reads it from whichever element leads the animation, and
                    that is the thumbnail on the way out and the overlay on
                    the way back. Set on one only, the return trip falls back
                    to the default spring. */}
                <motion.div
                  layoutId={`issue-card-${zoomed}`}
                  transition={layoutMorph}
                  className="w-full"
                >
                  <CardBlit
                    key={`zoom-${zoomed}-${drawn}`}
                    master={masterFor(zoomIssue.key, ownFor(zoomIssue.key))}
                    className="block w-full rounded-2xl shadow-2xl ring-1 ring-border-strong"
                    label={`${zoomIssue.name} card, enlarged`}
                  />
                </motion.div>

                <motion.div
                  variants={backdropFadeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="mt-4 text-center"
                >
                  <p className="font-mono text-2xs uppercase tracking-label text-subtle">
                    {zoomIssue.range[0]}&ndash;{zoomIssue.range[1]} &middot;{" "}
                    {zoomIssue.label} per roll
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {CHANGES[zoomIssue.key]}
                  </p>
                </motion.div>
              </motion.div>

              {/* Pinned to the viewport rather than to the card, so it does
                  not ride the morph. */}
              <motion.button
                key="close"
                type="button"
                variants={backdropFadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={close}
                autoFocus
                aria-label="Close"
                className="pointer-events-auto absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-elevated text-muted-foreground ring-1 ring-border-strong transition-colors duration-fast ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
