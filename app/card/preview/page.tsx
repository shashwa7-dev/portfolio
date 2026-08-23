"use client";

import { useEffect, useRef } from "react";
import { createEngine } from "@/lib/card/engine/portrait-engine";
import { drawSticker } from "@/lib/card/sticker";
import { ISSUES } from "@/lib/card/issues";
import { hashStr, mulberry32 } from "@/lib/card/seed";

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
    const keys = ["commemorative", "firstDay", "misprint", "inverted"] as const;
    for (let i = 0; i < 24; i++) {
      engine.portrait(`specimen-${i}`, {
        x: (i % 6) * 160, y: Math.floor(i / 6) * 160, w: 160, h: 160,
      });
      const issue = ISSUES[keys[i % 4]];
      const R = mulberry32(hashStr(`specimen-${i}`));
      drawSticker(ctx, issue.name, issue, R,
        (i % 6) * 160 + 80, Math.floor(i / 6) * 160 + 140,
        22, "system-ui, sans-serif", -0.12);
    }
  }, []);
  return <canvas ref={ref} style={{ width: 960, height: 640 }} />;
}
