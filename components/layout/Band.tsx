import { cn } from "@/lib/utils";
import Container from "./Container";

/**
 * A full-bleed row that crosses the rails, carrying a label and an optional
 * action. It is the one structural device this page system adds.
 *
 * The band is full width while its contents sit in a Container, so the two
 * hairlines run edge to edge and cross the rails rather than stopping at the
 * measure. That crossing is the whole effect: it is what makes the label read
 * as page furniture instead of as a caption sitting above a paragraph.
 *
 * Used by `Section` for a numbered section and by `PageBand` for a route
 * header. Nothing else should draw a band: a band means "a labelled division
 * starts here", and it stops meaning that as soon as it is used for emphasis.
 */
export default function Band({
  className,
  flush = false,
  children,
}: {
  className?: string;
  /**
   * Drop the top rule, for a band that sits directly under the navbar. The
   * navbar already draws a `border-b`, so a band with its own `border-t` puts
   * two hairlines a pixel apart and reads as a mistake rather than as a pair.
   * Written as a prop rather than a `border-t-0` override from the caller,
   * because that leaves the resolution to tailwind-merge's understanding of
   * `border-y` against `border-t`, which is not something worth depending on.
   */
  flush?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "band-gutters relative border-b border-border",
        !flush && "border-t",
        className
      )}
    >
      <span aria-hidden className="band-tick" />
      <Container className="flex items-center justify-between gap-4 py-3">
        {children}
      </Container>
    </div>
  );
}
