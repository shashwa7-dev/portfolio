"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Download, Pencil, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { ISSUES } from "@/lib/card/issues";
import { isPerfect, issueFromTotal, pipTotal } from "@/lib/card/dice";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import { CARD_FONTS } from "@/lib/card/fonts";
import { startPrintReveal, parsePrintDuration, prefersReducedMotion } from "@/lib/card/reveal";
import { FULL_REVEAL, SHORT_REVEAL, type RevealTimeline } from "@/lib/card/revealSequence";
import {
  CARD_FADE_EASE,
  CARD_RISE_EASE,
  CARD_RISE_FROM,
  CARD_RISE_TO,
  DECK_OFFSET_BACK,
  DECK_OFFSET_FRONT,
  itemVariants,
} from "@/lib/motionVariants";
import DiceRoller from "@/components/card/DiceRoller";
import PlaceholderCard from "@/components/card/PlaceholderCard";
import Pips from "@/components/card/dice/Pips";
import { useSoundPreference } from "@/components/card/dice/soundPreference";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CardData, Roll, RollSet } from "@/lib/card/types";

const KEY = "shashwa7:visitor-id";
const MARK_SRC = "/brand-mark.png";

/** The four header actions, grouped into one toolbar (see the band below).
 *  Visually `h-8 w-8` (32px), not the 44px WCAG 2.5.5 wants: `before:-inset-1.5`
 *  extends the actual hit area 6px past every edge (32 + 6 + 6 = 44) without
 *  costing any layout width, so four of these plus the roll history still fit
 *  a 320px viewport (see the report's arithmetic). `relative` is load-bearing:
 *  the pseudo-element positions against this box, not the toolbar around it. */
const TOOLBAR_BUTTON =
  "relative flex h-8 w-8 items-center justify-center rounded-md text-subtle transition-colors duration-base ease-out before:absolute before:-inset-1.5 before:content-[''] hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The card's on-stage preview size. Independent of CARD_W/CARD_H, the
 *  resolution `download()` and the print reveal actually draw at: this is
 *  only the CSS box the canvas occupies inside the reserved slot. Still
 *  exactly 4:5, same as CARD_W/CARD_H: drawTicket derives every coordinate
 *  as a fraction of the box it is handed, so any other ratio distorts it. */
const SLOT_CARD_W = 280;
const SLOT_CARD_H = 350;

