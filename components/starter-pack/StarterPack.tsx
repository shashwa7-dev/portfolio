"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { formatTicketDate, starterPack, type ThemeId } from "@/lib/starter-pack/config";
import Card from "./Card";
import Lanyard from "./Lanyard";
import { spLabel, spMarker } from "./fonts";
import { useStarterPackSim } from "./useStarterPackSim";
import s from "./StarterPack.module.css";

/**
 * Where the card hangs: `hang` in the header's top-right corner (desktop),
 * `footer` in its own slot above the footer (tablets), `mini` at half size
 * beside the footer's links (phones).
 */
export type Variant = "hang" | "footer" | "mini";

/**
 * Desktop: the card hangs in the header's top-right corner. The page box
 * (`.starter-pack-hang`) spans the full width and is 900 CSS px tall, so the
 * card can swing freely; it scales with the margin beside the hero column so
 * it never reaches the hero text.
 */
const HANG_BOX_H = 900;
const HANG_SCALE = { min: 0.45, max: 0.6 };
/** CSS px kept clear between the card and the hero column. */
const HANG_CLEARANCE = 40;
/** CSS px from the card's right edge to the screen's right edge. */
const HANG_EDGE = 32;
/** The phone slot's height in CSS pixels, reserved by the server markup in app/page.tsx. */
export const FOOTER_SLOT_HEIGHT = 640;
const FOOTER_MAX_SCALE = 0.68;
const CARD_W = 470;
const GUTTER = 32;
/** Desktop: the strap comes down from above the screen's top edge. */
const ANCHOR_Y = -40;
/** Elsewhere it comes out of a slit cut in the page, this many CSS px below the box's top. */
const SLIT_TOP = 16;
/**
 * Phones: a small card in a 150 x 300 CSS px box overlaid at the right edge of
 * the footer (`.starter-pack-foot-box`). At 0.3 it is about 141 px wide, clear
 * of the footer's left-hand text, and its strap and card end above the
 * copyright row.
 */
const MINI_SCALE = 0.3;
const MINI_BOX_H = 300;

/** The hero column's width: `--measure` in app/globals.css (never hard-coded). */
function measure(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--measure"));
  return Number.isFinite(v) ? v : 760;
}

function layout(variant: Variant, width: number) {
  if (variant === "hang") {
    const margin = (width - measure()) / 2;
    const scale = Math.min(HANG_SCALE.max, Math.max(HANG_SCALE.min, (margin - HANG_CLEARANCE) / CARD_W));
    const anchorX = (width - HANG_EDGE) / scale - CARD_W / 2;
    return { scale, w: width / scale, h: HANG_BOX_H / scale, anchorX };
  }
  if (variant === "mini") {
    const w = width / MINI_SCALE;
    // Right-aligned: the card's right edge meets the box's right edge.
    return { scale: MINI_SCALE, w, h: MINI_BOX_H / MINI_SCALE, anchorX: w - CARD_W / 2 };
  }
  const scale = Math.min(FOOTER_MAX_SCALE, (width - GUTTER) / CARD_W);
  const w = width / scale;
  return { scale, w, h: FOOTER_SLOT_HEIGHT / scale, anchorX: w / 2 };
}

/**
 * The starter pack card on its lanyard. Client only (loaded with
 * `ssr: false`), so the random theme and today's date never cause a
 * hydration mismatch. Edit the contents in lib/starter-pack/config.ts.
 */
export default function StarterPack({ variant }: { variant: Variant }) {
  const [theme] = useState<ThemeId>(
    () => starterPack.themes[Math.floor(Math.random() * starterPack.themes.length)],
  );
  const [date] = useState(() => formatTicketDate(new Date()));
  // Null until the box is measured: the card does not start (or draw) until
  // it knows its real size, so the first frames can't jump to a new anchor.
  const [width, setWidth] = useState<number | null>(null);
  const ready = width !== null;

  const { scale, w, h, anchorX } = useMemo(() => layout(variant, width ?? 375), [variant, width]);
  const fromSlit = variant !== "hang";
  const anchor = useMemo(
    () => ({ x: anchorX, y: fromSlit ? SLIT_TOP / scale : ANCHOR_Y }),
    [anchorX, fromSlit, scale],
  );
  const bounds = useMemo(() => ({ w, h }), [w, h]);
  const {
    root: rootRef,
    world: worldRef,
    hang: hangRef,
    tilt: tiltRef,
    balls: ballsRef,
    edge: edgeRef,
    fill: fillRef,
    stitch: stitchRef,
    clip: clipRef,
  } = useStarterPackSim(scale, anchor, !fromSlit, bounds, ready);

  // Layout effect: measure the real box before the first paint, so the card
  // never hangs from the window's width when its box is narrower.
  useLayoutEffect(() => {
    const onResize = () => setWidth(rootRef.current?.clientWidth ?? window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rootRef]);

  const themeClass = theme === "sky" ? s.sky : s.cardStock;
  return (
    <div ref={rootRef} className={`${s.root} ${themeClass} ${spMarker.variable} ${spLabel.variable}`}>
      {ready && (
        <div ref={worldRef} className={s.world} style={{ width: w, height: h, transform: `scale(${scale})` }}>
          <div ref={hangRef} className={s.hang} style={{ visibility: "hidden" }}>
            <Card theme={theme} date={date} tiltRef={tiltRef} ballsRef={ballsRef} />
          </div>
          <Lanyard
            slit={fromSlit ? anchor : null}
            edgeRef={edgeRef}
            fillRef={fillRef}
            stitchRef={stitchRef}
            clipRef={clipRef}
          />
        </div>
      )}
    </div>
  );
}
