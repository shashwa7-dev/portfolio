"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTicketDate, starterPack, type ThemeId } from "@/lib/starter-pack/config";
import Card from "./Card";
import Lanyard from "./Lanyard";
import { spLabel, spMarker } from "./fonts";
import { useStarterPackSim } from "./useStarterPackSim";
import s from "./StarterPack.module.css";

export type Variant = "hang" | "footer";

/** Unscaled world for the wide-screen card: room for the strap, the card and its swing. */
const HANG = { w: 700, h: 960, scale: 0.6 };
/** The phone slot's height in CSS pixels, reserved by the server markup in app/page.tsx. */
export const FOOTER_SLOT_HEIGHT = 600;
const FOOTER_MAX_SCALE = 0.68;
const CARD_W = 470;
const GUTTER = 32;
const ANCHOR_Y = -40;

function layout(variant: Variant, width: number) {
  if (variant === "hang") return { scale: HANG.scale, w: HANG.w, h: HANG.h };
  const scale = Math.min(FOOTER_MAX_SCALE, (width - GUTTER) / CARD_W);
  return { scale, w: width / scale, h: FOOTER_SLOT_HEIGHT / scale };
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

  const { scale, w, h } = useMemo(() => layout(variant, width), [variant, width]);
  const anchor = useMemo(() => ({ x: w / 2, y: ANCHOR_Y }), [w]);
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
    if (variant === "hang") return;
    const onResize = () => setWidth(rootRef.current?.clientWidth ?? window.innerWidth);
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
