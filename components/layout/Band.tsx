import { cn } from "@/lib/utils";
import Container from "./Container";

/**
 * A full-width label row with a hairline under it, used only by `PageBand` at
 * the top of a secondary route. The rails, gutter dots and ink tick that used
 * to dress it are gone; what is left is a plain labelled row.
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
        "relative border-b border-border candy:border-0",
        !flush && "border-t",
        className
      )}
    >
      <Container className="flex items-center justify-between gap-4 py-3 candy:py-1.5">
        {children}
      </Container>
    </div>
  );
}
