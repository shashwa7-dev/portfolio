"use client";

import { CLACK_MIN_SPEED } from "@/lib/starter-pack/bubbles";
import { getAudioContext as getAudio } from "@/components/common/audioContext";

/**
 * The billiard clack when two bubbles knock together: a real recording,
 * "billiard ball clack" by Za-Games (Freesound 539854, CC0), 0.29 s.
 *
 * It is only loaded after the visitor first presses the card (`primeClack`),
 * so the page never fetches it up front and nothing sounds before they touch
 * it. Louder for harder hits, silent for soft touches, and rate-limited so a
 * pile-up never turns into a rattle. Every failure is a silent no-op.
 */
const SRC = "/starter-pack/sounds/clack.mp3";
const LOUDEST_AT = 700; // px/s
const GAIN = { min: 0.05, max: 0.35 };
const MIN_GAP = 0.045; // s between clacks
const BURST = { window: 0.18, max: 3 }; // at most 3 clacks in any 0.18 s

let buffer: AudioBuffer | null = null;
let loading = false;
const recent: number[] = [];

/**
 * Call from every press and release on the card. Each call is inside a user
 * gesture, so it can wake a suspended AudioContext (iOS only lets a context
 * start from a tap's release, not its touch-start); the first call also
 * starts loading the clip.
 */
export function primeClack(): void {
  const audio = getAudio();
  if (!audio || buffer || loading) return;
  loading = true;
  fetch(SRC)
    .then((r) => r.arrayBuffer())
    .then((data) => audio.decodeAudioData(data))
    .then((b) => {
      buffer = b;
    })
    .catch(() => {})
    .finally(() => {
      loading = false;
    });
}

export function playClack(speed: number): void {
  try {
    if (!buffer || speed < CLACK_MIN_SPEED) return;
    const audio = getAudio();
    if (!audio) return;
    const t = audio.currentTime;
    while (recent.length && t - recent[0] > BURST.window) recent.shift();
    if (recent.length >= BURST.max || (recent.length && t - recent[recent.length - 1] < MIN_GAP)) return;
    recent.push(t);

    const k = Math.min(1, (speed - CLACK_MIN_SPEED) / (LOUDEST_AT - CLACK_MIN_SPEED));
    const src = audio.createBufferSource();
    const g = audio.createGain();
    src.buffer = buffer;
    // A touch of pitch variety so repeated clacks don't sound copied.
    src.playbackRate.value = 0.94 + Math.random() * 0.12;
    g.gain.value = GAIN.min + (GAIN.max - GAIN.min) * k;
    src.connect(g);
    g.connect(audio.destination);
    src.start(t);
  } catch {
    // A sound must never break the toy.
  }
}
