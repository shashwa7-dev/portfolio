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

/** Which screen each variant belongs to. Keep in step with app/globals.css. */
export const VARIANT_QUERY: Record<Variant, string> = {
  hang: "(min-width: 1280px)",
};

function useMatches(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default function StarterPackMount({ variant }: { variant: Variant }) {
  const fits = useMatches(VARIANT_QUERY[variant]);
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

  if (!idle || !fits) return null;
  return <StarterPack variant={variant} />;
}
