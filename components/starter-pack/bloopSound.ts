"use client";

import { bloopFrequency } from "@/lib/starter-pack/bloop";

/**
 * The soft "bloop" when a bubble is pressed: a sine swept down to its pitch
 * with a quiet triangle an octave up, all gone in a quarter second. Lower for
 * bigger bubbles. Same shape as components/common/spinSound.ts: the context is
 * created lazily inside the press, never at module scope, and every failure
 * is a silent no-op. It only ever plays in response to a press.
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return null;
  if (!ctx) ctx = new window.AudioContext();
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

const VOICES: { ratio: number; type: OscillatorType; gain: number }[] = [
  { ratio: 1, type: "sine", gain: 0.13 },
  { ratio: 2.01, type: "triangle", gain: 0.03 },
];

export function playBloop(r: number): void {
  try {
    const audio = getContext();
    if (!audio) return;
    const f = bloopFrequency(r);
    const t = audio.currentTime;
    for (const v of VOICES) {
      const osc = audio.createOscillator();
      const g = audio.createGain();
      osc.type = v.type;
      osc.frequency.setValueAtTime(f * v.ratio * 1.55, t);
      osc.frequency.exponentialRampToValueAtTime(f * v.ratio, t + 0.08);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v.gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      osc.connect(g);
      g.connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    }
  } catch {
    // A sound must never break the toy.
  }
}
