"use client";

import { useEffect, useRef } from "react";
import ControlsNotch from "@/components/gta6/game/ControlsNotch";
import s from "@/components/gta6/game/game.module.css";

type Props = {
  onResume(): void;
  /** End the round: the results card. */
  onEnd(): void;
  onBack(): void;
};

/**
 * The pause menu (Esc or right click during play). The hunt is frozen under
 * it by GameMode. "Paused" in cyan neon over three chrome buttons; the
 * focused (or hovered) one lights cyan, Resume first. Esc anywhere in it
 * resumes, and is marked done, so the game's own listener (which ignores Esc
 * inside a dialog anyway) never reads the same press as a new pause.
 */
export default function Pause({ onResume, onEnd, onBack }: Props) {
  const resume = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    resume.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paused"
      className={s.pause}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        onResume();
      }}
    >
      <div className={s.pauseMenu}>
        <p className={`${s.pauseTitle} ${s.neonCyan}`}>Paused</p>
        <button ref={resume} type="button" onClick={onResume} className={`${s.chrome} ${s.chromeDark}`}>
          <span>Resume</span>
        </button>
        <button type="button" onClick={onEnd} className={`${s.chrome} ${s.chromeDark}`}>
          <span>End round</span>
        </button>
        <button type="button" onClick={onBack} className={`${s.chrome} ${s.chromeDark}`}>
          <span>Back to site</span>
        </button>
      </div>
      <ControlsNotch items={[{ key: "ESC", label: "Resume" }]} />
    </div>
  );
}
