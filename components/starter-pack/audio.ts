"use client";

/**
 * One AudioContext for the card's sounds, created lazily inside a press,
 * never at module scope (there is no AudioContext on the server). Same shape
 * as components/common/spinSound.ts.
 */
let ctx: AudioContext | null = null;

export function getAudio(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return null;
  if (!ctx) ctx = new window.AudioContext();
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}
