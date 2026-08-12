import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** "marker" = rough brush stroke, "line" = thin clean line */
  variant?: "marker" | "line";
  /** No-op. Kept for caller compatibility (lib/markerHighlight.tsx, MarkerLink.tsx) now that the draw-on animation is gone. */
  delay?: number;
  className?: string;
};

// Slightly rough hand-drawn stroke vs. a clean straight line.
const PATHS = {
  marker: "M2 7 C 70 3, 150 9, 230 5 S 340 8, 398 4",
  line: "M0 5 L 400 5",
} as const;

const STROKE_WIDTH = { marker: 5, line: 2 } as const;

/** Inline text with a static underline wash. Points at the contact address in the hero lede. */
export default function Marker({
  children,
  variant = "marker",
  className,
}: Props) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 400 10"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.06em] left-0 h-[0.42em] w-full overflow-visible"
      >
        <path
          d={PATHS[variant]}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth={STROKE_WIDTH[variant]}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
