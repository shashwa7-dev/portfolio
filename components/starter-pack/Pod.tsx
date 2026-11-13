import type { PodDef } from "@/lib/starter-pack/config";
import s from "./StarterPack.module.css";

/** Card px between the blister's face (24px up) and the card. */
const WALL_STEPS = [3, 6, 9, 12, 15, 18, 21];

/**
 * The blister's moulded side wall: rings of clear plastic stepping down from
 * its face to the card, so as the card tilts and swings you see real depth
 * at the edges. Each ring sits a little lower in 3D. Also carries the soft
 * pill glint on the blister's face.
 */
export function Walls() {
  return (
    <span className={s.walls} aria-hidden>
      {WALL_STEPS.map((d) => (
        <i key={d} style={{ transform: `translateZ(-${d}px)` }} />
      ))}
      <b className={s.glint} />
    </span>
  );
}

/** One ESSENTIALS pod: the drawing sits behind the plastic. Positions in card pixels. */
export default function Pod({ pod, left, top }: { pod: PodDef; left: number; top: number }) {
  return (
    <div className={`${s.z} ${s.pod}`} style={{ left, top, width: 104, height: 112 }}>
      <Walls />
      <div className={`${s.item} ${s.label}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny SVG inside a 3D layer; next/image adds nothing here */}
        <img className={s.art} src={pod.art} alt="" draggable={false} loading="lazy" decoding="async" />
        {pod.label}
      </div>
    </div>
  );
}
