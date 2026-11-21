"use client";

import { Star } from "@phosphor-icons/react/ssr";
import type { Kills, Kind } from "@games/vice-hunt";
import type { TimeOfDay } from "@/lib/gta6/timeOfDay";
import RadioSlot from "@/components/gta6/game/RadioSlot";
import s from "@/components/gta6/game/game.module.css";

export type TimeChoice = TimeOfDay | "auto";

const TIMES: { value: TimeChoice; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
  { value: "auto", label: "Auto" },
];

export const KINDS: { kind: Kind; name: string }[] = [
  { kind: "rabbit", name: "Rabbits" },
  { kind: "iguana", name: "Iguanas" },
  { kind: "flamingo", name: "Flamingos" },
  { kind: "bigfoot", name: "Bigfoot" },
];

const STARS = [0, 1, 2, 3, 4];
/** Chamber centres round the cylinder, in percent of its box, from the top. */
function chambers(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
    return { left: `${50 + Math.cos(a) * 34}%`, top: `${50 + Math.sin(a) * 34}%` };
  });
}

type Props = {
  /** Slid in from the edges (play and results); out of view for the entry. */
  shown: boolean;
  kills: Kills;
  rounds: number;
  /** The revolver's chambers (the package's `ROUNDS`). */
  capacity: number;
  reloading: boolean;
  time: TimeChoice;
  onTime(choice: TimeChoice): void;
  icons: Record<Kind, string>;
};

/**
 * Layout A: radio top left, time switch top centre, the wanted stars and big
 * kill counts top right, the six-round cylinder bottom right and the key
 * hint bottom centre. Only the radio and the switch take the pointer; the
 * rest lets shots through to the game.
 */
export default function Hud({ shown, kills, rounds, capacity, reloading, time, onTime, icons }: Props) {
  return (
    <div className={s.hud} data-in={shown ? "" : undefined}>
      <div className={s.radio}>
        <RadioSlot />
      </div>

      <div role="group" aria-label="Time of day" className={`${s.time} ${s.glass} ${s.mono}`}>
        {TIMES.map((t) => (
          <button key={t.value} type="button" aria-pressed={time === t.value} onClick={() => onTime(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={`${s.kills} ${s.display}`}>
        <div role="img" aria-label="Wanted: five stars" className={s.stars}>
          {STARS.map((n) => (
            <Star key={n} aria-hidden weight="fill" />
          ))}
        </div>
        {KINDS.map(({ kind, name }) => (
          <div key={kind} className={s.row}>
            <small>{name.toUpperCase()}</small>
            {/* eslint-disable-next-line @next/next/no-img-element -- a sprite data URL from the game package */}
            <img src={icons[kind]} alt="" />
            <b aria-label={`${name}: ${kills[kind]}`}>{kills[kind]}</b>
          </div>
        ))}
      </div>

      <div
        role="img"
        aria-label={reloading ? "Reloading" : `${rounds} of ${capacity} rounds`}
        className={`${s.ammo} ${s.glass}`}
      >
        <div className={s.cylinder} data-reloading={reloading ? "" : undefined}>
          {chambers(capacity).map((c, i) => (
            <i key={i} style={c} data-empty={i >= rounds ? "" : undefined} />
          ))}
        </div>
        <span className={`${s.count} ${s.display}`}>
          {rounds}
          <span> / {capacity}</span>
        </span>
      </div>

      <div className={`${s.hint} ${s.glass} ${s.mono}`}>ESC EXIT · R RELOAD</div>
    </div>
  );
}
