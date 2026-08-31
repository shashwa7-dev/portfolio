import { cn } from "@/lib/utils";

/**
 * A dashed plate frame with registration crosses at its corners, margin
 * labels outside it, and a live slot in the top-right margin.
 *
 * These are printing marks, which is why they belong here and would be
 * decoration anywhere else on the site. Registration crosses are what a press
 * aligns its plates against, and the whole feature is built on that metaphor
 * already: the stock, the perforation, the postmark, the reveal that prints
 * the card a slice at a time. The frame says the stage is a sheet the card is
 * struck on rather than a region of a web page.
 *
 * The three text labels are `aria-hidden`. They carry real values rather than
 * invented ones, but none of it is information a reader needs, and the card
 * itself already states its serial to assistive tech through its canvas
 * label. Repeating that in a second, worse voice would be noise.
 *
 * `topRight` is a node, not a label, and is deliberately NOT hidden: it holds
 * the card's own actions. Hiding a group of real buttons from assistive tech
 * to keep a decorative row uniform would be trading the page's usability for
 * its tidiness, so the aria-hidden sits on each decorative span instead of on
 * the row that contains them.
 *
 * The frame draws no background and sets no `overflow`. The dice dock throws
 * dice above the pill's own box, and the card's reveal turns a card in 3D:
 * clipping here would cut both.
 */

/**
 * The dashed rule, drawn as four repeating gradients rather than with
 * `border-dashed`.
 *
 * CSS gives no control over a dashed border's dash and gap. The browser
 * picks them, lands near 3px on 3px, and the result reads as a grey hairline
 * rather than as a deliberately dashed one. These are 6px marks separated by
 * 9px, which is what makes the dashing legible as dashing.
 *
 * Four gradients, one per edge: `backgroundSize` gives the two horizontal
 * ones a 1px height and the two vertical ones a 1px width, and
 * `backgroundPosition` pins them to their edges. The token is interpolated
 * directly because a gradient colour stop cannot take a Tailwind class.
 */
const RULE = "hsl(var(--border-strong))";
const DASH = `${RULE} 0 6px, transparent 6px 15px`;
const dashedRule = {
  backgroundImage: [
    `repeating-linear-gradient(to right, ${DASH})`,
    `repeating-linear-gradient(to right, ${DASH})`,
    `repeating-linear-gradient(to bottom, ${DASH})`,
    `repeating-linear-gradient(to bottom, ${DASH})`,
  ].join(","),
  backgroundSize: "100% 1px, 100% 1px, 1px 100%, 1px 100%",
  backgroundPosition: "0 0, 0 100%, 0 0, 100% 0",
  backgroundRepeat: "no-repeat",
} as const;

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
  /** The card's actions. A node, and never hidden: see the note above. */
  topRight?: React.ReactNode;
  bottomLeft: string;
  bottomRight: string;
  className?: string;
  children: React.ReactNode;
};

const LABEL =
  "pointer-events-none select-none font-mono text-2xs uppercase tracking-label text-subtle";

export default function PlateFrame({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  className,
  children,
}: Props) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[480px]", className)}>
      {/* The margin rows are in flow, not absolutely positioned over a fixed
          padding. The top one holds a toolbar whose height is its own
          business, and a row that sizes to its content cannot be outgrown by
          what it is given. `items-end` sits the label on the toolbar's
          baseline rather than its top. */}
      <div className="mb-3 flex min-h-8 items-end justify-between gap-3">
        <span aria-hidden="true" className={LABEL}>
          {topLeft}
        </span>
        {topRight}
      </div>

      <div className="relative px-4 py-8 sm:px-8" style={dashedRule}>
        <Cross className="-left-[5px] -top-[5px]" />
        <Cross className="-right-[5px] -top-[5px]" />
        <Cross className="-bottom-[5px] -left-[5px]" />
        <Cross className="-bottom-[5px] -right-[5px]" />
        {children}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <span aria-hidden="true" className={LABEL}>
          {bottomLeft}
        </span>
        <span aria-hidden="true" className={LABEL}>
          {bottomRight}
        </span>
      </div>
    </div>
  );
}
