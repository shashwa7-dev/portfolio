"use client";

import { useEffect, useRef, useState } from "react";
import type { TimeOfDay } from "@/lib/gta6/timeOfDay";
import { startTraffic } from "@/components/gta6/scene/traffic";
import s from "@/components/gta6/scene/scene.module.css";

const WALLPAPERS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];

/** Deck lights every 4.5% along the bridge's lane, from 2% to 96.5%. */
const DECK_LIGHTS = Array.from({ length: 22 }, (_, i) => 2 + i * 4.5);

/** The bar's LED string: a sagging curve (viewBox 0 0 100 40), cycling three tints. */
const LEDS = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  const x = 2 + 96 * t;
  // The quadratic from (2, 8) through control (50, 38) to (98, 8).
  const y = 8 + 2 * t * (1 - t) * 30;
  return { x, y, fill: ["#fff3c4", "#ffd6e6", "#cdf4ff"][i % 3], delay: [1, 2, 0][i % 3] };
});

const LAMP_POSTS = [
  { left: "30%", bottom: "24%" },
  { left: "62%", bottom: "25%" },
];

type Props = { time: TimeOfDay };

/**
 * Vice Hunt's beach, the game's backdrop (spec, revision 2): sky, clouds,
 * moon and stars, the sea with an evening sun shimmer, a sailboat, the
 * bridge with fog, cars and lights, the billboard behind it showing the
 * wallpaper slideshow, the sand and props, two lamp posts and the bar's LED
 * string. Static apart from its ambient loops; `time` picks the look, and a
 * change fades over `--duration-gta-time-fade`. Decoration only.
 *
 * Reached only through the lazy GTA chunk: never import it from a server
 * component.
 */
export default function BeachScene({ time }: Props) {
  const lane = useRef<HTMLDivElement>(null);
  const firstWall = useRef<HTMLImageElement>(null);
  // The other twelve wallpapers, mounted once the first has loaded (never
  // under reduced motion, which shows the first alone).
  const [allWalls, setAllWalls] = useState(false);

  useEffect(() => {
    if (!lane.current) return;
    return startTraffic(lane.current, { runner: s.runner, car: s.car, head: s.head, tail: s.tail });
  }, []);

  const showAllWalls = () => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAllWalls(true);
  };
  // The first may have loaded from cache before the handler could see it.
  useEffect(() => {
    if (firstWall.current?.complete) showAllWalls();
  }, []);

  return (
    <div className={s.scene} data-time={time} aria-hidden>
      <div className={`${s.layer} ${s.sky}`} />
      <div className={s.night} />
      <div className={s.stars} />
      <div className={s.moon} />
      <div className={s.skyTint} />
      <div className={`${s.layer} ${s.cloud}`} />

      <div className={s.bridge}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a stretched SVG backdrop; next/image adds nothing here */}
        <img src="/gta6/beach/bridge.svg" alt="" />
      </div>
      <div className={s.sunGlow} />
      <div className={s.boat}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a small decorative sprite; next/image adds nothing here */}
        <img src="/gta6/beach/sailboat.webp" alt="" decoding="async" />
        <i className={s.wake} />
        <i className={s.boatLight} />
      </div>
      <div ref={lane} className={s.traffic} />
      <div className={s.bridgeLights}>
        <i className={s.towerLight} style={{ left: "26%", top: "7%" }} />
        <i className={s.towerLight} style={{ left: "72%", top: "7%" }} />
        {DECK_LIGHTS.map((x) => (
          <i key={x} className={s.deckLight} style={{ left: `${x}%`, top: "75%" }} />
        ))}
      </div>
      <div className={s.haze} />
      <div className={s.fog}>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className={s.billboard}>
        <div className={s.lamps}>
          <i />
          <i />
          <i />
        </div>
        <div className={s.bulbs}>
          <b />
          <b />
          <b />
        </div>
        <div className={s.board}>
          {WALLPAPERS.map((n, i) =>
            i === 0 || allWalls ? (
              // eslint-disable-next-line @next/next/no-img-element -- art fetched only when the game opens; next/image adds nothing here
              <img
                key={n}
                ref={i === 0 ? firstWall : undefined}
                src={`/gta6/wallpapers/${n}.webp`}
                alt=""
                decoding="async"
                onLoad={i === 0 ? showAllWalls : undefined}
                data-cycle={allWalls ? "" : undefined}
                style={{ "--i": i } as React.CSSProperties}
                className={s.wall}
              />
            ) : null,
          )}
          <span className={s.tag}>VI</span>
          <div className={s.dim} />
          <div className={s.wash} />
        </div>
        <div className={s.legs}>
          <i>
            <span className={s.ripple} />
          </i>
          <i>
            <span className={s.ripple} />
          </i>
        </div>
      </div>

      <div className={`${s.layer} ${s.sea}`} />
      <div className={`${s.layer} ${s.land}`} />
      <div className={`${s.layer} ${s.props}`} />

      {LAMP_POSTS.map((p) => (
        <div key={p.left} className={s.lamp} style={p}>
          <div className={s.cone} />
          <div className={s.shadow} />
          <div className={s.mound} />
          <div className={s.pole} />
          <div className={s.base} />
          <div className={s.lampHead} />
          <div className={s.bulb} />
          <div className={s.pool} />
        </div>
      ))}
      <div className={s.barLight} />
      <div className={s.leds}>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d="M2 8 Q50 38 98 8" stroke="#3a2a22" strokeWidth=".7" fill="none" vectorEffect="non-scaling-stroke" />
          {LEDS.map((d) => (
            <circle key={d.x} cx={d.x} cy={d.y} r={1.4} fill={d.fill} style={{ animationDelay: `${d.delay}s` }} />
          ))}
        </svg>
      </div>
    </div>
  );
}
