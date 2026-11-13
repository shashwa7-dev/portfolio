"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { formatTicketDate, starterPack, type ThemeId } from "@/lib/starter-pack/config";
import { layout, type Variant } from "@/lib/starter-pack/layout";
import Card from "./Card";
import Lanyard from "./Lanyard";
import { spLabel, spMarker } from "./fonts";
import { useStarterPackSim } from "./useStarterPackSim";
import s from "./StarterPack.module.css";

export type { Variant } from "@/lib/starter-pack/layout";

/** Desktop: the strap comes down from above the screen's top edge. */
const ANCHOR_Y = -40;
/** Elsewhere it comes out of a slit cut in the page, this many CSS px below the box's top. */
const SLIT_TOP = 16;

/** The hero column's width: `--measure` in app/globals.css (never hard-coded). */
function measure(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--measure"));
  return Number.isFinite(v) ? v : 760;
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

  const { scale, w, h, anchorX } = useMemo(() => layout(variant, width ?? 375, measure()), [variant, width]);
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
