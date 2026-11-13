"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTicketDate, starterPack, type ThemeId } from "@/lib/starter-pack/config";
import Card from "./Card";
import Lanyard from "./Lanyard";
import { spLabel, spMarker } from "./fonts";
import { useStarterPackSim } from "./useStarterPackSim";
import s from "./StarterPack.module.css";

export type Variant = "hang" | "footer";

/**
 * Desktop: the card hangs in the header's top-right corner, in the margin
 * beside the hero column. The page box (`.starter-pack-hang`) is 420 x 576 CSS
 * px; the card scales with the margin so it never reaches the hero text.
 */
const HANG_BOX = { w: 420, h: 576 };
const HANG_SCALE = { min: 0.45, max: 0.6 };
/** CSS px kept clear between the card and the hero column, and the screen edge. */
const HANG_CLEARANCE = 40;
const HANG_EDGE = 16;
/** The phone slot's height in CSS pixels, reserved by the server markup in app/page.tsx. */
export const FOOTER_SLOT_HEIGHT = 640;
const FOOTER_MAX_SCALE = 0.68;
const CARD_W = 470;
const GUTTER = 32;
const ANCHOR_Y = -40;

/** The hero column's width: `--measure` in app/globals.css (never hard-coded). */
function measure(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--measure"));
  return Number.isFinite(v) ? v : 760;
}

function layout(variant: Variant, width: number) {
  if (variant === "hang") {
    const margin = (width - measure()) / 2;
    const scale = Math.min(HANG_SCALE.max, Math.max(HANG_SCALE.min, (margin - HANG_CLEARANCE) / CARD_W));
    // The card's right edge sits HANG_EDGE px in from the box's right edge.
    const anchorX = (HANG_BOX.w - HANG_EDGE) / scale - CARD_W / 2;
    return { scale, w: HANG_BOX.w / scale, h: HANG_BOX.h / scale, anchorX };
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
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 375 : window.innerWidth));

  const { scale, w, h, anchorX } = useMemo(() => layout(variant, width), [variant, width]);
  const anchor = useMemo(() => ({ x: anchorX, y: ANCHOR_Y }), [anchorX]);
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
  } = useStarterPackSim(scale, anchor);

  useEffect(() => {
    const onResize = () =>
      setWidth(variant === "hang" ? window.innerWidth : (rootRef.current?.clientWidth ?? window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [variant, rootRef]);

  const themeClass = theme === "orange" ? s.orange : s.cardStock;
  return (
    <div ref={rootRef} className={`${s.root} ${themeClass} ${spMarker.variable} ${spLabel.variable}`}>
      <div ref={worldRef} className={s.world} style={{ width: w, height: h, transform: `scale(${scale})` }}>
        <div ref={hangRef} className={s.hang} style={{ visibility: "hidden" }}>
          <Card theme={theme} date={date} tiltRef={tiltRef} ballsRef={ballsRef} />
        </div>
        <Lanyard
          edgeRef={edgeRef}
          fillRef={fillRef}
          stitchRef={stitchRef}
          clipRef={clipRef}
        />
      </div>
    </div>
  );
}
