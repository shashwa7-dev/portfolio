"use client";

import { useState, type CSSProperties } from "react";
import { Heart } from "@phosphor-icons/react/ssr";
import { heartFills, heartsLabel } from "@/lib/gta6/hud";
import s from "@/components/gta6/game/game.module.css";

/**
 * The player's health, first in the header's left group: three hearts,
 * filled whole or by halves (the full heart is clipped over an empty one).
 * A drop replays a small jump (a new key restarts it); the red flash round
 * the screen's edges and the "−½ ♥" pop are GameMode's.
 */
export default function Hearts({ hearts }: { hearts: number }) {
  // Counts drops, adjusted while rendering (React's "previous props" pattern).
  const [prev, setPrev] = useState(hearts);
  const [drops, setDrops] = useState(0);
  if (hearts !== prev) {
    setPrev(hearts);
    if (hearts < prev) setDrops((n) => n + 1);
  }

  return (
    <div
      key={drops}
      role="img"
      aria-label={heartsLabel(hearts)}
      className={`${s.hearts} ${s.glass}`}
      data-jump={drops > 0 ? "" : undefined}
    >
      {heartFills(hearts).map((fill, i) => (
        <span key={i} className={s.heart} style={{ "--fill": fill } as CSSProperties}>
          <Heart aria-hidden weight="fill" />
          <Heart aria-hidden weight="fill" />
        </span>
      ))}
    </div>
  );
}
