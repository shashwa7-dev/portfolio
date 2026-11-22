"use client";

import { useEffect, useRef } from "react";
import ControlsNotch from "@/components/gta6/game/ControlsNotch";
import s from "@/components/gta6/game/game.module.css";

type Props = {
  /** The start button was pressed: start the hunt. */
  onStart(): void;
};

/**
 * The title screen (spec 2026-11-22-vice-hunt-opening-pause-design.md). The
 * letterbox bars and the push-in are the overlay's own (`data-phase="entry"`);
 * this is the dusk tint, "VICE" in pink neon over "Hunt" in cyan neon script
 * (each flickers on once, then holds; a plain fade under reduced motion), the
 * start button and the controls notch. Nothing starts until the button is
 * pressed; Esc here is GameMode's (back to the site).
 */
export default function Entry({ onStart }: Props) {
  const start = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    start.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={s.title}>
      <div>
        <h1>
          <span className={`${s.titleVice} ${s.neonPink}`}>VICE</span>
          <span className={`${s.titleHunt} ${s.neonCyan}`}>Hunt</span>
        </h1>
        <button ref={start} type="button" data-start="" onClick={onStart} className={`${s.chrome} ${s.chromePink}`}>
          <span>CLICK TO START</span>
        </button>
      </div>
      <ControlsNotch
        items={[
          { key: "mouse", label: "Shoot" },
          { key: "R", label: "Reload" },
          { key: "ESC", label: "Pause" },
        ]}
      />
    </div>
  );
}
