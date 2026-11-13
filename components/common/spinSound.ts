"use client";

import { getAudioContext, peekAudioContext } from "./audioContext";

/**
 * The fidget spinner's sounds (SpinAvatar): a soft flick on each click, a
 * light bearing tick every half turn that slows and fades with the spin, and
 * a small click when it settles upright.
 *
 * Synthesised the same way as the dice (card/dice/diceSound.ts): a few
 * milliseconds of white noise through a bandpass filter. No audio file to
 * host or decode. The shared context (./audioContext.ts) is created lazily on the first click, inside
 * a user gesture, never at module scope (there is no AudioContext on the
 * server). Every failure is a silent no-op: a sound must never break the toy.
 */

type Kind = "flick" | "tick" | "settle";

const VOICES: Record<Kind, { frequency: number; gain: number; seconds: number }> = {
  flick: { frequency: 900, gain: 0.07, seconds: 0.04 },
  tick: { frequency: 2600, gain: 0.05, seconds: 0.012 },
  settle: { frequency: 1300, gain: 0.06, seconds: 0.02 },
};


/** `level` (0 to 1) scales the voice's gain, so ticks fade as the spin slows. */
export function playSpinSound(kind: Kind, level = 1): void {
  try {
    const audio = getAudioContext();
    if (!audio) return;
    const { frequency, gain, seconds } = VOICES[kind];
    const now = audio.currentTime;

    const frames = Math.max(1, Math.round(audio.sampleRate * seconds));
    const buffer = audio.createBuffer(1, frames, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const source = audio.createBufferSource();
    source.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 1.2;
    const amp = audio.createGain();
    amp.gain.setValueAtTime(Math.max(gain * level, 0.0002), now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

    source.connect(filter).connect(amp).connect(audio.destination);
    source.start(now);
    source.stop(now + seconds);
  } catch {
    /* Web Audio unsupported or blocked: stay silent. */
  }
}

/**
 * Routes a media element's sound through the shared context behind a gain
 * node, so it can fade smoothly: iOS ignores `.volume` on media elements,
 * which would turn any fade into a hard cut. Call it from inside a user
 * gesture, after a flick has created the context. An element can only be
 * routed once, so the caller keeps the returned node.
 */
export function routeThroughGain(el: HTMLMediaElement): GainNode | null {
  try {
    const audio = getAudioContext();
    if (!audio) return null;
    const amp = audio.createGain();
    audio.createMediaElementSource(el).connect(amp).connect(audio.destination);
    return amp;
  } catch {
    return null;
  }
}

const samples = new Map<string, Promise<AudioBuffer | null>>();

/**
 * Fetches and decodes an audio file once, into the shared context. Repeat
 * calls share the first request; a failed load is forgotten so a later call
 * can retry. Resolves to null when there is no context or the load fails.
 */
export function loadSample(url: string): Promise<AudioBuffer | null> {
  const audio = getAudioContext();
  if (!audio) return Promise.resolve(null);
  let pending = samples.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((bytes) => audio.decodeAudioData(bytes))
      .catch(() => {
        samples.delete(url);
        return null;
      });
    samples.set(url, pending);
  }
  return pending;
}

/**
 * Plays a decoded sample once at `gain`. Returns the source, so the caller can
 * stop it and hear `onended`, or null when nothing could play. Each call is a
 * new voice: guarding against overlaps is the caller's job.
 */
export function playSample(buffer: AudioBuffer, gain: number): AudioBufferSourceNode | null {
  try {
    const audio = getAudioContext();
    if (!audio) return null;
    const source = audio.createBufferSource();
    source.buffer = buffer;
    const amp = audio.createGain();
    amp.gain.value = gain;
    source.connect(amp).connect(audio.destination);
    source.start();
    return source;
  } catch {
    return null;
  }
}

/** The context's clock, for scheduling gain ramps. */
export function audioNow(): number {
  return peekAudioContext()?.currentTime ?? 0;
}
