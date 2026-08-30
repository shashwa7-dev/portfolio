import Link from "next/link";
import { ArrowRight, Dices } from "lucide-react";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";

/**
 * Real issue stocks for the fan's three cards, copied by eye from `STOCK` in
 * `lib/card/ticket.ts`: commemorative, first day and the rare black inverted
 * stock. Definitive and misprint are left out. Both sit within a hair of
 * commemorative's warm cream and don't read as a distinct colour at this
 * size (the same reasoning the four-card version of this fan used to drop
 * misprint), so the pair that contrasts most, commemorative's deeper warm
 * batch against first day's cooler cast, is what earns the two light card
 * slots, with the black stock unchanged as the third. These are local
 * constants rather than an import from `lib/card/`: the fan is a decorative
 * approximation, not a rendering of a real card, and coupling this homepage
 * banner to the card feature's internals over a handful of hex strings
 * would be the wrong kind of reuse. If `STOCK` changes, update this list to
 * match by eye; nothing here breaks if it drifts.
 */
const FAN_STOCKS = ["#f4eede", "#eef1ef", "#17161a"]; // commemorative, first day, inverted

/**
 * A single-cell banner pointing at `/card`, sitting in the page flow between
 * `Projects` and `TechStack` rather than floating over it. Both corners of
 * the homepage are already spoken for: `LaunchNudge` owns bottom left and
 * the chat FAB owns bottom right (see their own comments), so a third
 * overlay would collide with one of them.
 *
 * No local state, so this stays a server component like its neighbours: the
 * fan below, the chip's tilt, the CTA's underline wipe and the arrow's slide
 * are all `group`/`group-hover` CSS on plain elements, not JavaScript. The
 * one non-utility escape hatch is `transition-[right]` on the underline: the
 * wipe is a `right: 100%` to `right: 0` reveal (an oversized underline
 * pinned by its right edge, so it grows in from the left as `right` shrinks)
 * and Tailwind has no named utility for transitioning that property, but
 * `right-full` / `right-0` and the transition itself are still ordinary
 * Tailwind classes, not a `<style>` block.
 *
 * Sized from the reference's tuned reference values rather than the app's
 * duration/easing tokens where the two don't line up: the fan's overshoot
 * (--duration-fan: 450ms, --ease-fan: cubic-bezier(0.3, 1.1, 0.4, 1)) is
 * the signature move the owner asked to keep exactly, and coincidentally the
 * same curve shape as CARD_RISE_EASE in lib/motionVariants.ts (cards
 * flicking into a new position, on the card's own rise and here). That
 * constant isn't exported and this component is CSS-only, so the curve is
 * duplicated in app/globals.css rather than imported. Everything else (the
 * bar's colour swap, the chip's tilt, the arrow's slide, the underline's
 * wipe) rides the app's own `duration-med` / `ease-out` tokens.
 *
 * The card itself is generative and per-visitor, so nothing here renders an
 * actual minted card: a screenshot of one would show a single visitor's
 * portrait and serial as though it belonged to whoever is looking. The fan
 * of three blank stocks sidesteps that by showing no portrait, no serial and
 * no name, only a sample of the range of editions that exist. `Dices` stays
 * as well, since it is the site's own iconography rather than a claim about
 * any one card.
 *
 * Row layout (chip, fan and CTA side by side) starts at `md` rather than the
 * reference's 640px: the reading-width container is 760px including
 * padding, and at 640px there wasn't enough room left over for the title,
 * the fixed-size fan and the CTA without crowding. Below `md` the bar
 * stacks: chip and copy, then the fan centred, then the CTA as a full-width
 * bordered tap target with its underline disabled, matching the reference's
 * mobile treatment. The fan itself stays one fixed size across breakpoints
 * rather than the reference's three-tier shrink: it is a handful of
 * decorative divs with hand-picked pixel offsets, and re-deriving every
 * offset at a second and third scale wasn't worth it for a shape nobody is
 * asked to look at closely.
 */
