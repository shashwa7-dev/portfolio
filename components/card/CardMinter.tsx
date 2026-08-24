"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ISSUES } from "@/lib/card/issues";
import { issueFromTotal, pipTotal, rollPair } from "@/lib/card/dice";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket, CARD_W, CARD_H } from "@/lib/card/ticket";
import { CARD_FONTS } from "@/lib/card/fonts";
import { startPrintReveal, parsePrintDuration, prefersReducedMotion } from "@/lib/card/reveal";
import type { CardData, RollSet } from "@/lib/card/types";

const KEY = "shashwa7:visitor-id";
const MARK_SRC = "/brand-mark.png";

function today(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export default function CardMinter({
  origin,
  city,
}: {
  origin: string | null;
  city: string | null;
}) {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [minted, setMinted] = useState(false);
  const [name, setName] = useState("Visitor");
  const [fontsReady, setFontsReady] = useState(false);
  const [markReady, setMarkReady] = useState(false);
  // True only while the one-time print reveal is running, so the name field
  // (see the note above the <input> below) can disable itself for that
  // stretch instead of racing a redraw against the reveal.
  const [revealing, setRevealing] = useState(false);
  /* INTERIM (Task 5 replaces this with <DiceRoller>): one silent set of
     three throws made on mount, so the card still renders while the dice UI
     is being built. Nothing about this is user-visible yet. */
  const [roll] = useState<RollSet>(() => [
    rollPair(Math.random),
    rollPair(Math.random),
    rollPair(Math.random),
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<HTMLImageElement | null>(null);
  // The reveal plays once, on the first draw after mint. Edits to the name
  // afterwards redraw straight to the finished frame: see the effect below.
  const revealedOnceRef = useRef(false);

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

  const ready = fontsReady && markReady;

  const buildData = useCallback((): CardData | null => {
    if (!visitorId) return null;
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

  /* The one moment the rarity system exists for: on the first draw after
     mint, the finished card is composited onto the visible canvas top to
     bottom instead of appearing all at once. This is pure compositing, not
     drawing: the finished card is rendered once, synchronously, by the same
     drawTicket the gallery and the download button use, to an offscreen
     canvas; lib/card/reveal.ts only ever blits slices of that finished
     bitmap onto the visible one. drawTicket itself never learns the reveal
     exists.

     Redraws after that first reveal (the name field, once it is editable
     again) skip straight to the finished frame: printing again on every
     keystroke would be noise, not a moment. */
  useEffect(() => {
    if (!minted || !ready) return;
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

    if (!reducedMotion) setRevealing(true);

    return startPrintReveal({
      ctx,
      source: off,
      width: pxW,
      height: pxH,
      durationMs,
      reducedMotion,
      onDone: () => {
        revealedOnceRef.current = true;
        setRevealing(false);
      },
    });
  }, [minted, ready, buildData]);

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

  const data = buildData();

  return (
    <div className="mt-8">
      {!minted ? (
        <button
          onClick={() => setMinted(true)}
          disabled={!visitorId}
          className="rounded-lg bg-accent px-5 py-3 text-base font-medium text-accent-foreground transition-colors duration-base ease-out hover:bg-accent-hover disabled:opacity-50"
        >
          Mint my card
        </button>
      ) : !ready ? (
        <p className="text-sm text-subtle">Drawing your card...</p>
      ) : (
        <div className="max-w-[420px]">
          <canvas
            ref={canvasRef}
            className="w-full aspect-[4/5] rounded-lg"
            role="img"
            aria-label={
              data
                ? `A ${data.issue.name} visitor card, serial ${data.serial}, issued to ${data.name}.`
                : "A visitor card"
            }
          />
          <label className="mt-6 block">
            <span className="block font-mono text-2xs uppercase tracking-label text-subtle">
              Name on the card
            </span>
            {/* Disabled for the ~900ms the print reveal is running, rather
                than letting a redraw cancel and jump ahead: the reveal only
                ever plays once, right after Mint, so the field is unusable
                for less than a second and never fights the animation for
                the canvas. */}
            <input
              value={name}
              maxLength={18}
              disabled={revealing}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-transparent px-3 py-2 text-base text-foreground disabled:opacity-50"
            />
          </label>
          <button
            onClick={download}
            className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-base font-medium text-accent-foreground transition-colors duration-base ease-out hover:bg-accent-hover"
          >
            Download PNG
          </button>
          <p className="mt-3 text-sm text-subtle">
            Drawn from a random id kept in this browser. We read your country to
            print it on the card and store nothing.
          </p>
        </div>
      )}
    </div>
  );
}
