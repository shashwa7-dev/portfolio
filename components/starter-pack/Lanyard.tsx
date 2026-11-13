import type { Ref } from "react";
import s from "./StarterPack.module.css";

/** The strap and its clip. Paths are written by the simulation hook. */
export default function Lanyard({
  edgeRef,
  fillRef,
  stitchRef,
  clipRef,
}: {
  edgeRef: Ref<SVGPathElement>;
  fillRef: Ref<SVGPathElement>;
  stitchRef: Ref<SVGPathElement>;
  clipRef: Ref<SVGGElement>;
}) {
  return (
    <svg className={s.rope} aria-hidden>
      <path ref={edgeRef} fill="none" stroke="#17151c" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" />
      <path ref={fillRef} className={s.ropeFill} fill="none" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <path ref={stitchRef} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="6 5" opacity={0.85} />
      <g ref={clipRef}>
        <rect x={-7} y={-22} width={14} height={16} rx={3} fill="#b9c0cb" stroke="#17151c" strokeWidth={2.5} />
        <circle cx={0} cy={0} r={9} fill="none" stroke="#17151c" strokeWidth={7} />
        <circle cx={0} cy={0} r={9} fill="none" stroke="#c9cfd8" strokeWidth={3.5} />
      </g>
    </svg>
  );
}
