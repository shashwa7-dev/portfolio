import type { PodDef } from "@/lib/starter-pack/config";
import s from "./StarterPack.module.css";

/** One ESSENTIALS pod: the drawing sits behind the plastic. Positions in card pixels. */
export default function Pod({ pod, left, top }: { pod: PodDef; left: number; top: number }) {
  return (
    <div className={`${s.z} ${s.pod}`} style={{ left, top, width: 104, height: 112 }}>
      <div className={`${s.item} ${s.label}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny SVG inside a 3D layer; next/image adds nothing here */}
        <img className={s.art} src={pod.art} alt="" draggable={false} loading="lazy" decoding="async" />
        {pod.label}
      </div>
    </div>
  );
}
