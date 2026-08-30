import Link from "next/link";
import { ArrowRight, Dices } from "lucide-react";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";

/**
 * Approximate card stock colours for the decorative fan below, copied by eye
 * from `STOCK` in `lib/card/ticket.ts`: definitive, commemorative, first day
 * and the rare black inverted stock (misprint's stock sits a hair off
 * definitive and doesn't read as a distinct colour at this size, so it's
 * left out). These are local constants rather than an import from
 * `lib/card/`: the fan is a decorative approximation, not a rendering of a
 * real card, and coupling this homepage banner to the card feature's
 * internals over a handful of hex strings would be the wrong kind of reuse.
 * If `STOCK` changes, update this list to match by eye; nothing here breaks
 * if it drifts.
 */
const FAN_STOCKS = ["#f6f1e5", "#f4eede", "#eef1ef", "#17161a"];

/* Alternating tilts, increasing left to right, so the four overlap like a
 * hand of cards fanned open rather than a straight stack. The black stock is
 * last, both because it is the rare pull worth noticing and because later
 * siblings paint over earlier ones in normal flow, which puts it on top. */
const FAN_ROTATE = ["-rotate-6", "-rotate-2", "rotate-3", "rotate-9"];

/**
 * A single-cell banner pointing at `/card`, sitting in the page flow between
 * `Projects` and `TechStack` rather than floating over it. Both corners of
 * the homepage are already spoken for: `LaunchNudge` owns bottom left and
 * the chat FAB owns bottom right (see their own comments), so a third
 * overlay would collide with one of them. A banner in the flow needs
 * neither a dismissal nor a mounted-later delay the way those two do, since
 * it never sits on top of anything.
 *
 * No local state, so this stays a server component like its neighbours. The
 * fan below is CSS transforms on plain divs, not JavaScript, for the same
 * reason. `Bento` and `Section` are the same primitives `Activity.tsx`
 * builds its "Writing" cell from; this reuses that shape (eyebrow,
 * heading-weight link, one supporting line) rather than inventing a new
 * surface.
 *
 * The card itself is generative and per-visitor, so nothing here renders an
 * actual minted card: a screenshot of one would show a single visitor's
 * portrait and serial as though it belonged to whoever is looking. The fan
 * of four blank stocks sidesteps that by showing no portrait, no serial and
 * no name, only the range of editions that exist; `Dices` stays as well,
 * since it is the site's own iconography rather than a claim about any one
 * card.
 *
 * The fan only appears at `md` and up (`hidden md:flex`). Below that, the
 * banner's reading-width container leaves too little room beside the copy
 * for four more shapes without squeezing the heading onto extra lines, so
 * it drops out entirely rather than crowd the text; the layout below `md` is
 * unchanged from before the fan existed.
 */
export default function CardNudge() {
  return (
    <Section width="reading">
      <Bento className="grid-cols-1">
        <Link
          href="/card"
          className="group flex flex-col gap-3 bg-card px-5 py-6 transition-colors duration-base ease-out hover:bg-elevated sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex items-start gap-3">
            <Dices aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-subtle transition-colors duration-base ease-out group-hover:text-foreground" />
            <div>
              <p className="text-xl font-semibold text-foreground">
                Mint yourself a stamp card
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Roll two dice, three times, to decide its edition.
              </p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="hidden shrink-0 items-center md:flex"
          >
            {FAN_STOCKS.map((stock, i) => (
              <div
                key={stock}
                className={`relative aspect-[4/5] w-12 shrink-0 rounded-md border border-border-strong shadow-sm ${FAN_ROTATE[i]} ${i > 0 ? "-ml-6" : ""}`}
                style={{ backgroundColor: stock }}
              >
                {/* A hint of structure, standing in for the stamp and the
                    tear line: enough for the shape to read as a card rather
                    than a plain swatch. */}
                <div className="absolute inset-1 bottom-3 rounded-sm border border-border-strong/70" />
                <div className="absolute inset-x-1 bottom-1 h-px bg-border-strong/70" />
              </div>
            ))}
          </div>
          <span className="ml-8 inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-base ease-out group-hover:text-foreground sm:ml-0">
            Roll the dice
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Bento>
    </Section>
  );
}
