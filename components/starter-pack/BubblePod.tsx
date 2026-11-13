import type { Ref } from "react";
import type { BubbleDef } from "@/lib/starter-pack/config";
import s from "./StarterPack.module.css";

/**
 * The 'SHIPPED' pod. Renders one element per bubble; the simulation hook
 * finds them by `data-ball` and writes their transforms each frame. The
 * bubbles are a toy, not content: the card's caption lists the names.
 */
export default function BubblePod({ bubbles, hostRef }: { bubbles: BubbleDef[]; hostRef: Ref<HTMLDivElement> }) {
  return (
    <div className={`${s.z} ${s.pod} ${s.shippedPod}`}>
      <div className={s.balls} ref={hostRef} aria-hidden>
        {bubbles.map((b) => (
          <span key={b.id} className={s.ball} data-ball={b.id} style={{ width: b.r * 2, height: b.r * 2 }}>
            <span
              className={s.tex}
              style={{
                background: `${b.bg} url(${b.src}) center / ${b.fit === "contain" ? "78%" : "cover"} no-repeat`,
              }}
            />
            <span className={s.shine} />
          </span>
        ))}
      </div>
    </div>
  );
}