export default function CardNudge() {
  return (
    <Section width="reading">
      <Bento className="grid-cols-1">
        <Link
          href="/card"
          className="group flex flex-col gap-5 bg-card px-5 py-6 transition-colors duration-med ease-out hover:bg-elevated md:flex-row md:items-center md:justify-between md:gap-6"
        >
          <div className="flex items-start gap-3.5">
            {/* The chip's tinted background (`bg-elevated` plus a stronger
                ring) is a step up from the card's own surface in both
                themes, not just the border alone: on the dark card, a chip
                with only a border and no fill tint would read as an outline
                sitting on the same near-black plane as the card itself. */}
            <div
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-elevated ring-1 ring-border-strong transition-transform duration-med ease-out group-hover:-rotate-[8deg]"
            >
              <Dices aria-hidden="true" className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="font-mono text-2xs uppercase tracking-label text-subtle">
                5 editions · 2 dice × 3 rolls
              </p>
              <p className="mt-1.5 text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
                Mint yourself a stamp card
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Roll two dice, three times, to decide its edition.
              </p>
            </div>
          </div>

          {/* The fan: three cards absolutely centred on top of one another,
              each pushed sideways and rotated by its own amount so they
              overlap like a hand fanned open. On hover every card pushes
              further out, rotates a little more, and the black one (drawn
              last, so normal stacking order already puts it on top) lifts
              while the others settle a touch. Each card's translate keeps
              its centring offset (the `50%`) and its fan offset (the tuned
              pixel value) in one `calc()` rather than two separate
              translate utilities, since Tailwind's translate-x and
              translate-y utilities each own a single CSS variable and a
              second one would simply overwrite the first instead of adding
              to it. */}
          <div
            aria-hidden="true"
            className="relative mx-auto h-[7.25rem] w-[10.5rem] shrink-0 md:mx-0"
          >
            <div
              className="absolute left-1/2 top-1/2 h-[6.25rem] w-[4.875rem] -translate-x-[calc(50%_+_40px)] -translate-y-1/2 -rotate-[9deg] rounded-md border border-border-strong shadow-sm transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:-translate-x-[calc(50%_+_66px)] group-hover:-rotate-[15deg] group-hover:translate-y-[calc(-50%_+_3px)]"
              style={{ backgroundColor: FAN_STOCKS[0] }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[6.25rem] w-[4.875rem] -translate-x-[calc(50%_+_13px)] -translate-y-1/2 -rotate-2 rounded-md border border-border-strong shadow-sm transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:-translate-x-[calc(50%_+_24px)] group-hover:-rotate-[5deg]"
              style={{ backgroundColor: FAN_STOCKS[1] }}
            />
            {/* The rare black stock: a heavier shadow and, unlike the two
                light cards, a border strong enough on its own to keep it
                readable against a near-black page in dark theme (the same
                reason the four-card version of this fan carried a border on
                every swatch). The dotted line and corner mark are the
                perforation and rare-pull mark from the reference, kept only
                on this card since it's the one both notes call out. */}
            <div
              className="absolute left-1/2 top-1/2 h-[6.25rem] w-[4.875rem] translate-x-[calc(-50%_+_15px)] -translate-y-1/2 rotate-6 rounded-md border border-border-strong shadow-md transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:translate-x-[calc(-50%_+_30px)] group-hover:translate-y-[calc(-50%_-_8px)] group-hover:rotate-[9deg]"
              style={{ backgroundColor: FAN_STOCKS[2] }}
            >
              <div className="absolute inset-x-2 top-9 border-t-2 border-dotted border-white/20" />
              <div className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>
          </div>

          <span className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground md:w-auto md:justify-start md:border-0 md:p-0 md:font-normal md:text-muted-foreground md:transition-colors md:duration-med md:ease-out md:group-hover:text-foreground">
            <span className="relative inline-block md:after:absolute md:after:-bottom-0.5 md:after:right-full md:after:h-px md:after:w-full md:after:bg-foreground md:after:transition-[right] md:after:duration-med md:after:ease-out md:after:content-[''] md:group-hover:after:right-0">
              Roll the dice
            </span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 transition-transform duration-med ease-out group-hover:translate-x-1"
            />
          </span>
        </Link>
      </Bento>
    </Section>
  );
}
