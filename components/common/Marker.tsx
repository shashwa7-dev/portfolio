"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** "marker" = rough brush stroke, "line" = thin clean line */
  variant?: "marker" | "line";
  /** seconds to wait after entering view before drawing */
  delay?: number;
  className?: string;
};

// Slightly rough hand-drawn stroke vs. a clean straight line.
const PATHS = {
  marker: "M2 7 C 70 3, 150 9, 230 5 S 340 8, 398 4",
  line: "M0 5 L 400 5",
} as const;

const STROKE_WIDTH = { marker: 5, line: 2 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Inline text with an underline that draws itself in when scrolled into view.
 * Auto-animates (no hover) and respects prefers-reduced-motion.
 */
export default function Marker({
  children,
  variant = "marker",
  delay = 0,
  className,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const drawn = reduce || inView;

  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        ref={ref}
        aria-hidden
        viewBox="0 0 400 10"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.06em] left-0 h-[0.42em] w-full overflow-visible"
      >
        <motion.path
          d={PATHS[variant]}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={STROKE_WIDTH[variant]}
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
          animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
          transition={{
            pathLength: { duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease: EASE },
            // snap visible exactly when the draw starts so no stray cap-dots show at rest
            opacity: { duration: 0.01, delay: reduce ? 0 : delay },
          }}
        />
      </svg>
    </span>
  );
}
