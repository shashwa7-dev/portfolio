"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the dice's sound effects (diceSound.ts) are muted. A tiny external
 * store rather than React state threaded through props: the toggle lives in
 * CardMinter's header, the sound fires from inside useDiceRoll, and there is
 * no parent-child path between the two (the hook lives inside whichever skin
 * DiceRoller has mounted). This branch already carries one upward-syncing
 * mirror between a skin and CardMinter (onRollsChange) that a review flagged
 * as a recognised anti-pattern; a second one, for a flag with even less
 * reason to live in React state, would only compound it.
 *
 * Namespaced the same way as CardMinter's own KEY ("shashwa7:visitor-id").
 */
const KEY = "shashwa7:dice-sound-muted";

type Listener = () => void;
const listeners = new Set<Listener>();

/** Sound is on by default: only an explicit "1" written by setMuted counts
 *  as muted. A missing key, a cleared localStorage, or storage that throws
 *  (private browsing, quota) all read as unmuted. */
export function getMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, muted ? "1" : "0");
    }
  } catch {
    /* storage unavailable; the preference just won't survive a reload */
  }
  listeners.forEach((cb) => cb());
}

export function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** useSyncExternalStore needs a value for the render that happens on the
 *  server (and the hydration pass that has to match it exactly): false,
 *  the same default getMuted() itself falls back to, so there is nothing
 *  for the client to disagree with at hydration time. */
function getServerSnapshot(): boolean {
  return false;
}

export function useSoundPreference(): { muted: boolean; toggle: () => void } {
  const muted = useSyncExternalStore(subscribe, getMuted, getServerSnapshot);
  return {
    muted,
    toggle: () => setMuted(!getMuted()),
  };
}
