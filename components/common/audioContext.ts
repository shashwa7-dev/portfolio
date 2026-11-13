"use client";

/**
 * The page's one AudioContext, shared by every synthesised or recorded
 * sound (the hero's fidget spinner, the starter pack card). Created lazily
 * inside a user gesture, never at module scope (there is no AudioContext on
 * the server); each call also wakes a suspended context. Returns null where
 * audio is unavailable, so callers can no-op silently.
 */
let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return null;
  if (!ctx) ctx = new window.AudioContext();
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** The context if one exists already, without creating or waking it. */
export function peekAudioContext(): AudioContext | null {
  return ctx;
}
