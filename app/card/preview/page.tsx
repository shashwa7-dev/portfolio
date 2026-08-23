"use client";

import { useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/card/seed";
import { castFrom } from "@/lib/card/cast";
import { drawPortrait } from "@/lib/card/portrait";

/** Scratch only. Deleted in Task 7. Renders 24 faces so a change to the
 *  drawing code shows up as a visible diff instead of a silent one. */
export default function PortraitPreview() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 960 * dpr;
    c.height = 640 * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#f6f1e5";
    ctx.fillRect(0, 0, 960, 640);
    for (let i = 0; i < 24; i++) {
      const R = mulberry32(i * 7919);
      drawPortrait(
        ctx,
        castFrom(mulberry32(i * 7919)),
        R,
        { x: (i % 6) * 160, y: Math.floor(i / 6) * 160, w: 160, h: 160 },
        "#1f1d1a"
      );
    }
  }, []);
  return <canvas ref={ref} style={{ width: 960, height: 640 }} />;
}
