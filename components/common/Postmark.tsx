import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The "OPEN TO WORK" postmark on the hero stamp (AvatarHover). A round
 * cancellation mark with OPEN in the middle and two wavy cancel lines.
 *
 * Drawn in `currentColor` and printed with `mix-blend-mode: multiply`, like
 * ink on paper: it reads on the white of the photo and the stamp's margin, and
 * disappears into the dark hair rather than sitting on top of it. It is
 * decoration; the link's `sr-only` text and tooltip carry "Open to work".
 */
export default function Postmark({ className }: { className?: string }) {
  const arc = `${useId().replace(/:/g, "")}arc`;
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={cn("pointer-events-none font-mono", className)}>
      <defs>
        <path id={arc} d="M7.5 22 a14.5 14.5 0 1 1 29 0" />
      </defs>
      <circle cx={22} cy={22} r={17} fill="none" stroke="currentColor" strokeWidth={1} />
      <circle cx={22} cy={22} r={10.5} fill="none" stroke="currentColor" strokeWidth={0.6} />
      <text fontSize={4.3} fontWeight={700} fill="currentColor" letterSpacing={0.35}>
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
          OPEN TO WORK
        </textPath>
      </text>
      <text x={22} y={24.2} fontSize={5.6} fontWeight={800} fill="currentColor" textAnchor="middle" letterSpacing={0.3}>
        OPEN
      </text>
      <path d="M2 30 q3 -2 6 0 t6 0 M2 33.5 q3 -2 6 0 t6 0" fill="none" stroke="currentColor" strokeWidth={0.7} />
    </svg>
  );
}
