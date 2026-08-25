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
 *
 * The reveal chime (playChime, below) is the one export here that is not
 * synthesised: a real 2.09s recording, played through a plain
 * HTMLAudioElement rather than routed through the AudioContext above.
 * Decoding through Web Audio would buy nothing for one file played
 * occasionally and would add a fetch-and-decode step the ticks never
 * needed; a plain element already gives play(), currentTime and .volume,
 * and browsers stream and cache it on their own.
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

const CHIME_SRC = "/audio/card-reveal.mp3";

/** Modest against the ticks' 0.11-0.16 gains: loud enough to read as the
 *  reveal's own sound, not loud enough to feel like a different product. */
const CHIME_VOLUME = 0.15;

let chime: HTMLAudioElement | null = null;

/** Constructed lazily, exactly like getContext() above: `typeof window`
 *  guards SSR (no Audio constructor exists there), and the element is
 *  built once and reused, so a rapid re-reveal restarts the same element
 *  rather than piling up new ones. `preload = "auto"` is set here, at
 *  construction, so whichever call constructs it first (see primeChime)
 *  starts the fetch immediately rather than waiting for the reveal itself. */
function getChime(): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof window.Audio === "undefined") {
    return null;
  }
  if (!chime) {
    chime = new window.Audio(CHIME_SRC);
    chime.preload = "auto";
    chime.volume = CHIME_VOLUME;
  }
  return chime;
}

/**
 * Primes the chime element so its fetch is already under way well before
 * any reveal is possible. Called once from useDiceRoll's "press" branch,
 * the first user gesture of a throw: three throws and a settle always
 * separate that from the reveal that follows, which is plenty of time for
 * 33KB to arrive even on a slow connection. Never throws: a construction
 * failure here just means playChime() finds nothing to play later.
 */
export function primeChime(): void {
  try {
    getChime();
  } catch {
    /* Audio unsupported; playChime will no-op the same way. */
  }
}

/**
 * Plays the reveal chime once, from the top. Checked against getMuted() at
 * call time, same as playTick, so muting takes effect immediately.
 *
 * Resets `currentTime` before every play() rather than tracking whether a
 * previous play is still running: calling play() on an element already
 * mid-playback just restarts it, which is exactly the "start over rather
 * than overlap" behaviour a rapid re-reveal needs, with no state of our own
 * to get out of sync.
 *
 * Wrapped the same way playTick wraps its own Web Audio calls: a missing
 * Audio implementation, a blocked autoplay policy, a failed decode of the
 * file itself, or a rejected play() promise are all silent no-ops. A
 * visitor's card must arrive whether or not the chime does.
 */
export function playChime(): void {
  if (getMuted()) return;
  try {
    const audio = getChime();
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* Autoplay blocked, or some other playback failure. */
    });
  } catch {
    /* Audio unsupported, or a synchronous throw from currentTime/play(). */
  }
}
