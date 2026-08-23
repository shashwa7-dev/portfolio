import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

// Slightly rough, so it reads as drawn rather than as a text-decoration rule.
const PATH = "M2 7 C 70 3, 150 9, 230 5 S 340 8, 398 4";

/**
 * Inline text with a static underline wash. Decoration, not emphasis, and it
 * has exactly one caller: the contact address in the About hero.
 *
 * It is deliberately not available for highlighting prose. The SVG is
 * absolutely positioned across the span's full width, so a phrase that wraps
 * gets one flat rule spanning the whole paragraph instead of a stroke under
 * each line. The contact address is a single unbreakable token, which is why
 * it is safe here and nowhere else. Prose emphasis is `<strong>`.
 */
export default function Marker({ children, className }: Props) {
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
          d={PATH}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth={5}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
