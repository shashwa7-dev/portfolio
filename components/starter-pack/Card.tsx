import type { Ref } from "react";
import { starterPack, type ThemeId } from "@/lib/starter-pack/config";
import BubblePod from "./BubblePod";
import Pod, { Walls } from "./Pod";
import Ticket from "./Ticket";
import s from "./StarterPack.module.css";

const POD_SPOTS: { left: number; top: number }[] = [
  { left: 226, top: 318 },
  { left: 344, top: 318 },
  { left: 226, top: 446 },
  { left: 344, top: 446 },
];

/**
 * The card face, static. Layer order matters: the plastic is drawn in front
 * of what it holds, every printed label sits under the plastic, and the lanyard
 * (in StarterPack) sits above all of it.
 */
export default function Card({
  theme,
  date,
  tiltRef,
  ballsRef,
}: {
  theme: ThemeId;
  date: string;
  tiltRef: Ref<HTMLElement>;
  ballsRef: Ref<HTMLDivElement>;
}) {
  const c = starterPack;
  return (
    <figure ref={tiltRef} className={`${s.card} ${theme === "sky" ? s.sky : s.cardStock}`}>
      <figcaption className={s.srOnly}>
        {`${c.title} ${c.subtitle}: a toy card of Shashwat. Shipped: ${c.bubbles.map((b) => b.name).join(", ")}. ${c.sideLabel}: ${c.pods.map((p) => p.label.toLowerCase()).join(", ")}. ${c.badge}.`}
      </figcaption>
      <div className={`${s.layer} ${s.castShadow}`} />
      {/* A couple of millimetres of board, not a thick slab. */}
      {[1.5, 3].map((d) => (
        <div key={d} className={`${s.layer} ${s.edge}`} style={{ transform: `translateZ(-${d}px)` }} />
      ))}
      <div className={`${s.layer} ${s.edge} ${s.edgeBack}`} style={{ transform: "translateZ(-4.5px)" }} />
      <div className={`${s.layer} ${s.face}`}>
        <div className={s.rays} />
        <div className={s.dots} />
        <div className={s.band} />
        <div className={s.rule} />
        <div className={s.sheen} />
      </div>

      <div className={`${s.z} ${s.tab}`} />
      <p className={`${s.z} ${s.title}`} aria-hidden>
        {c.title}
        <span className={s.subtitle}>{c.subtitle}</span>
      </p>
      <div className={`${s.z} ${s.stamp} ${s.label}`} aria-hidden>
        {c.stamp}
      </div>
      <div className={`${s.z} ${s.badge} ${s.label}`} aria-hidden>
        {c.badge}
      </div>
      <div className={`${s.z} ${s.side} ${s.label}`} aria-hidden>
        {c.sideLabel}
      </div>

      <div className={`${s.z} ${s.pod} ${s.figure}`}>
        <Walls />
      </div>
      <div className={`${s.z} ${s.mascotShadow}`} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- a blurred silhouette copy, decorative */}
        <img src={c.mascot.shadowSrc} alt="" draggable={false} loading="lazy" decoding="async" />
      </div>
      <div className={`${s.z} ${s.mascot}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- inside a 3D layer behind the plastic; already sized WebP */}
        <img src={c.mascot.src} alt={c.mascot.alt} width={130} height={410} draggable={false} loading="lazy" decoding="async" />
      </div>
      <div className={`${s.z} ${s.speech} ${s.label}`} aria-hidden>
        {c.greeting}
      </div>

      <div className={`${s.z} ${s.chip} ${s.label}`} aria-hidden>
        {c.shippedLabel}
      </div>
      <BubblePod bubbles={c.bubbles} hostRef={ballsRef} />
      {c.pods.slice(0, POD_SPOTS.length).map((p, i) => (
        <Pod key={p.id} pod={p} left={POD_SPOTS[i].left} top={POD_SPOTS[i].top} />
      ))}

      <div className={`${s.z} ${s.warn} ${s.label}`} aria-hidden>
        <span className={s.struck}>{c.warning.struck}</span>
        {c.warning.rest}
        <br />
        {c.warning.line2}
      </div>
      <Ticket url={c.ticket.url} qr={c.ticket.qr} tag={c.ticket.tag} digits={`${c.ticket.location} ${date}`} />
    </figure>
  );
}
