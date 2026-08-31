import Link from "next/link";
import { ArrowRight, Dices } from "lucide-react";
import Bento from "@/components/layout/Bento";
import { cn } from "@/lib/utils";

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
 * A single-cell banner pointing at `/card`, sitting in the page flow rather
 * than floating over it. Both corners of the homepage are already spoken
 * for: `LaunchNudge` owns bottom left and the chat FAB owns bottom right
 * (see their own comments), so a third overlay would collide with one of
 * them.
 *
 * Rendered by `Socials`, at the foot of the Contact section, which is the
 * last section on the homepage and sits directly above the footer from
 * `app/layout.tsx`. It used to sit mid-scroll between `Projects` and
 * `TechStack`, with copy that pitched the mechanic; its copy now thanks a
 * reader for reaching the end of the page instead, which only reads honestly
 * from the actual end of the page.
 *
 * It also used to carry its own `<Section>`, which made it a numberless,
 * titleless ninth section whose only content was one card. Two stacked
 * section paddings put roughly 190px of empty space between the contact
 * details and a card that is a postscript to them, and the page ended on a
 * heading-less band that read as an afterthought rather than as part of the
 * parting note. It is a block now, and the section it belongs to is the one
 * already asking the reader to get in touch.
 *
 * `className` is the caller's spacing, not the component's: how far this
 * sits from whatever precedes it is a fact about the section it lands in.
 *
 * No local state, so this stays a server component like its neighbours: the
 * fan below, the chip's tilt and the arrow's slide are all `group`/
 * `group-hover` CSS on plain elements, not JavaScript, and every class here
 * is an ordinary Tailwind utility rather than a `<style>` block.
 *
 * The reference this came from also wiped an underline in under the CTA
 * label. That is gone. It shipped with both `right-full` and `w-full` and no
 * `left`, so instead of growing from nothing it was a full-width rule parked
 * outside the box, sliding across on hover, and animating `right` relaid out
 * the line every frame. Doing it properly means growing the rule with
 * `scaleX` from a left origin, which is one transform and no layout work, but
 * the CTA already reads as a link from its colour shift and its arrow, so the
 * underline was removed rather than rebuilt.
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
 * Two groups, not three: the copy sits alone on the left, and the fan and
 * the CTA share a single wrapper on the right, so `justify-between` on the
 * outer row splits copy from "everything about the card" instead of
 * stranding the fan by itself in the middle.
 *
 * At `md` that wrapper stops being a flex row and becomes a fixed
 * 140x108px box (`relative` at every width so it can anchor its own
 * children, `md:h-[108px] md:w-[140px] md:shrink-0` from `md` up), still
 * an ordinary flex item next to the copy. The fan and the CTA are
 * each pinned `absolute` inside it: the fan at `top-0 right-0`, the corner
 * of the banner the owner asked for, and the CTA at `bottom-0 right-0`,
 * "absolutely positioned below the card". An absolutely positioned element
 * contributes no size to its container, so if the fan and the CTA were
 * left to define this box's footprint themselves, the banner would shrink
 * to the copy's height alone and both would spill past the bottom edge.
 * Giving the box an explicit height instead means it, not its absolute
 * children, is what `md:items-center` measures on the row: the row (and so
 * the banner, once py-5's 40px top-and-bottom is added back) is always at
 * least 148px tall at `md`, whatever the copy does.
 *
 * The two numbers are sized around the fan's own hover spread, not just
 * its resting state. On `group-hover` the fan's leftmost card pushes out
 * to 36px from centre (21.75px at rest), landing its left edge 12px past
 * the left edge of the fan's own 90px-wide box. 140px, 50px wider than the
 * fan, keeps that overshoot 38px inside the reserved box's own left edge,
 * so a hovered fan still can't reach the copy: the copy is a separate flex
 * sibling, and flexbox won't let two siblings' boxes overlap regardless of
 * what one sibling's children spill into it. The same hover state pushes
 * the black card's top edge up to, but not past, 0px inside the fan's own
 * box (it rests at 4.5px), so nothing crosses the reserved box's top edge
 * either, 20px short of the Bento's rounded, overflow-hidden border (this
 * banner's own px-5/py-5).
 *
 * The row starts at `md` rather than the reference's 640px: the
 * reading-width container is 760px including padding, and at 640px there
 * wasn't enough room left over for the title, the fixed-size fan and the
 * CTA without crowding. Below `md` the bar stacks in normal flow, nothing
 * absolutely positioned: chip and copy, then the fan-and-CTA group with the
 * fan centred above the CTA as a full-width bordered tap target with its
 * underline disabled, matching the reference's mobile treatment. The fan
 * itself stays one fixed size across breakpoints rather than the
 * reference's three-tier shrink: it is a handful of decorative divs with
 * hand-picked pixel offsets, and re-deriving every offset at a second and
 * third scale wasn't worth it for a shape nobody is asked to look at
 * closely.
 */
export default function CardNudge({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <Bento className="grid-cols-1">
        <Link
          href="/card"
          className="group flex flex-col gap-5 bg-card px-5 py-5 transition-colors duration-med ease-out hover:bg-elevated md:flex-row md:items-center md:justify-between md:gap-6"
        >
          <div className="flex items-start gap-3.5">
            {/* The chip's tinted background (`bg-elevated` plus a stronger
                ring) is a step up from the card's own surface in both
                themes, not just the border alone: on the dark card, a chip
                with only a border and no fill tint would read as an outline
                sitting on the same near-black plane as the card itself. */}
            <div
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-elevated ring-1 ring-border-strong transition-transform duration-med ease-out group-hover:-rotate-[8deg]"
            >
              <Dices aria-hidden="true" className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="font-mono text-2xs uppercase tracking-label text-subtle">
                5 editions · 2 dice × 3 rolls
              </p>
              <p className="mt-1.5 text-base font-extrabold tracking-tight text-foreground md:text-lg">
                You made it to the end
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanks for visiting. Mint yourself a stamp card on the way out.
              </p>
            </div>
          </div>

          {/* Fan and CTA as one group, so `justify-between` on the row above
              separates copy from "everything about the card" rather than
              stranding the fan in the middle of three children. Below `md`
              this stays an ordinary flex column: fan centred, then the CTA
              in flow beneath it. At `md` it becomes a fixed 140x108px box
              (still just a flex item next to the copy) that anchors the
              fan and the CTA as absolutely positioned corners of the
              banner instead of flex siblings; see the component doc
              comment above for the exact numbers this box's size and the
              two corners are built from. */}
          <div className="relative flex flex-col items-center gap-4 md:h-[108px] md:w-[140px] md:shrink-0">
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
                to it.

                Sized one more step down than before: the container is
                63x90px (was 84x120px) and each card is 54x42px (was 72x56px),
                a uniform 0.75 scale that keeps the card's ~1.28 height/width
                ratio (54/42 = 1.286, was 72/56 = 1.286) and every hover
                offset scaled by the same 0.75, so the fan still opens by the
                same proportions, just smaller: 29->21.75px / 48->36px,
                9->6.75px / 17->12.75px, 11->8.25px / 22->16.5px horizontal,
                and 2->1.5px / -6->-4.5px vertical. The perforation line on
                the black card stays at ~36% of the card's height
                (19.5/54 = 0.361, was 26/72 = 0.361) and its inset and the
                rare-pull dot scale down with it. */}
            <div
              aria-hidden="true"
              className="relative h-[63px] w-[90px] shrink-0 md:absolute md:right-0 md:top-0"
            >
              <div
                className="absolute left-1/2 top-1/2 h-[54px] w-[42px] -translate-x-[calc(50%_+_21.75px)] -translate-y-1/2 -rotate-[9deg] rounded-md border border-border-strong shadow-sm transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:-translate-x-[calc(50%_+_36px)] group-hover:-rotate-[15deg] group-hover:translate-y-[calc(-50%_+_1.5px)]"
                style={{ backgroundColor: FAN_STOCKS[0] }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-[54px] w-[42px] -translate-x-[calc(50%_+_6.75px)] -translate-y-1/2 -rotate-2 rounded-md border border-border-strong shadow-sm transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:-translate-x-[calc(50%_+_12.75px)] group-hover:-rotate-[5deg]"
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
                className="absolute left-1/2 top-1/2 h-[54px] w-[42px] translate-x-[calc(-50%_+_8.25px)] -translate-y-1/2 rotate-6 rounded-md border border-border-strong shadow-md transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:translate-x-[calc(-50%_+_16.5px)] group-hover:translate-y-[calc(-50%_-_4.5px)] group-hover:rotate-[9deg]"
                style={{ backgroundColor: FAN_STOCKS[2] }}
              >
                <div className="absolute inset-x-1.5 top-[19.5px] border-t-2 border-dotted border-white/20" />
                <div className="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-white/40" />
              </div>
            </div>

            <span className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground md:absolute md:bottom-0 md:right-0 md:w-auto md:justify-start md:border-0 md:p-0 md:font-normal md:text-muted-foreground md:transition-colors md:duration-med md:ease-out md:group-hover:text-foreground">
              <span className="relative inline-block">
                Roll the dice
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 transition-transform duration-med ease-out group-hover:translate-x-1"
              />
            </span>
          </div>
        </Link>
      </Bento>
    </div>
  );
}
