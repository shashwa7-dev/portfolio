"use client";

import { useEffect, useRef, useState } from "react";
import { duration } from "@/lib/motionVariants";

/**
 * The closing section's sign: "LET'S BUILD" scrolling right to left across a
 * 7-row dot-matrix strip, in the same round-dot language as the section
 * glyphs (Section.tsx) and the Doto label face. It is the closing section's
 * headline, so screen readers get it as one image named "Let's build"
 * rather than 400 dots.
 *
 * The strip fills its column: the number of dot columns comes from its width
 * (one column per PITCH px), so dots stay the same size from phone to desktop.
 * Each step lights and unlights dots by writing `data-on` straight to the
 * elements, not through React state, so the scroll never re-renders.
 *
 * It steps only while on screen and the tab is visible. Under reduced motion
 * it holds still with the text at the left edge.
 */
const TEXT = "LET'S BUILD";
const GAP_AFTER = 8; // blank columns before the text comes round again
const ROWS = 7; // the 5-row font sits in rows 1 to 5, a blank row above and below
const PITCH = 12; // px per dot column, roughly

/** 5-row bitmap font, only the characters TEXT needs. */
const FONT: Record<string, string[]> = {
  L: ["#..", "#..", "#..", "#..", "###"],
  E: ["###", "#..", "##.", "#..", "###"],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  "'": ["#", "#", ".", ".", "."],
  S: ["###", "#..", "###", "..#", "###"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  " ": ["..", "..", "..", "..", ".."],
};

/** The text as a tape of columns, each column five booleans, top to bottom. */
const TAPE: boolean[][] = (() => {
  const cols: boolean[][] = [];
  for (const ch of TEXT) {
    const g = FONT[ch];
    for (let c = 0; c < g[0].length; c++) cols.push(g.map((row) => row[c] === "#"));
    cols.push([false, false, false, false, false]);
  }
  for (let i = 0; i < GAP_AFTER; i++) cols.push([false, false, false, false, false]);
  return cols;
})();

export default function DotMarquee({ className = "" }: { className?: string }) {
  const strip = useRef<HTMLSpanElement>(null);
  const [cols, setCols] = useState(0);

  // Columns from width, kept in step with resizes.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCols(Math.max(16, Math.floor(entry.contentRect.width / PITCH))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = strip.current;
    if (!el || cols === 0) return;
    const dots = el.children;
    let offset = 0;
    const paint = () => {
      for (let i = 0; i < dots.length; i++) {
        const r = Math.floor(i / cols) - 1;
        const col = TAPE[(i % cols + offset) % TAPE.length];
        const on = r >= 0 && r < 5 && col[r];
        if (on) (dots[i] as HTMLElement).dataset.on = "";
        else delete (dots[i] as HTMLElement).dataset.on;
      }
    };
    paint();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let inView = false;
    let timer = 0;
    const sync = () => {
      window.clearInterval(timer);
      if (inView && document.visibilityState === "visible") {
        timer = window.setInterval(() => {
          offset = (offset + 1) % TAPE.length;
          paint();
        }, duration.marqueeStep * 1000);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.clearInterval(timer);
    };
  }, [cols]);

  return (
    <span
      ref={strip}
      role="img"
      aria-label="Let's build"
      className={`dot-marquee grid w-full ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols || 1}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
    >
      {Array.from({ length: cols * ROWS }, (_, i) => (
        <span key={i} aria-hidden />
      ))}
    </span>
  );
}
