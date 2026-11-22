"use client";

import { useEffect, useRef, useState } from "react";
import type { Kind } from "@games/vice-hunt";
import type { Row } from "@/components/gta6/game/Hud";
import { rareCount } from "@/lib/gta6/hud";
import s from "@/components/gta6/game/game.module.css";

type Props = {
  /** The rares it lists: the enabled ones, in the registry's order. */
  rows: readonly Row[];
  /** Kinds hit at least once this round (the tally's). */
  met: readonly Kind[];
  hits: Record<Kind, number>;
  kills: Record<Kind, number>;
  icons: Record<Kind, string>;
  /** Bumped on every rare that comes on or is first hit: one glow each. */
  flash: number;
};

/**
 * "RARE n / 5" at the header's right (layout C): how many of the rares the
 * player has met, out of the enabled ones (the spec's six, less the tiger
 * while it is off). Hovering it with a mouse drops the list below it; a click
 * pins the list open (so a keyboard can open it too) until it is clicked
 * again, a press lands outside, or Esc. Each row: icon, name, count (kills;
 * hits, in red, for a creature that cannot be killed, the cow). An unmet
 * rare is a dark silhouette, "???" and 0. The list mounts only while shown.
 */
export default function RareMenu({ rows, met, hits, kills, icons, flash }: Props) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;
  const root = useRef<HTMLDivElement>(null);
  const n = rareCount(met, (kind) => rows.some((r) => r.kind === kind));

  // A press anywhere else unpins it.
  useEffect(() => {
    if (!pinned) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setPinned(false);
    };
    document.addEventListener("pointerdown", away, true);
    return () => document.removeEventListener("pointerdown", away, true);
  }, [pinned]);

  return (
    <div
      ref={root}
      className={s.rare}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        e.preventDefault(); // handled: Esc closes the list, not the game
        setPinned(false);
        setHovered(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Rare creatures met: ${n} of ${rows.length}`}
        onClick={() => setPinned((p) => !p)}
        className={`${s.rareButton} ${s.glass} ${s.display}`}
      >
        {/* A new key replays the glow. */}
        <span key={flash} aria-hidden className={s.rareGlow} data-on={flash > 0 ? "" : undefined} />
        RARE <b>{n}</b>
        <span> / {rows.length}</span>
      </button>
      {open && (
        // Its padding bridges the gap, so the hover holds on the way down.
        <div className={s.rareCard}>
          <ul className={s.glass}>
            {rows.map(({ kind, name, byHits }) => {
              const seen = met.includes(kind);
              return (
                <li key={kind} data-met={seen ? "" : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a sprite data URL from the game package */}
                  <img src={icons[kind]} alt="" />
                  <span>{seen ? name : "???"}</span>
                  <b className={s.display} data-hits={seen && byHits ? "" : undefined}>
                    {seen ? (byHits ? hits[kind] : kills[kind]) : 0}
                    {seen && byHits && <span className="sr-only"> hits</span>}
                  </b>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
