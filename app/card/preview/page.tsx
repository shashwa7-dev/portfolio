"use client";

import { useEffect, useRef } from "react";
import { createEngine } from "@/lib/card/engine/portrait-engine";

/** Scratch only. Deleted in Task 7. */
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
    const engine = createEngine(ctx);
    for (let i = 0; i < 24; i++) {
      engine.portrait(`specimen-${i}`, {
        x: (i % 6) * 160, y: Math.floor(i / 6) * 160, w: 160, h: 160,
      });
    }
  }, []);
  return <canvas ref={ref} style={{ width: 960, height: 640 }} />;
}
