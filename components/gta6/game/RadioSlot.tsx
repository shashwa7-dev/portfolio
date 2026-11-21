"use client";

import { MusicNotes } from "@phosphor-icons/react/ssr";
import s from "@/components/gta6/game/game.module.css";

/**
 * The HUD's radio corner, top left. A stand-in until the radio card (task 11)
 * takes this place; it only names the station.
 */
export default function RadioSlot() {
  return (
    <div className={`${s.glass} ${s.radioSlot} ${s.mono}`}>
      <MusicNotes aria-hidden weight="fill" className="h-3.5 w-3.5" />
      VICE FM
    </div>
  );
}
