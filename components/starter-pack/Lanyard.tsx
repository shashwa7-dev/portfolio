import type { Ref } from "react";
import s from "./StarterPack.module.css";

/**
 * The strap and its clip. Paths are written by the simulation hook. When
 * `slit` is given, the strap comes out of a cut in the page there: the dark
 * opening is drawn under the strap and the cut's lower lip over it, so the
 * strap reads as passing through the page.
 */
export default function Lanyard({
  slit,
  edgeRef,
  fillRef,
  stitchRef,
  clipRef,
}: {
  slit: { x: number; y: number } | null;
  edgeRef: Ref<SVGPathElement>;
  fillRef: Ref<SVGPathElement>;
  stitchRef: Ref<SVGPathElement>;
  clipRef: Ref<SVGGElement>;
}) {
  return (
    <svg className={s.rope} aria-hidden>
      {slit && (
        <g transform={`translate(${slit.x} ${slit.y})`}>
          <rect className={s.slitShade} x={-26} y={-9} width={52} height={14} rx={7} />
          <rect className={s.slitHole} x={-21} y={-5} width={42} height={9} rx={4.5} />
        </g>
      )}
      <path ref={edgeRef} fill="none" stroke="#17151c" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" />
      <path ref={fillRef} className={s.ropeFill} fill="none" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <path ref={stitchRef} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="6 5" opacity={0.85} />
      {slit && (
        <path
          className={s.slitLip}
          d={`M${slit.x - 21} ${slit.y + 1.5} Q${slit.x} ${slit.y + 6} ${slit.x + 21} ${slit.y + 1.5}`}
        />
      )}
      <g ref={clipRef}>
        <rect x={-7} y={-22} width={14} height={16} rx={3} fill="#b9c0cb" stroke="#17151c" strokeWidth={2.5} />
        <circle cx={0} cy={0} r={9} fill="none" stroke="#17151c" strokeWidth={7} />
        <circle cx={0} cy={0} r={9} fill="none" stroke="#c9cfd8" strokeWidth={3.5} />
      </g>
    </svg>
  );
}
