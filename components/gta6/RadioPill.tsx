"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MusicNotes, X } from "@phosphor-icons/react/ssr";
import { useRadio } from "@/components/gta6/useMusic";
import { cover, nowPlaying, PlayPause, useHudOpen } from "@/components/gta6/radioParts";
import Radio from "@/components/gta6/Radio";
import s from "@/components/gta6/RadioPill.module.css";

type Props = {
  /** The ✕: leaves the mode. */
  onExit(): void;
  /** Goes between play/pause and the ✕: Vice Hunt's revolver, which styles
   *  itself. */
  children?: React.ReactNode;
};

/**
 * The hero's corner while the mode is on (M1): one slim dark pill holding a
 * spinning vinyl with the current cover, the track as "Title · Artist",
 * play/pause, then `children` (Vice Hunt's revolver) and the ✕. The vinyl
 * stops when paused, and under reduced motion.
 *
 * Clicking the vinyl opens the full card (`Radio variant="card"`) as a
 * popover under the pill. A click outside it, Esc from anywhere, or the
 * revolver or ✕ closes it. The track text is the live region while no HUD
 * radio is mounted.
 */
export default function RadioPill({ onExit, children }: Props) {
  const r = useRadio();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const vinyl = useRef<HTMLButtonElement>(null);
  const popId = useId();
  const hudOpen = useHudOpen();

  // While open: a click outside closes it, and so does Esc wherever focus
  // is, unless something (the card's track list) already handled it.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      setOpen(false);
      // Focus goes back to the vinyl only if it was in the popover.
      if (root.current?.contains(document.activeElement)) vinyl.current?.focus();
    };
    document.addEventListener("pointerdown", away, true);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away, true);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  // Starting the game or leaving the mode puts the popover away first. The
  // game is portalled out of this span, and React bubbles its clicks through
  // here too, so only clicks really inside count.
  const closeFromInside = (e: React.MouseEvent) => {
    if (e.currentTarget.contains(e.target as Node)) setOpen(false);
  };
  const extras = (
    <span className={s.extras} onClickCapture={closeFromInside}>
      {children}
      <button type="button" aria-label="Exit Vice City mode" title="Exit" onClick={onExit} className={s.button}>
        <X aria-hidden weight="bold" />
      </button>
    </span>
  );

  if (r.unavailable) {
    return (
      <div className={s.pill}>
        <span className={s.note}>
          <MusicNotes aria-hidden weight="fill" />
          Radio unavailable
        </span>
        {extras}
      </div>
    );
  }

  const { id, title, artist } = nowPlaying(r);
  const spinning = !r.paused && !r.blocked;

  return (
    <div ref={root} className={s.pill}>
      <button
        ref={vinyl}
        type="button"
        aria-label="Vice FM radio"
        title="Vice FM radio"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={s.vinyl}
        data-spin={spinning ? "" : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube cover thumbnail; next/image adds nothing here */}
        <img src={cover(id)} alt="" decoding="async" />
      </button>
      <span
        data-radio-title=""
        aria-live={hudOpen ? undefined : "polite"}
        title={artist ? `${title}, ${artist}` : title}
        className={s.track}
      >
        {title}
        {artist && <span> · {artist}</span>}
      </span>
      <PlayPause r={r} className={s.button} />
      {extras}
      {open && (
        <div id={popId} className={s.popover}>
          <Radio variant="card" />
        </div>
      )}
    </div>
  );
}
