"use client";

import { useEffect, useRef, useState } from "react";
import { MusicNotes, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react/ssr";
import { radio, radioElapsed, useRadio } from "@/components/gta6/useMusic";
import { countHud, cover, nowPlaying, PlayPause } from "@/components/gta6/radioParts";
import { clock } from "@/lib/gta6/radio";
import Radio from "@/components/gta6/Radio";
import s from "@/components/gta6/game/game.module.css";

/** How often the elapsed time reads the player while it plays. */
const ELAPSED_EVERY = 1000; // ms

/**
 * Vice FM in the game's HUD, top left beside the time switch (owner,
 * 2026-11-21). By default the minimised controller: a spinning disc with
 * the current cover (still when paused, and under reduced motion),
 * play/pause, "Title · Artist", the elapsed time and mute. Hovering it
 * drops the full card A (`Radio`, with the track list) below it; a click on
 * the disc pins that card open until the disc is clicked again or a click
 * lands outside. The card mounts only while shown.
 *
 * It is the live region while it is mounted (`countHud`), so the hero
 * pill under the overlay does not announce as well.
 */
export default function HudRadio() {
  const r = useRadio();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    countHud(1);
    return () => countHud(-1);
  }, []);

  // A click anywhere else unpins it.
  useEffect(() => {
    if (!pinned) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setPinned(false);
    };
    document.addEventListener("pointerdown", away, true);
    return () => document.removeEventListener("pointerdown", away, true);
  }, [pinned]);

  // Elapsed: read at once on every change of track, then once a second
  // while playing; paused, it holds. No player (automation) reads 0.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const read = () => setElapsed(radioElapsed());
    const first = window.setTimeout(read, 0);
    const every = r.playing ? window.setInterval(read, ELAPSED_EVERY) : undefined;
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, [r.playing, r.position]);

  if (r.unavailable) {
    return (
      <div role="status" className={`${s.radio} ${s.glass}`}>
        <span className={`${s.disc} ${s.discOff}`} title="Radio unavailable">
          <MusicNotes aria-hidden weight="fill" />
          <span className="sr-only">Radio unavailable</span>
        </span>
      </div>
    );
  }

  const { id, title, artist } = nowPlaying(r);
  const spinning = !r.paused && !r.blocked;

  return (
    <div
      ref={root}
      data-radio=""
      data-track={id}
      className={`${s.radio} ${s.glass}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-label="Vice FM radio"
        title="Vice FM radio"
        aria-expanded={open}
        onClick={() => setPinned((p) => !p)}
        className={s.disc}
        data-spin={spinning ? "" : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube cover thumbnail; next/image adds nothing here */}
        <img src={cover(id)} alt="" decoding="async" />
      </button>
      <div className={s.mini}>
        <PlayPause r={r} className={s.miniButton} />
        <span
          data-radio-title=""
          aria-live="polite"
          title={artist ? `${title}, ${artist}` : title}
          className={s.miniTrack}
        >
          {title}
          {artist && <span> · {artist}</span>}
        </span>
        <span aria-label={`Elapsed ${clock(elapsed)}`} className={`${s.miniTime} ${s.mono}`}>
          {clock(elapsed)}
        </span>
        <button
          type="button"
          aria-label={r.muted ? "Unmute" : "Mute"}
          aria-pressed={r.muted}
          title={r.muted ? "Unmute" : "Mute"}
          onClick={radio.toggleMute}
          className={s.miniButton}
        >
          {r.muted ? <SpeakerSlash aria-hidden weight="fill" /> : <SpeakerHigh aria-hidden weight="fill" />}
        </button>
      </div>
      {open && (
        // Its padding bridges the gap, so the hover holds on the way down.
        <div className={s.radioCard}>
          <Radio />
        </div>
      )}
    </div>
  );
}
