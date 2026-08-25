"use client";

import { useId } from "react";

type PlaceholderCardProps = {
  /** The reserved slot's own box, in CSS pixels: CardMinter's SLOT_CARD_W and
   *  SLOT_CARD_H. Every coordinate below is a fraction of these, mirroring
   *  how lib/card/ticket.ts derives its own layout from `w`/`h`, so the
   *  sketch stays in the real card's proportions if the slot's size ever
   *  changes. The rendered SVG itself fills its parent (see the `svg`
   *  below): these two numbers only feed the internal viewBox math. */
  width: number;
  height: number;
  className?: string;
};

/** A short deterministic sine wave from (x0, y) to (x1, y), sampled into a
 *  polyline. Stands in for a line of handwriting or type without drawing
 *  either: `cycles` and `amp` are fixed at each call site below, never
 *  derived from a visitor, a roll, or an issue. */
function wavePath(x0: number, x1: number, y: number, cycles: number, amp: number): string {
  const steps = cycles * 8;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const yy = y + Math.sin(t * cycles * Math.PI * 2) * amp;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${yy.toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Two overlapping irregular loops around (cx, cy): a scribble standing in
 *  for a portrait, unmistakably not a face. Both loops are fixed angle/
 *  radius offsets, never a circle (too clean) and never anything derived
 *  from an actual likeness. Identical for every visitor, every time. */
function scribblePath(cx: number, cy: number, r: number): string {
  const loop = (offsets: readonly number[], rot: number) => {
    const n = offsets.length;
    const pts = offsets.map((o, i) => {
      const angle = (i / n) * Math.PI * 2 + rot;
      return [cx + Math.cos(angle) * r * o, cy + Math.sin(angle) * r * o] as const;
    });
    const [first, ...rest] = pts;
    return (
      `M${first[0].toFixed(1)} ${first[1].toFixed(1)} ` +
      rest.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") +
      " Z"
    );
  };
  const outer = loop([1, 0.72, 1.12, 0.78, 1.05, 0.68, 1.1, 0.82], 0);
  const inner = loop([0.55, 0.82, 0.5, 0.76, 0.58, 0.8], Math.PI / 5);
  return `${outer} ${inner}`;
}

/**
 * The front deck card's stand-in until three rolls land: a hand-sketched
 * rectangle in the real card's own proportions (a stamp with a perforated
 * edge, a scribble where the portrait goes, a wavy name, a torn stub with
 * a couple of wavy rows beneath it) so the reserved slot reads as "a card
 * is coming" instead of an empty box.
 *
 * Identical for every visitor: every path here comes from a fixed fraction
 * of `width`/`height` or a fixed constant. Nothing reads the roll, the
 * visitor id, or any issue, so nothing about the sketch can hint at what
 * is about to print, and reduced motion never applies since none of this
 * animates.
 *
 * Drawn once, as SVG: lib/card/ owns the one drawing routine (drawTicket)
 * for the real card, and this never touches it.
 */
export default function PlaceholderCard({ width, height, className }: PlaceholderCardProps) {
  // Collision-proof filter id: the issue gallery renders several cards (and
  // TossDice's own wobble filter) on one page, and <defs> ids are global to
  // the document. Same approach TossDice takes for the same reason.
  const uid = useId().replace(/:/g, "");
  const wobbleId = `card-sketch-wobble-${uid}`;

  // The stamp, at the same fractions of the card lib/card/ticket.ts uses:
  // TOP clears the brand row, sx/sy/sw/sh place the stamp within it.
  const TOP = height * 0.038;
  const sx = width * 0.202;
  const sy = TOP + height * 0.101;
  const sw = width * 0.597;
  const sh = height * 0.507;

  // The portrait box, at the same fractions of the stamp ticket.ts's own
  // `pBox` uses.
  const px = sx + sw * 0.12;
  const py = sy + sh * 0.06;
  const pw = sw * 0.76;
  const ph = sh * 0.72;
  const pcx = px + pw / 2;
  const pcy = py + ph / 2;
  const pr = Math.min(pw, ph) / 2;

  // The tear line, at the same fraction up from the bottom edge ticket.ts
  // anchors it to.
  const tearY = height - height * 0.218;

  // The name's wavy stand-in, centred in the band between the stamp's foot
  // and the tear line: the same band the handwritten name occupies for real.
  const nameY = sy + sh + (tearY - (sy + sh)) / 2;

  // The stub rows below the tear line, at the same three fractions up from
  // the bottom edge as the label row, the value row and the odds row.
  const stubRow1 = height - height * 0.152;
  const stubRow2 = height - height * 0.107;
  const stubRow3 = height - height * 0.042;

  const L = width * 0.097;
  const Rt = width * 0.903;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <filter id={wobbleId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
        </filter>
      </defs>

      {/* Muted throughout: border/subtle tokens only, no accent colour, so
          the sketch recedes rather than competing with the real card that
          replaces it. currentColor + a text-* className is the same trick
          components/shelf/CoffeeFigures.tsx uses to theme inline SVG,
          which is why this needs no dark-mode branch of its own: --subtle
          already has both. */}
      <g
        filter={`url(#${wobbleId})`}
        className="text-subtle"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* The stamp: a rough rectangle with a scribbled perforated edge
            (the dashed outer pass) and a second, plain pass just inside it,
            the way the real stamp's perforation sits just outside its own
            inner rule. */}
        <rect x={sx} y={sy} width={sw} height={sh} strokeWidth="1.75" strokeDasharray="1 7" opacity="0.8" />
        <rect x={sx} y={sy} width={sw} height={sh} strokeWidth="1.25" />

        {/* The portrait: a scribbled blob, unmistakably not a face. */}
        <path d={scribblePath(pcx, pcy, pr)} strokeWidth="2" />

        {/* The name: one wavy line in handwriting's own band. */}
        <path
          d={wavePath(L + (Rt - L) * 0.18, Rt - (Rt - L) * 0.18, nameY, 6, 2)}
          strokeWidth="2.25"
        />

        {/* The tear line, full width. */}
        <path d={`M0 ${tearY} L${width} ${tearY}`} strokeWidth="1.5" strokeDasharray="7 6" opacity="0.6" />

        {/* The stub rows: short wavy lines standing in for the serial/issue
            labels and the odds line beneath the tear. */}
        <path d={wavePath(L, L + width * 0.16, stubRow1, 3, 1.2)} strokeWidth="1.5" opacity="0.7" />
        <path d={wavePath(L, L + width * 0.28, stubRow2, 4, 1.6)} strokeWidth="1.75" opacity="0.85" />
        <path d={wavePath(L, L + width * 0.22, stubRow3, 3, 1.4)} strokeWidth="1.75" opacity="0.85" />
      </g>
    </svg>
  );
}
