"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Variant } from "./StarterPack";

/**
 * Loads the starter pack card only after the page has loaded and the browser
 * is idle, and only for the variant that fits the screen, so it can never
 * delay or become the homepage's LCP, and the hidden variant never downloads.
 * `ssr: false` needs a "use client" boundary, hence this wrapper (the same
 * reason as ChatBotMount).
 */
const StarterPack = dynamic(() => import("./StarterPack"), { ssr: false });

/** Desktop (the dock moves to the left edge here too): the card hangs in the header's top-right corner. */
export const WIDE_QUERY = "(min-width: 1280px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const isWide = () => window.matchMedia(WIDE_QUERY).matches;

export default function StarterPackMount({ variant }: { variant: Variant }) {
  const wide = useSyncExternalStore(subscribe, isWide, () => false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let handle = 0;
    let timer = 0;
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") handle = window.requestIdleCallback(() => setIdle(true), { timeout: 3000 });
      else timer = window.setTimeout(() => setIdle(true), 1500);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      window.removeEventListener("load", whenIdle);
      if (handle) window.cancelIdleCallback(handle);
      window.clearTimeout(timer);
    };
  }, []);

  const fits = variant === "hang" ? wide : !wide;
  return idle && fits ? <StarterPack variant={variant} /> : null;
}