function today(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

/** RollPill's caption once a card exists: the issue, its odds, and what it
 *  took to earn it. A perfect 36 (double six, three times) gets a line of
 *  its own, since the running total alone doesn't say how it happened. */
function buildIssueCaption(data: CardData): string {
  const total = pipTotal(data.roll);
  const line = `${data.issue.name} · ${data.issue.label} per roll · rolled ${total}`;
  return isPerfect(data.roll) ? `${line}, a perfect double six three times` : line;
}

export default function CardMinter({
  origin,
  city,
}: {
  origin: string | null;
  city: string | null;
}) {
  const { muted, toggle: toggleMuted } = useSoundPreference();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [name, setName] = useState("Visitor");
  const [fontsReady, setFontsReady] = useState(false);
  const [markReady, setMarkReady] = useState(false);
  // True only while the one-time print reveal is running, so the name field
  // (see the note above the <input> below) can disable itself for that
  // stretch instead of racing a redraw against the reveal.
  const [revealing, setRevealing] = useState(false);
  const [roll, setRoll] = useState<RollSet | null>(null);
  // Controls the card's CSS rise out of the deck. Independent of `roll`:
  // rolling again drops this to false first, and `roll` itself only clears
  // once `riseMs` has elapsed (see handleRollAgain below). On the visitor's
  // first card riseMs is FULL_REVEAL's real 500ms, so the old card visibly
  // slides back into the deck before the slot goes blank. On every re-roll
  // after that riseMs is SHORT_REVEAL's near-instant duration (see the note
  // below), so there is no transition to see: the card simply disappears
  // and the slot is blank on the next frame.
  const [cardShown, setCardShown] = useState(false);
  // The rise's actual CSS transition duration, read from whichever variant
  // is currently in play (see the reveal effect below). Not a flat
  // constant: SHORT_REVEAL's cardRise.duration is near-instant on purpose,
  // and hard-coding FULL_REVEAL's 500ms here would always play the full
  // rise regardless of variant, leaving the print underway (and, on
  // SHORT_REVEAL, well past the portrait) while the card was still moving.
  // This number does double duty (both "how long to wait before touching
  // the canvas" and "the CSS transition's own duration"), which is why
  // SHORT_REVEAL's ABSENT placeholder has to be a hair above zero rather
  // than exactly zero: see revealSequence.ts.
  const [riseMs, setRiseMs] = useState<number>(FULL_REVEAL.cardRise.duration);
  // RollPill's caption once the print has finished. Also doubles as the
  // "has a card been revealed" flag the pill's label reads: null means
  // "Roll", set means "Roll again".
  const [issueCaption, setIssueCaption] = useState<string | null>(null);
  // Mirrors useDiceRoll's own `rolls`, handed up through DiceRoller's
  // onRollsChange (see that file): the hook lives inside whichever skin is
  // mounted, so this is the one path CardMinter has to the throws recorded
  // so far. Purely a render source for the history strip; nothing here
  // recomputes or re-records a throw, and it clears to [] for free the
  // moment the hook's own `reset()` does.
  const [rolls, setRolls] = useState<readonly Roll[]>([]);
  // Whether the compact name field is open, overlaid on the stage in place
  // of the edit/download actions. See openEditName and the input below.
  const [editingName, setEditingName] = useState(false);
  // Read once, the same way useDiceRoll reads it: prefersReducedMotion
  // touches `window`, which has no stable value on the server or during the
  // first render. Governs only the history chips' own entrance below.
  const [reducedMotion, setReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLImageElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  // The name as it was the moment Edit was tapped, so Escape can restore it
  // exactly rather than guessing at a previous value from state.
  const nameBeforeEditRef = useRef(name);
  // The reveal plays once per card. Edits to the name afterwards redraw
  // straight to the finished frame: see the effect below. Reset to false
  // when rolling again, so the next card gets its own reveal.
  const revealedOnceRef = useRef(false);
  // Unlike revealedOnceRef, this never resets: it is what picks FULL_REVEAL
  // for a visitor's first completed set ever and SHORT_REVEAL for every
  // re-roll after that, per lib/card/revealSequence.ts.
  const hasEverRevealedRef = useRef(false);
  const rollAgainTimerRef = useRef(0);

  useEffect(() => {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    setVisitorId(id);
  }, []);

  /* Canvas draws text with whatever is loaded at draw time, so it has to wait
     for the two webfonts or the first paint lands in a fallback face. */
  useEffect(() => {
    if (!document.fonts) {
      setFontsReady(true);
      return;
    }
    document.fonts.ready.then(() => setFontsReady(true)).catch(() => setFontsReady(true));
  }, []);

  /* The brand mark is optional: drawTicket accepts mark: null and renders the
     wordmark alone, so a decode failure (missing file, unsupported format,
     slow network) never blocks the card. Loaded once, kept in a ref rather
     than state since the image itself never needs to trigger a re-render. */
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = MARK_SRC;
    img
      .decode()
      .then(() => {
        if (!cancelled) markRef.current = img;
      })
      .catch(() => {
        if (!cancelled) markRef.current = null;
      })
      .finally(() => {
        if (!cancelled) setMarkReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cancels a pending roll-again clear if the visitor navigates away mid
  // slide-out: nothing outlives the component to write to a detached ref.
  useEffect(() => () => window.clearTimeout(rollAgainTimerRef.current), []);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion(window));
  }, []);

  // Focuses (and selects) the name field the moment it opens, so tapping
  // Edit is enough to start typing without a second tap into the field.
  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  const ready = fontsReady && markReady;

  const buildData = useCallback((): CardData | null => {
    if (!visitorId || !roll) return null;
    return {
      visitorId,
      name,
      serial: serialFrom(visitorId),
      issue: ISSUES[issueFromTotal(pipTotal(roll))],
      roll,
      origin,
      city,
      date: today(),
    };
  }, [visitorId, name, origin, city, roll]);

  /* The one moment the rarity system exists for: on the first draw after a
     roll, the finished card rises off the deck blank, lands, and only then
     is it composited onto the visible canvas top to bottom. This is pure
     compositing, not drawing: the finished card is rendered once,
     synchronously, by the same drawTicket the gallery and the download
     button use, to an offscreen canvas; lib/card/reveal.ts only ever blits
     slices of that finished bitmap onto the visible one. drawTicket itself
     never learns the reveal exists, and nothing is drawn to the VISIBLE
     canvas until the rise has had its stage in the timeline: painting it
     any earlier would make the result legible while the card is still
     moving, which is exactly what the rise is supposed to keep secret.

     Redraws after that first reveal (the name field, once it is editable
     again) skip straight to the finished frame: printing again on every
     keystroke would be noise, not a moment. */
  useEffect(() => {
    if (!roll || !ready) return;
    // A fresh roll landing supersedes any pending roll-again clear: nothing
    // couples SETTLE_MS and FULL_REVEAL.cardRise.duration, so a future
    // change to either could otherwise let a stale timer null out this
    // new roll's state moments after it arrives. Enforced here rather than
    // left to the coincidence that they currently happen to both be 500.
    window.clearTimeout(rollAgainTimerRef.current);
    const c = canvasRef.current;
    const data = buildData();
    if (!c || !data) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = c.clientWidth;
    const cssH = (cssW * CARD_H) / CARD_W;
    const pxW = Math.round(cssW * dpr);
    const pxH = Math.round(cssH * dpr);
    c.width = pxW;
    c.height = pxH;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    if (revealedOnceRef.current) {
      ctx.scale(dpr, dpr);
      drawTicket(ctx, data, cssW, cssH, { ...CARD_FONTS, mark: markRef.current });
      return;
    }

    const off = document.createElement("canvas");
    off.width = pxW;
    off.height = pxH;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.scale(dpr, dpr);
    drawTicket(offCtx, data, cssW, cssH, { ...CARD_FONTS, mark: markRef.current });

    const reducedMotion = prefersReducedMotion(window);
    const durationMs = parsePrintDuration(
      getComputedStyle(document.documentElement).getPropertyValue("--duration-print")
    );
    // FULL_REVEAL plays once, on this visitor's first completed set; every
    // re-roll after that gets SHORT_REVEAL, so rolling repeatedly for a
    // rare issue doesn't mean sitting through the card's rise every time.
    const variant: RevealTimeline = hasEverRevealedRef.current ? SHORT_REVEAL : FULL_REVEAL;
    // The component, not the constant, decides how long the rise's own CSS
    // transition runs: see the state's doc above.
    setRiseMs(variant.cardRise.duration);

    let raf1 = 0;
    let raf2 = 0;
    if (reducedMotion) {
      setCardShown(true);
    } else {
      // Mounted (or left) hidden, flipped to shown on a later frame, so the
      // browser actually paints the "before" state and the transition runs
      // instead of the card appearing already at rest.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setCardShown(true));
      });
    }

    let cancelPrint = () => {};
    let captionTimer = 0;

    const printTimer = window.setTimeout(() => {
      if (!reducedMotion) setRevealing(true);
      cancelPrint = startPrintReveal({
        ctx,
        source: off,
        width: pxW,
        height: pxH,
        durationMs,
        reducedMotion,
        onDone: () => {
          revealedOnceRef.current = true;
          hasEverRevealedRef.current = true;
          setRevealing(false);
          const beat = Math.max(
            0,
            variant.issueLine.at - (variant.print.at + variant.print.duration)
          );
          captionTimer = window.setTimeout(() => setIssueCaption(buildIssueCaption(data)), beat);
        },
      });
    }, variant.print.at);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(printTimer);
      window.clearTimeout(captionTimer);
      cancelPrint();
    };
  }, [roll, ready, buildData]);

  const download = useCallback(() => {
    const data = buildData();
    if (!data) return;
    const off = document.createElement("canvas");
    off.width = CARD_W;
    off.height = CARD_H;
    const ctx = off.getContext("2d");
    if (!ctx) return;
    drawTicket(ctx, data, CARD_W, CARD_H, { ...CARD_FONTS, mark: markRef.current });
    off.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shashwa7-visitor-${data.serial}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [buildData]);

  /* Discards the current identity and starts a fresh one: a new
     crypto.randomUUID() overwrites the one thing the portrait, the serial
     and the sticker's shine angle are all hashed from (see serialFrom and
     drawTicket). `roll` is untouched, so the issue stays exactly what the
     dice decided; identity and edition are deliberately orthogonal (see the
     module header of lib/card/dice.ts), and this button only ever writes
     the id side of that pair. The redraw itself is not special-cased here:
     buildData depends on visitorId, so the print-reveal effect below sees a
     new `data` object and repaints, the same path a name edit already takes
     once revealedOnceRef is true, straight to the finished frame with no
     replay of the print animation. The old id is simply gone; nothing reads
     it again, and a card already downloaded under it keeps hashing to the
     same face forever because lib/card/seed.ts never changes. */
  const handleRegenerateIdentity = useCallback(() => {
    const id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
    setVisitorId(id);
  }, []);

  /* Rolling again: cardShown flips to false and the pill's fill drains via
     useDiceRoll's `reset`. Nothing is rolled on the visitor's behalf.
     `roll` itself, and the offscreen clear, wait riseMs before landing, so
     the old (already-seen) card is never cleared out from under a
     transition that is still playing. On the visitor's first card that
     wait is FULL_REVEAL's real 500ms and the card visibly slides back into
     the deck first; on every re-roll after that riseMs is SHORT_REVEAL's
     near-instant duration, so the card just disappears with nothing to
     see, rather than repeating the slide. */
  const handleRollAgain = useCallback(() => {
    setIssueCaption(null);
    setCardShown(false);
    setEditingName(false);
    window.clearTimeout(rollAgainTimerRef.current);
    rollAgainTimerRef.current = window.setTimeout(() => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
      revealedOnceRef.current = false;
      setRoll(null);
      // `riseMs` here, not a flat constant: this clear always tracks
      // whichever rise actually just played (FULL_REVEAL's 500ms on the
      // first card, SHORT_REVEAL's near-instant one on every re-roll
      // after), so the stage never sits with a dismissed card for longer
      // than the rise that dismissed it took.
    }, riseMs);
  }, [riseMs]);

  const data = buildData();

  const openEditName = () => {
    nameBeforeEditRef.current = name;
    setEditingName(true);
  };

  const commitEditName = () => setEditingName(false);

  const cancelEditName = () => {
    setName(nameBeforeEditRef.current);
    setEditingName(false);
  };

  return (
    <div className="mt-8">
      {/* The stage: the card, the header band and the pill sit directly on
          the page now, no boxed panel around them. Still `position:
          relative` so the header band below can anchor to it, and still
          `select-none`: a control surface, not text to select mid-tap. */}
      <div className="relative mx-auto flex w-full max-w-[420px] select-none flex-col items-center">
        {/* The header band: the roll history on the left, edit/download (or
            the name field) on the right, in one `justify-between` row so
            the two groups can never overlap at any width, structurally
            rather than by a padding value tuned to one viewport. Absolutely
            positioned with its own fixed height, occupied whether or not
            the history has any pips in it yet, so nothing below ever moves.
            The card slot's own top margin (below) is what actually reserves
            the clearance for this band, since an absolutely positioned
            element claims no flow height of its own. */}
        <div className="absolute inset-x-0 top-0 flex h-8 items-center justify-between gap-2">
          {/* The roll history: a muted pair of pips per throw recorded so
              far, reading straight from useDiceRoll's own `rolls` (handed up
              through DiceRoller's onRollsChange) rather than a second count
              kept here. No box, no border, no index number: the order
              already says which roll is which, and the aria-live status
              already announces the totals out loud, which is also why this
              is aria-hidden and pointer-events-none. Small and tightly
              spaced so three pairs plus both actions fit well inside a
              320px viewport; see the task report for the arithmetic. */}
          <div
            aria-hidden="true"
            className="pointer-events-none flex shrink-0 items-center gap-3 opacity-60"
          >
            {rolls.map(([a, b], i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial={reducedMotion ? false : "hidden"}
                animate="visible"
                className="flex items-center gap-1"
              >
                <Pips value={a} className="h-3 w-3" />
                <Pips value={b} className="h-3 w-3" />
              </motion.div>
            ))}
          </div>

          {/* Edit, regenerate, download and mute: one grouped toolbar
              rather than four floating glyphs, which is what let a fourth
              control (regenerate) join at all. Four 44px boxes with no
              background and an 8px gap already used all but 16px of a
              320px viewport's ~272px of header width; a fifth-of-that
              fourth button would have overflowed it. `bg-elevated` gives
              the group its own surface (the same token Navbar's own
              control cluster uses) so the tighter `gap-1.5` reads as one
              deliberate control rather than four cramped ones, and
              `TOOLBAR_BUTTON` shrinks each button's own box to 32px
              visually while keeping the 44px tap target WCAG 2.5.5 wants
              via an invisible `before:-inset-1.5` expansion: see that
              constant's own comment for the arithmetic. Edit, regenerate
              and download are rendered (not merely hidden) only once a
              card exists, which keeps them out of the tab order before
              then; mute is not card-gated, since the dice (and their
              sound) are there from the start. Hidden as a group only
              while the name field below is open, so the field gets the
              row to itself rather than squeezing past a fourth button
              too. Every action gets a `Tooltip` (the app's one
              `TooltipProvider` is mounted globally in app/layout.tsx);
              the `aria-label`s underneath are unchanged, since a tooltip
              only reaches pointers and is not an accessible name. */}
          {!editingName && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-elevated p-1">
              {roll && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={openEditName}
                        aria-label="Edit the name on the card"
                        className={TOOLBAR_BUTTON}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Edit name</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleRegenerateIdentity}
                        aria-label="Start over with a new portrait and serial"
                        className={TOOLBAR_BUTTON}
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    {/* Plainly what it costs, not "regenerate if you don't
                        like it": someone who has been rolling for a rare
                        issue should know the serial goes with the face. */}
                    <TooltipContent>
                      Replaces your portrait and serial. Cannot be undone.
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={download}
                        aria-label="Download the card as a PNG"
                        className={TOOLBAR_BUTTON}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download PNG</TooltipContent>
                  </Tooltip>
                </>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleMuted}
                    aria-label={muted ? "Unmute the dice" : "Mute the dice"}
                    aria-pressed={muted}
                    className={TOOLBAR_BUTTON}
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{muted ? "Unmute dice" : "Mute dice"}</TooltipContent>
              </Tooltip>
            </div>
          )}

          {roll && editingName && (
            // min-w-0 lets this shrink below its content's natural width
            // instead of forcing the row to overflow; max-w-[160px] stops
            // it stretching further than a name needs once the history
            // group is small (0 or 1 pair). It still shrinks with the
            // history at three pairs, which is exactly the width the row
            // has to spare at that moment: see the task report.
            <div className="min-w-0 max-w-[160px] flex-1">
              {/* Disabled for the ~900ms the print reveal is running, rather
                  than letting a redraw cancel and jump ahead: the reveal only
                  ever plays once per card, right after it prints, so the
                  field is unusable for less than a second and never fights
                  the animation for the canvas. */}
              <input
                ref={nameInputRef}
                value={name}
                maxLength={18}
                disabled={revealing}
                aria-label="Name on the card"
                onChange={(e) => setName(e.target.value)}
                onBlur={commitEditName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  } else if (e.key === "Escape") {
                    cancelEditName();
                  }
                }}
                className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* mt-12 clears the header band (its 32px, plus room to breathe)
            without needing the band to claim any flow height itself. Below
            this, the gap to the pill is whatever DiceRoller's own `mt-8`
            gives it in natural flow, not a `justify-between` spread across
            a fixed-height panel: that used to leave roughly 150px of dead
            air between the card and the pill.

            The slot's own height is SLOT_CARD_H (350) exactly, matching the
            canvas it centers, rather than the 380px this used to be: that
            extra 30px was slack nothing needed, and it widened the visible
            gap to the pill from 32px (DiceRoller's own margin) to 47px. The
            deck cards behind the canvas still rotate past this box on their
            lower corner (DECK_OFFSET_BACK's 8px translate plus its 3deg
            rotation puts that corner ~15px below the canvas's own edge, the
            most any deck offset extends past it), but nothing here clips:
            this div has no `overflow-hidden`, and that corner still lands
            ~17px clear of the pill below. */}
        <div className="relative mt-12 flex h-[350px] w-full items-center justify-center">
          {/* The deck: two idle cards, always present, so the slot never
              looks empty before a roll. The back one is a plain bordered
              rectangle at the card's own aspect ratio, offset and rotated
              per the reference. The front one is the reserved slot's own
              stand-in: PlaceholderCard sketches a stamp, a scribble where
              the portrait goes, a wavy name and a torn stub, all in the
              real card's own proportions, so the slot reads as "a card is
              coming" instead of an empty box. It costs no layout shift when
              the real card arrives: it never mounts or unmounts, and the
              printed canvas (same size, same position, opaque from its
              first fillRect) simply paints over it top to bottom during the
              reveal, the same way it already covered this plain rectangle
              before the sketch existed. */}
          {/* inset-0 m-auto, not the flex parent's centering: an absolutely
              positioned box is out of flow, so justify-content/align-items
              on the parent above never reaches it. Auto margins on a fixed
              size box with every inset at 0 is what actually centers it. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 m-auto rounded-2xl border border-border bg-card"
            style={{ width: SLOT_CARD_W, height: SLOT_CARD_H, transform: DECK_OFFSET_BACK }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 m-auto overflow-hidden rounded-2xl border border-border bg-card"
            style={{ width: SLOT_CARD_W, height: SLOT_CARD_H, transform: DECK_OFFSET_FRONT }}
          >
            <PlaceholderCard width={SLOT_CARD_W} height={SLOT_CARD_H} />
          </div>
          {/* The card itself. Transparent where the tear-line holes are cut
              with destination-out, so the deck card directly behind it
              shows through those cuts once it has printed. */}
          <canvas
            ref={canvasRef}
            className="relative rounded-2xl"
            style={{
              width: SLOT_CARD_W,
              height: SLOT_CARD_H,
              opacity: cardShown ? 1 : 0,
              transform: cardShown ? CARD_RISE_TO : CARD_RISE_FROM,
              transition: `opacity ${riseMs}ms ${CARD_FADE_EASE}, transform ${riseMs}ms ${CARD_RISE_EASE}`,
            }}
            role="img"
            aria-label={
              data
                ? `A ${data.issue.name} visitor card, serial ${data.serial}, issued to ${data.name}, from a roll of ${pipTotal(data.roll)}.`
                : "The card's reserved space. It rises here once you roll three times."
            }
          />
        </div>

        <DiceRoller
          onComplete={setRoll}
          issueCaption={issueCaption}
          onRollAgain={handleRollAgain}
          onRollsChange={setRolls}
        />
      </div>
    </div>
  );
}
