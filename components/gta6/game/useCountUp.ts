"use client";

import { useEffect, useRef, useState } from "react";

/** A duration token in ms, from the root's computed style. */
function tokenMs(name: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return 0;
  return raw.endsWith("ms") ? n : n * 1000;
}

/**
 * `target`, counted up to over `--duration-gta-score` whenever it rises; a
 * drop (Play again) and reduced motion show it at once.
 */
export function useCountUp(target: number): number {
  const [shown, setShown] = useState(target);
  const at = useRef(target);
  useEffect(() => {
    const from = at.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = target > from && !reduced ? tokenMs("--duration-gta-score") : 0;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = ms > 0 ? Math.min(1, (now - t0) / ms) : 1;
      at.current = Math.round(from + (target - from) * k);
      setShown(at.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}
