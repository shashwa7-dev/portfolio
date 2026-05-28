"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { withMarker, fullMarker } from "@/lib/markerHighlight";
import { cn } from "@/lib/utils";

/**
 * MarkerLink — a CTA-style link with a draw-in underline (`<Marker>`)
 * across the label, plus an arrow that translates on hover.
 *
 * Use for inline "read more" / "see the X" affordances that need to feel
 * like a real call-to-action without being a full button.
 *
 * Marker behavior:
 * - When `children` is a plain string and `markerText` is omitted, the
 *   entire label gets the underline. (The common case.)
 * - When `markerText` is provided, only that substring (case-insensitive)
 *   gets the underline.
 * - When `children` is JSX or no matching string is found, no marker
 *   renders — caller is responsible for any inline emphasis.
 */
const markerLinkVariants = cva(
  "group inline-flex items-baseline gap-1.5 transition-colors",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-[15px] font-medium",
      },
      tone: {
        muted: "text-muted-foreground hover:text-foreground",
        foreground: "text-foreground hover:text-accent",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "foreground",
    },
  }
);

type Props = VariantProps<typeof markerLinkVariants> & {
  href: string;
  children: React.ReactNode;
  /**
   * Exact substring of `children` (case-insensitive) to wrap in <Marker>.
   * If omitted, the entire string label is wrapped.
   */
  markerText?: string;
  /** Marker stroke style — "marker" is the rough brush, "line" is a thin clean line. */
  markerVariant?: "marker" | "line";
  /** Delay before the marker draws (seconds). */
  markerDelay?: number;
  /** Disable the underline entirely. */
  noMarker?: boolean;
  /** Hide the trailing arrow. */
  hideArrow?: boolean;
  className?: string;
};

export default function MarkerLink({
  href,
  children,
  markerText,
  markerVariant = "marker",
  markerDelay = 0,
  noMarker,
  size,
  tone,
  hideArrow,
  className,
}: Props) {
  const label = (() => {
    if (noMarker) return children;
    if (typeof children !== "string") return children;
    if (markerText) return withMarker(children, markerText, markerVariant, markerDelay);
    return fullMarker(children, markerVariant, markerDelay);
  })();

  return (
    <Link
      href={href}
      className={cn(markerLinkVariants({ size, tone }), className)}
    >
      <span>{label}</span>
      {!hideArrow && (
        <ArrowRight
          className={cn(
            "self-center transition-transform duration-150 ease-[--ease-out] group-hover:translate-x-0.5",
            size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
          )}
        />
      )}
    </Link>
  );
}

