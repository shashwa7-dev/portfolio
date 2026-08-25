"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Download, Pencil } from "lucide-react";
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
import Pips from "@/components/card/dice/Pips";
import type { CardData, Roll, RollSet } from "@/lib/card/types";

const KEY = "shashwa7:visitor-id";
const MARK_SRC = "/brand-mark.png";

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
  // rolling again drops this to false first (the slide-out) and only
  // clears `roll` once that transition has had time to finish, so the old
  // (already-seen) card visibly leaves before the slot goes blank again.
  const [cardShown, setCardShown] = useState(false);
  // The rise's actual CSS transition duration, read from whichever variant
  // is currently in play (see the reveal effect below). Not the flat
  // CARD_RISE_MS constant: SHORT_REVEAL's cardRise is near-instant on
  // purpose, and hard-coding CARD_RISE_MS here would always play the full
  // 500ms rise regardless of variant, leaving the print underway (and, on
  // SHORT_REVEAL, well past the portrait) while the card was still moving.
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
    // couples SETTLE_MS and CARD_RISE_MS, so a future change to either
    // could otherwise let a stale timer null out this new roll's state
    // moments after it arrives. Enforced here rather than left to the
    // coincidence that they currently happen to both be 500.
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

  /* Rolling again: the card slides back into the deck (cardShown false,
     the same transition the rise uses in reverse) and the pill's fill
     drains via useDiceRoll's `reset`. Nothing is rolled on the visitor's
     behalf. `roll` itself, and the offscreen clear, wait for the slide-out
     to finish so the old (already-seen) card doesn't just vanish under the
     visitor mid-transition. */
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
      // `riseMs` here, not the flat CARD_RISE_MS: this clear always tracks
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
      {/* The stage: a bounded control surface, not the page itself. Fixed
          height so the card's slot is reserved from the first paint and
          nothing shifts when a roll finishes. A control surface, not text
          to select mid-tap. */}
      <div
        className="relative mx-auto flex w-full max-w-[420px] select-none flex-col items-center justify-between rounded-[30px] border border-border bg-elevated px-6 pb-10 pt-12"
        style={{ height: 630 }}
      >
        {/* The roll history: a chip per throw recorded so far, reading
            straight from useDiceRoll's own `rolls` (handed up through
            DiceRoller's onRollsChange) rather than a second count kept
            here. Absolutely positioned and its own fixed height, occupied
            whether or not it has chips in it, so nothing below ever moves
            as they appear. Decorative duplicate of what the aria-live
            status already announces inside the skin, hence aria-hidden and
            pointer-events-none: it must never sit in front of the actions
            in the corner beside it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-4 flex h-8 items-center justify-center gap-2"
        >
          {rolls.map(([a, b], i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              initial={reducedMotion ? false : "hidden"}
              animate="visible"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1"
            >
              <span className="font-mono text-2xs text-subtle">{i + 1}</span>
              <Pips value={a} className="h-3.5 w-3.5" />
              <Pips value={b} className="h-3.5 w-3.5" />
            </motion.div>
          ))}
        </div>

        {/* Edit and download: actions on the card rather than a form
            stacked beneath it, so opening either costs no layout. Rendered
            (not merely hidden) only once a card exists, which keeps them
            out of the tab order before then. */}
        {roll && !editingName && (
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              type="button"
              onClick={openEditName}
              aria-label="Edit the name on the card"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-elevated text-foreground transition-colors duration-base ease-out hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-elevated"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the card as a PNG"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-elevated text-foreground transition-colors duration-base ease-out hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-elevated"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {roll && editingName && (
          <div className="absolute right-4 top-4">
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
              className="w-40 rounded-full border border-border bg-elevated px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>
        )}

        <div className="relative flex h-[380px] w-full items-center justify-center">
          {/* The deck: two idle cards, always present, so the slot never
              looks empty before a roll. Plain bordered rectangles at the
              card's own aspect ratio, offset and rotated per the reference. */}
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
            className="absolute inset-0 m-auto rounded-2xl border border-border bg-card"
            style={{ width: SLOT_CARD_W, height: SLOT_CARD_H, transform: DECK_OFFSET_FRONT }}
          />
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

      {roll && (
        <p className="mx-auto mt-6 max-w-[420px] text-sm text-subtle">
          Drawn from a random id kept in this browser. We read your country to
          print it on the card and store nothing.
        </p>
      )}
    </div>
  );
}
