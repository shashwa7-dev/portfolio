"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Pencil, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { ISSUES } from "@/lib/card/issues";
import { isPerfect, issueFromTotal, pipTotal } from "@/lib/card/dice";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import { CARD_FONTS } from "@/lib/card/fonts";
import { prefersReducedMotion } from "@/lib/card/reveal";
import { EXIT_REVEAL, FULL_REVEAL } from "@/lib/card/revealSequence";
import {
  CARD_FLIP_EASE,
  CARD_FLIP_PERSPECTIVE,
  DECK_OFFSET_BACK,
  DECK_OFFSET_FRONT,
  cardRiseVariants,
  itemVariants,
} from "@/lib/motionVariants";
import DiceRoller from "@/components/card/DiceRoller";
import PlaceholderCard from "@/components/card/PlaceholderCard";
import Pips from "@/components/card/dice/Pips";
import { playChime } from "@/components/card/dice/diceSound";
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
 *  resolution `download()` and the visible canvas actually draw at: this is
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

/** The tweet/share body: names the real issue and its real per-roll odds,
 *  since the specific number is the interesting part and the card already
 *  knows it. `cardUrl` is `${baseUrl}card` (app/sitemap.ts), the same
 *  canonical URL app/card/page.tsx already builds its own metadata from;
 *  it arrives as a prop rather than an import here because app/sitemap.ts
 *  pulls in `getBlogPosts`, which touches Node's `fs` and cannot land in
 *  this "use client" bundle. No em-dash, per the app's copy rule. */
function buildShareText(data: CardData, cardUrl: string): string {
  return `I rolled a ${data.issue.name} visitor card. ${data.issue.label} per roll.\n\nMint your own at ${cardUrl}`;
}

