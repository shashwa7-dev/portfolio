"use client";

import { useEffect, useRef } from "react";
import { ISSUES } from "@/lib/card/issues";
import { serialFrom } from "@/lib/card/seed";
import { drawTicket } from "@/lib/card/ticket";
import type { IssueKey } from "@/lib/card/types";

/** Scratch only. Deleted in Task 7. */
const KEYS: IssueKey[] = ["definitive", "commemorative", "firstDay", "misprint", "inverted"];
const FONTS = { hand: "cursive", sticker: "system-ui, sans-serif", mono: "ui-monospace, monospace" };

function One({ k }: { k: IssueKey }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = 268 * dpr;
    c.height = 335 * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const id = `specimen-${k}`;
    drawTicket(ctx, {
      visitorId: id,
      name: "Visitor",
      serial: serialFrom(id),
      issue: ISSUES[k],
      origin: "Bengaluru, IN",
      city: "Bengaluru",
      date: "23 Aug 2026",
    }, 268, 335, FONTS);
  }, [k]);
  return <canvas ref={ref} style={{ width: 268, height: 335 }} />;
}

export default function CardPreview() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", padding: 24 }}>
      {KEYS.map((k) => <One key={k} k={k} />)}
    </div>
  );
}
