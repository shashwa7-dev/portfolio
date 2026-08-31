import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Real issue stocks for the fan's three cards, copied by eye from `STOCK` in
 * `lib/card/ticket.ts`: commemorative, first day and the rare black inverted
 * stock. Definitive and misprint are left out, both sitting within a hair of
 * commemorative's warm cream. Local constants rather than an import from
 * `lib/card/`: the fan is a decorative approximation, not a rendering of a
 * real card, and coupling this to the card feature's internals over three hex
 * strings would be the wrong kind of reuse. If `STOCK` changes, update this
 * by eye; nothing here breaks if it drifts.
 */
const FAN_STOCKS = ["#f4eede", "#eef1ef", "#17161a"]; // commemorative, first day, inverted

/**
 * A button-sized link to `/card`, sitting beside the address in the Contact
 * section.
 *
 * It has been three things. A floating overlay, which could not be: both
 * bottom corners of the homepage are taken, by `LaunchNudge` and the chat
 * FAB. Then a section of its own, numberless and titleless, holding one
 * card. Then a full-width bordered banner at the foot of Contact, which is
 * where it stopped being a nudge: a panel the width of the column, with an
 * eyebrow, a headline, a line of body copy and its own hover state, for a
 * toy. It asked for more attention than the invitation warranted, and it
 * competed with the section it was a footnote to.
 *
 * So: the size of the thing it sits next to. One line of label, the fan, an
 * arrow, and the same height as the address button beside it. The fan is
 * what makes it worth a button rather than a text link, since it is the only
 * part that says what a card looks like.
 *
 * The fan is the banner's, scaled down and simplified. Three cards centred
 * on top of one another, each pushed sideways and rotated by its own amount,
 * opening further on hover. Each translate keeps its centring offset (the
 * `50%`) and its fan offset in one `calc()`, since Tailwind's translate-x and
 * translate-y utilities each own a single CSS variable and a second would
 * overwrite the first rather than add to it. The perforation line and
 * rare-pull dot the large fan drew on the black card are gone: at 17px tall
 * they were a smudge.
 *
 * `--duration-fan` / `--ease-fan` (450ms, cubic-bezier(0.3, 1.1, 0.4, 1)) are
 * the overshoot the owner asked to keep exactly, defined in app/globals.css.
 * The arrow rides the app's own `duration-med` / `ease-out`.
 *
 * The hover fill stays, unlike on the banner where it went with the panel it
 * was tinting. This is a button now, and a button with no feedback under the
 * cursor reads as a dead one.
 *
 * No local state, so this stays a server component: the fan's spread and the
 * arrow's slide are `group-hover` CSS on plain elements.
 */
export default function CardNudge({ className }: { className?: string }) {
  return (
    <Link
      href="/card"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-med ease-out hover:bg-elevated",
        className
      )}
    >
      <span aria-hidden="true" className="relative block h-5 w-[26px] shrink-0">
        <span
          className="absolute left-1/2 top-1/2 h-[17px] w-[13px] -translate-x-[calc(50%_+_5px)] -translate-y-1/2 -rotate-[10deg] rounded-[3px] border border-border-strong transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:-translate-x-[calc(50%_+_8px)] group-hover:-rotate-[16deg]"
          style={{ backgroundColor: FAN_STOCKS[0] }}
        />
        <span
          className="absolute left-1/2 top-1/2 h-[17px] w-[13px] -translate-x-[calc(50%_+_1.5px)] -translate-y-1/2 -rotate-[3deg] rounded-[3px] border border-border-strong transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:-translate-x-[calc(50%_+_3px)] group-hover:-rotate-[6deg]"
          style={{ backgroundColor: FAN_STOCKS[1] }}
        />
        {/* The rare black stock, drawn last so ordinary stacking order puts
            it on top. It keeps a border like the other two: against a
            near-black page in dark theme it would otherwise have no edge. */}
        <span
          className="absolute left-1/2 top-1/2 h-[17px] w-[13px] translate-x-[calc(-50%_+_2px)] -translate-y-1/2 rotate-[7deg] rounded-[3px] border border-border-strong transition-transform duration-[var(--duration-fan)] ease-[var(--ease-fan)] group-hover:translate-x-[calc(-50%_+_5px)] group-hover:translate-y-[calc(-50%_-_1px)] group-hover:rotate-[11deg]"
          style={{ backgroundColor: FAN_STOCKS[2] }}
        />
      </span>
      Mint your card
      <ArrowRight
        aria-hidden="true"
        className="h-4 w-4 shrink-0 transition-transform duration-med ease-out group-hover:translate-x-1"
      />
    </Link>
  );
}
