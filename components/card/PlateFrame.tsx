import { cn } from "@/lib/utils";

/**
 * A dashed plate frame with registration crosses at its corners, and four
 * margin labels outside it.
 *
 * These are printing marks, which is why they belong here and would be
 * decoration anywhere else on the site. Registration crosses are what a press
 * aligns its plates against, and the whole feature is built on that metaphor
 * already: the stock, the perforation, the postmark, the reveal that prints
 * the card a slice at a time. The frame says the stage is a sheet the card is
 * struck on rather than a region of a web page.
 *
 * Everything here is `aria-hidden` or plain decorative text. The labels carry
 * real values (the plate ratio, the serial once there is one) rather than
 * invented ones, but none of it is information a reader needs, and the card
 * itself already states the serial to assistive tech through its canvas
 * label. So the marks stay out of the accessibility tree entirely instead of
 * repeating the card in a second, worse voice.
 *
 * The frame draws no background and sets no `overflow`. The dice dock throws
 * dice above the pill's own box, and the card's reveal turns a card in 3D:
 * clipping here would cut both.
 */

/** One registration cross, centred on the corner it is positioned at. */
function Cross({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute block h-2.5 w-2.5", className)}
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border-strong" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-border-strong" />
    </span>
  );
}

type Props = {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  className?: string;
  children: React.ReactNode;
};

export default function PlateFrame({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  className,
  children,
}: Props) {
  const label =
    "pointer-events-none select-none font-mono text-2xs uppercase tracking-label text-subtle";

  return (
    // The outer padding is the margin the labels sit in, not spacing: the
    // frame is inset from this box by exactly the room the two label rows
    // need, so the marks read as being outside the plate rather than
    // crowding its edge.
    <div className={cn("relative mx-auto w-full max-w-[480px] py-7", className)}>
      <div aria-hidden="true" className={cn("absolute inset-x-0 top-0 flex justify-between", label)}>
        <span>{topLeft}</span>
        <span>{topRight}</span>
      </div>

      <div className="relative border border-dashed border-border px-4 py-8 sm:px-8">
        <Cross className="-left-[5px] -top-[5px]" />
        <Cross className="-right-[5px] -top-[5px]" />
        <Cross className="-bottom-[5px] -left-[5px]" />
        <Cross className="-bottom-[5px] -right-[5px]" />
        {children}
      </div>

      <div
        aria-hidden="true"
        className={cn("absolute inset-x-0 bottom-0 flex justify-between", label)}
      >
        <span>{bottomLeft}</span>
        <span>{bottomRight}</span>
      </div>
    </div>
  );
}