export default function CardMinter({
  origin,
  city,
  cardUrl,
}: {
  origin: string | null;
  city: string | null;
  /** `${baseUrl}card`, computed by the server page and handed down: see
   *  buildShareText's own comment for why this can't just be imported
   *  here. */
  cardUrl: string;
}) {
  const { muted, toggle: toggleMuted } = useSoundPreference();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [name, setName] = useState("Visitor");
  const [fontsReady, setFontsReady] = useState(false);
  const [markReady, setMarkReady] = useState(false);
  // True only while the one-time turn is running, so the name field (see
  // the note above the <input> below) can disable itself for that stretch
  // instead of racing a redraw against the reveal.
  const [revealing, setRevealing] = useState(false);
  const [roll, setRoll] = useState<RollSet | null>(null);
  // Drives the card's `rotateY`: false shows its back (face-down, per the
  // deck it rose from), true shows its printed front. Starts false so a
  // freshly risen card always shows its back first; the reveal effect below
  // flips it once the rise has settled. handleRollAgain drops it back to
  // false to turn the card away again before it leaves; that direction is
  // also how the flip's own CSS transition (in the JSX below) picks its
  // duration, FULL_REVEAL's entering or EXIT_REVEAL's leaving.
  const [flipped, setFlipped] = useState(false);
  // RollPill's caption once the turn has finished. Also doubles as the
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
  // Sequences the exit: handleRollAgain turns the card back to blank first,
  // and only once that has played out (see this ref's own use there, and
  // ExitTimeline's doc in revealSequence.ts for why the order matters) does
  // it null `roll`, which is what actually starts the card sinking away.
  const exitTurnTimerRef = useRef(0);

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

  useEffect(() => {
    setReducedMotion(prefersReducedMotion(window));
  }, []);

  // Cancels a pending exit's turn-then-sink handoff if the visitor
  // navigates away mid-exit: nothing outlives the component to write to a
  // detached ref.
  useEffect(() => () => window.clearTimeout(exitTurnTimerRef.current), []);

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

  /* On every roll landing, the finished card rises off the deck showing its
     back, then turns to face the visitor. The finished card is drawn
     straight to the VISIBLE canvas the instant the roll lands: drawing it
     early is safe because the card's own back face is what keeps it hidden
     (see the JSX below, CARD_FLIP_EASE and backface-visibility: hidden on
     both faces), not the timing of when pixels are painted. `drawTicket`
     itself never learns any of this; it is the same call the gallery and
     the download button use.

     Redraws after the reveal (the name field, once it is editable again)
     skip straight past all of it: printing again on every keystroke would
     be noise, not a moment. The card's own mount and unmount (see the JSX
     below, `roll && ready` inside an `AnimatePresence`) is what gives every
     roll, first or re-, the same full entry: there is no shortened variant
     any more, so this effect never branches on which one it got. */
  useEffect(() => {
    if (!roll || !ready) return;
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

    ctx.scale(dpr, dpr);
    drawTicket(ctx, data, cssW, cssH, { ...CARD_FONTS, mark: markRef.current });

    if (revealedOnceRef.current) {
      // Already revealed for this roll (a name edit, most likely): the
      // redraw above is the whole job, nothing about the turn replays.
      return;
    }

    // A genuine reveal, first roll or a re-roll: fires here, alongside the
    // card's own rise (the AnimatePresence mount that brought this effect's
    // `roll` in the first place), rather than waited out until the flip
    // below finishes. Not gated on reducedMotion below: the mute toggle is
    // the sound's own control, same reasoning as the ticks and the haptics,
    // so both branches get the chime.
    playChime();

    const reducedMotion = prefersReducedMotion(window);

    if (reducedMotion) {
      // No rise, no turn: the card appears face-up in place. `motion`'s own
      // `MotionConfig reducedMotion="user"` (app/layout.tsx) already collapses
      // the rise's mount to instant; this only has to do the same for the
      // turn, which is plain CSS and outside MotionConfig's reach.
      setFlipped(true);
      revealedOnceRef.current = true;
      setIssueCaption(buildIssueCaption(data));
      return;
    }

    // Back-side-out, whatever it was left at by a previous roll (see
    // handleRollAgain: the old card turns away before it sinks, so this is
    // defensive, not load-bearing). The mount itself (the JSX below) is what
    // starts the rise; no manual "paint hidden, then show" step is needed
    // here the way a raw CSS transition would have required, since `motion`
    // animates from its own `hidden` variant on mount.
    setFlipped(false);

    let flipTimer = 0;
    let flipDoneTimer = 0;
    let captionTimer = 0;

    flipTimer = window.setTimeout(() => {
      setRevealing(true);
      setFlipped(true);
      flipDoneTimer = window.setTimeout(() => {
        revealedOnceRef.current = true;
        setRevealing(false);
        const beat = Math.max(
          0,
          FULL_REVEAL.issueLine.at - (FULL_REVEAL.flip.at + FULL_REVEAL.flip.duration)
        );
        captionTimer = window.setTimeout(() => setIssueCaption(buildIssueCaption(data)), beat);
      }, FULL_REVEAL.flip.duration);
    }, FULL_REVEAL.flip.at);

    return () => {
      window.clearTimeout(flipTimer);
      window.clearTimeout(flipDoneTimer);
      window.clearTimeout(captionTimer);
    };
  }, [roll, ready, buildData]);

  /* The one place a PNG gets rendered off-screen: download() and shareCard()
     below both call this instead of each drawing their own, since drawTicket
     draws every size (preview, export, thumbnail) and CLAUDE.md forbids a
     second drawing routine. Same canvas size, same fonts, same mark image
     as the visible reveal (see the effect above); only the target (an
     off-screen canvas rather than the on-page one) differs. */
  const renderCardBlob = useCallback((data: CardData): Promise<Blob | null> => {
    const off = document.createElement("canvas");
    off.width = CARD_W;
    off.height = CARD_H;
    const ctx = off.getContext("2d");
    if (!ctx) return Promise.resolve(null);
    drawTicket(ctx, data, CARD_W, CARD_H, { ...CARD_FONTS, mark: markRef.current });
    return new Promise((resolve) => off.toBlob(resolve, "image/png"));
  }, []);

  const download = useCallback(() => {
    const data = buildData();
    if (!data) return;
    renderCardBlob(data).then((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shashwa7-visitor-${data.serial}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [buildData, renderCardBlob]);

  /* Two ceilings, so two paths. A phone with the Web Share API's file
     support gets the actual PNG in its native sheet, carried straight from
     renderCardBlob above; everywhere else opens a tweet composer with the
     words and the link, since twitter.com/intent/tweet takes text and a
     URL and cannot attach an image. `canShare({ files: [...] })` is the
     check, not just `share` existing: some Safari versions expose `share`
     without file support and throw when handed files.

     A dismissed native sheet rejects its promise with AbortError. That is a
     visitor changing their mind, not a failure: it is swallowed here rather
     than falling through to the tweet composer, so declining the native
     sheet never pops a second window nobody asked for. Any other failure
     (the blob failing to generate, an unexpected share rejection) falls
     through to the same composer instead; a blocked popup there just fails
     silently, same as any other window.open a blocker eats. Nothing here
     throws or leaves the button stuck, since there is no loading state to
     get stuck in. */
  const shareCard = useCallback(async () => {
    const data = buildData();
    if (!data) return;

    const text = buildShareText(data, cardUrl);
    const url = cardUrl;
    const nav = typeof navigator === "undefined" ? null : navigator;
    const canFileShare =
      !!nav && typeof nav.share === "function" && typeof nav.canShare === "function";

    if (canFileShare) {
      try {
        const blob = await renderCardBlob(data);
        if (blob) {
          const file = new File([blob], `shashwa7-visitor-${data.serial}.png`, {
            type: "image/png",
          });
          if (nav!.canShare({ files: [file] })) {
            await nav!.share({ files: [file], text, url });
            return;
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Anything else (blob generation, an unexpected share rejection):
        // fall through to the composer below rather than leaving the
        // visitor with nothing.
      }
    }

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }, [buildData, renderCardBlob, cardUrl]);

  /* Discards the current identity and starts a fresh one: a new
     crypto.randomUUID() overwrites the one thing the portrait, the serial
     and the sticker's shine angle are all hashed from (see serialFrom and
     drawTicket). `roll` is untouched, so the issue stays exactly what the
     dice decided; identity and edition are deliberately orthogonal (see the
     module header of lib/card/dice.ts), and this button only ever writes
     the id side of that pair. The redraw itself is not special-cased here:
     buildData depends on visitorId, so the reveal effect below sees a
     new `data` object and repaints, the same path a name edit already takes
     once revealedOnceRef is true, straight to the finished frame with no
     replay of the rise or the turn. The old id is simply gone; nothing reads
     it again, and a card already downloaded under it keeps hashing to the
     same face forever because lib/card/seed.ts never changes. */
  const handleRegenerateIdentity = useCallback(() => {
    const id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
    setVisitorId(id);
  }, []);

  /* Rolling again: the pill's fill drains via useDiceRoll's `reset`.
     Nothing is rolled on the visitor's behalf. `flipped` drops to false
     immediately, turning the card back to blank while it is still fully
     mounted (`roll` is untouched here on purpose, see below); only once
     that turn has actually finished does `roll` go null, which is what
     flips the AnimatePresence condition in the JSX below and starts the
     card sinking back into the deck.

     The two can't happen in the same tick. AnimatePresence freezes an
     exiting element's props at whatever they were on the last render before
     it started leaving; nulling `roll` in the same update as `setFlipped`
     would mean that last render still had `flipped` true, and the card
     would sink away still showing its printed front. Waiting out
     EXIT_REVEAL.flip.duration is not a guess: it is the exact duration the
     turn's own CSS transition below was just given, so this fires the
     instant that turn is actually done, never before or meaningfully after.

     Reduced motion skips the wait entirely: there is no turn to see either
     way (the transition is "none"), and the card has no `exit` variant to
     play (see the JSX below), so nulling `roll` immediately just removes it
     on the next frame. */
  const handleRollAgain = useCallback(() => {
    setIssueCaption(null);
    setEditingName(false);
    setFlipped(false);
    window.clearTimeout(exitTurnTimerRef.current);
    if (prefersReducedMotion(window)) {
      revealedOnceRef.current = false;
      setRoll(null);
      return;
    }
    exitTurnTimerRef.current = window.setTimeout(() => {
      revealedOnceRef.current = false;
      setRoll(null);
    }, EXIT_REVEAL.flip.duration);
  }, []);

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
    <div className="mt-12">
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
              {/* Disabled for the ~600ms the turn is running, rather than
                  letting a redraw cancel and jump ahead: the turn only ever
                  plays once per card, so the field is unusable for well
                  under a second and never fights the animation for the
                  canvas. */}
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

        {/* mt-16 clears the header band (its 32px, plus room to breathe;
            loosened a step from mt-12, see the report) without needing the
            band to claim any flow height itself. Below this, the gap to the
            pill is DiceRoller's own `mt-8` plus the `pt-4` wrapper around it
            further down, not a `justify-between` spread across a
            fixed-height panel: that used to leave roughly 150px of dead air
            between the card and the pill.

            The slot's own height is SLOT_CARD_H (350) exactly, matching the
            canvas it centers, rather than the 380px this used to be: that
            extra 30px was slack nothing needed, and it widened the visible
            gap to the pill from 32px (DiceRoller's own margin) to 47px. This
            reserved height is untouched by the spacing pass: only the space
            around the slot grew, never what it reserves. The deck cards
            behind the canvas still rotate past this box on their lower
            corner (DECK_OFFSET_BACK's 8px translate plus its 3deg rotation
            puts that corner ~15px below the canvas's own edge, the most any
            deck offset extends past it), but nothing here clips: this div
            has no `overflow-hidden`, and that corner lands even further
            clear of the pill below now that its own gap grew too. */}
        <div className="relative mt-16 flex h-[350px] w-full items-center justify-center">
          {/* The deck: two idle cards, always present, so the slot never
              looks empty before a roll. The back one is a plain bordered
              rectangle at the card's own aspect ratio, offset and rotated
              per the reference. The front one is the reserved slot's own
              stand-in: PlaceholderCard sketches a stamp, a scribble where
              the portrait goes, a wavy name and a torn stub, all in the
              real card's own proportions, so the slot reads as "a card is
              coming" instead of an empty box. It costs no layout shift when
              the real card arrives: it never mounts or unmounts, and the
              rising card (same size, same position) simply rises past it,
              already showing its own back. */}
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
          {/* The card itself: rises off the deck, then turns from its back
              to its printed front, and reverses both on the way out.
              `AnimatePresence` owns the mount and unmount (keyed on
              `roll && ready`, the same gate the reveal effect above already
              uses), so the exit actually gets to play before the element
              leaves rather than being cut off by an unmount racing its own
              transition. `cardRiseVariants` (lib/motionVariants.ts) drives
              the rise itself: opacity, translate and scale, nothing 3D.

              The turn (rotateY) stays a separate, plain CSS transition
              rather than joining the `motion` variant above it: that keeps
              `preserve-3d` and `backface-visibility: hidden` working exactly
              as verified in a real browser, with no risk from moving a 3D
              transform onto `motion`'s own transform pipeline. `perspective`
              sits on the housing div below (an ancestor of the element that
              actually rotates), not on the rise wrapper itself.

              `initial={false}` and dropping `exit` under reduced motion,
              rather than trusting the app's global `MotionConfig
              reducedMotion="user"` (app/layout.tsx) alone: that config only
              zeroes transform-driven values (x, y, scale, rotate), not
              opacity, so the rise's own fade would still visibly play on
              its full duration otherwise. This is the same local
              `prefersReducedMotion(window)` read the turn below already
              uses, not a second mechanism. */}
          <AnimatePresence>
            {roll && ready && (
              <motion.div
                className="relative"
                style={{ width: SLOT_CARD_W, height: SLOT_CARD_H }}
                variants={cardRiseVariants}
                initial={reducedMotion ? false : "hidden"}
                animate="visible"
                exit={reducedMotion ? undefined : "exit"}
              >
                {/* The perspective housing: establishes the 3D space the turn
                    below happens in. Sized to fill the rise wrapper exactly, so
                    it never affects layout of its own. */}
                <div className="h-full w-full" style={{ perspective: CARD_FLIP_PERSPECTIVE }}>
                  {/* The element that actually rotates. `preserve-3d` is what
                      lets its two children (the faces below) each occupy their
                      own plane in that 3D space instead of being flattened into
                      one; without it `backface-visibility: hidden` on the faces
                      would have nothing to hide behind. Its transition duration
                      follows `flipped`'s own direction: FULL_REVEAL's entering
                      the front, EXIT_REVEAL's turning back away, since those are
                      the only two times this value ever changes. */}
                  <div
                    className="relative h-full w-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      transition: reducedMotion
                        ? "none"
                        : `transform ${flipped ? FULL_REVEAL.flip.duration : EXIT_REVEAL.flip.duration}ms ${CARD_FLIP_EASE}`,
                    }}
                  >
                    {/* The back: the card face-down. Same stock, border and
                        radius as the two deck cards above, so it reads as the
                        same object seen from behind, not a new design; the
                        brand mark at low opacity is the only thing on it, since
                        a face-down card knows nothing about the roll yet.
                        `backfaceVisibility: hidden` (with the -webkit- prefix
                        Safari still needs) is what makes this invisible once
                        the turn passes 90deg, the same property the front face
                        below relies on to stay invisible until then. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center rounded-2xl border border-border bg-card"
                      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    >
                      <span
                        className="block h-8 w-8 bg-foreground opacity-15"
                        style={{
                          WebkitMaskImage: "url(/brand-mark.png)",
                          maskImage: "url(/brand-mark.png)",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                        }}
                      />
                    </div>
                    {/* The front: the finished card, drawn to the canvas the
                        instant a roll lands (see the reveal effect above).
                        Rotated 180deg on its own, so the parent's own 180deg
                        turn above lands it facing the viewer the right way
                        round rather than mirrored: two rotations of the same
                        180deg cancel out. Transparent where the tear-line holes
                        are cut with destination-out, so the deck's own back
                        card (rendered above, further back in the DOM) shows
                        through those cuts once this face is up: the back face
                        just above is never painted at all once its own
                        backface-visibility hides it, so nothing else in this
                        stack sits behind the holes. */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        className="h-full w-full rounded-2xl"
                        role="img"
                        aria-label={
                          data
                            ? `A ${data.issue.name} visitor card, serial ${data.serial}, issued to ${data.name}, from a roll of ${pipTotal(data.roll)}.`
                            : "The card's reserved space. It rises here once you roll three times."
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* pt-4 on top of DiceRoller's own mt-8 (unchanged, dice skins are
            off limits for this pass) loosens the card-to-pill gap a step,
            from 32px to 48px, without editing TossDice/CubeDice: padding
            here, unlike a second margin, cannot collapse with the child's
            own top margin. */}
        <div className="pt-4">
          <DiceRoller
            onComplete={setRoll}
            issueCaption={issueCaption}
            onRollAgain={handleRollAgain}
            onRollsChange={setRolls}
          />
        </div>

        {/* Share: a text action, not a fifth toolbar icon (that row is
            already full at a 320px viewport, see TOOLBAR_BUTTON's own
            comment). Sits under the pill, near the issue caption, secondary
            to Download rather than a peer to it. Rendered only once a card
            exists, the same way Edit/Regenerate/Download above are: kept
            out of the tab order before then rather than merely hidden. */}
        {data && (
          <button
            type="button"
            onClick={shareCard}
            className="mt-3 text-sm text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:decoration-foreground"
          >
            Share your card
          </button>
        )}
      </div>
    </div>
  );
}
