"use client";

import { getMuted } from "@/components/card/dice/soundPreference";

/**
 * Synthesised dice sounds: a ~30ms burst of white noise through a bandpass
 * filter, one voice per moment a throw passes through. Restores the owner's
 * own earlier `click()` helper from before the toss became a shared skin.
 * No audio asset to host, license or decode: the noise is generated on the
 * fly, which is also why a decoder failure can never be one of the ways
 * this fails.
 *
 * Not in lib/card/: that directory is DOM-free by rule (its pure modules
 * carry vitest coverage against exactly that constraint) and every export
 * here touches AudioContext.
 *
 * The context is created lazily, the first time playTick actually runs.
 * That first call is always "press", fired synchronously from inside the
 * pill's own click handler in useDiceRoll.ts, so construction happens
 * inside a real user gesture rather than at module scope, which would run
 * during SSR (no AudioContext exists there) and fail the build outright.
 * "land" and "settle" only ever follow "press" by a short setTimeout, by
 * which point the context already exists and is already running.
 */

type TickKind = "press" | "land" | "settle";

const VOICES: Record<TickKind, { frequency: number; gain: number }> = {
  press: { frequency: 1500, gain: 0.12 },
  land: { frequency: 900, gain: 0.16 },
  settle: { frequency: 1300, gain: 0.11 },
};

const DURATION_S = 0.03;
const BANDPASS_Q = 1.1;

let ctx: AudioContext | null = null;

/** Reuses one context across every tick; only constructed on demand, and
 *  only where AudioContext actually exists (never on the server, and
 *  silently null on a browser old enough to lack it). Resumed if it comes
 *  back suspended, which is what Safari does until a gesture unlocks it. */
function getContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    return null;
  }
  if (!ctx) {
    ctx = new window.AudioContext();
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {
      /* still blocked; the tick below will just be silent this time */
    });
  }
  return ctx;
}

/**
 * Plays one of the three tick voices. Checked against getMuted() here,
 * at call time, so muting takes effect immediately without any flag
 * threaded into useDiceRoll: see soundPreference.ts.
 *
 * Wrapped the same way safeHaptic wraps navigator vibration in
 * useDiceRoll.ts: a missing AudioContext, a blocked autoplay policy, or any
 * other Web Audio failure is a silent no-op, never an exception that costs
 * the visitor their roll.
 */
export function playTick(kind: TickKind): void {
  if (getMuted()) return;
  try {
    const audioCtx = getContext();
    if (!audioCtx) return;

    const { frequency, gain } = VOICES[kind];
    const now = audioCtx.currentTime;

    const frameCount = Math.max(1, Math.round(audioCtx.sampleRate * DURATION_S));
    const buffer = audioCtx.createBuffer(1, frameCount, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = BANDPASS_Q;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + DURATION_S);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    source.start(now);
    source.stop(now + DURATION_S);
  } catch {
    /* AudioContext unsupported, autoplay blocked, or some other Web Audio
       failure: never let a sound effect interrupt a throw. */
  }
}
