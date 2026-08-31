import { ISSUES } from "@/lib/card/issues";
import { STOCK } from "@/lib/card/ticket";
import type { IssueKey } from "@/lib/card/types";

/**
 * The five issues as a rarity table, rarest first.
 *
 * This replaced a grid of five drawn specimens, which was the wrong thing
 * shown the wrong size. Five canvases at roughly 230px each inside a 760px
 * column left the plate detail too small to read, `md:grid-cols-3` stranded
 * two cards on a ragged second row, and the whole section waited behind a
 * "Drawing the issues..." line while the card fonts loaded. Worse, it spent
 * the page's best space on five things that look nearly identical: four of
 * the five print on the same cream paper, and at that size the difference
 * between Definitive and Commemorative is a tint.
 *
 * What actually differs between issues is what they do, what you have to
 * roll, and how likely that is. So that is what this shows, and it needs no
 * canvas at all: a stock swatch instead of a thumbnail, the change each
 * issue makes to the card, the dice range, and the odds. The only card
 * rendered on this page is now the visitor's own.
 *
 * Every number is read from `ISSUES`, which reads them from the counted 6d6
 * distribution in `lib/card/dice.ts`. Nothing here is typed by hand, so a
 * band that changes cannot leave this table stating the old odds.
 */

/**
 * What each issue changes about the card, checked against `drawTicket`
 * rather than written from the names. Misprint really does print the inner
 * rule and the portrait twice out of register; First day really does swap
 * the postmark's legend and ink; Inverted really does turn the portrait
 * over. If a sixth issue is added that changes nothing but a colour, it
 * does not get a line here, because there would be nothing true to write.
 */
const CHANGES: Record<IssueKey, string> = {
  inverted: "The portrait prints upside down, on black stock",
  misprint: "The plate slips: rule and portrait print twice, off register",
  firstDay: "A first-day postmark, cancelled in teal",
  commemorative: "A commemorative overprint struck across the face",
  definitive: "The standard issue, no overprint",
};

/** Rarest first. Sorted by the real per-roll chance rather than by a
 *  hand-kept order, so the ladder cannot disagree with the numbers in it. */
const LADDER = Object.values(ISSUES).sort((a, b) => a.chance - b.chance);

/** The commonest issue's chance, so the bars read against the top of the
 *  scale rather than against 100% and leave the whole row near-empty. */
const WIDEST = Math.max(...LADDER.map((i) => i.chance));

export default function IssueLadder({ current }: { current?: IssueKey | null }) {
  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        What you are rolling for
      </h2>
      <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground">
        Six dice, thrown three times. What they add up to decides which issue
        your card prints on. The odds are per roll, not a share of cards, and
        you can roll as many times as you like.
      </p>

      <ul className="mt-6">
        {LADDER.map((issue) => {
          const mine = issue.key === current;
          return (
            <li
              key={issue.key}
              // `aria-current` rather than a visual-only highlight: the row
              // for the card a visitor is holding is genuinely the current
              // one, and a colour change alone says nothing to a screen
              // reader.
              aria-current={mine ? "true" : undefined}
              className={`relative grid grid-cols-[14px_1fr_auto] items-center gap-x-4 gap-y-1 rounded-lg border-b border-border px-3 py-3 last:border-b-0 sm:grid-cols-[14px_1fr_4.5rem_5.5rem] ${
                mine ? "bg-elevated" : ""
              }`}
            >
              {/* The stock, which is the one thing that differs between the
                  four cream issues and is legible at any size. A ring rather
                  than a border so the near-black inverted stock still has an
                  edge on a dark page. */}
              <span
                aria-hidden="true"
                className="h-[18px] w-3.5 rounded-sm ring-1 ring-inset ring-border-strong"
                style={{ backgroundColor: STOCK[issue.key] }}
              />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {issue.name}
                  {mine && (
                    <span className="ml-2 font-mono text-2xs uppercase tracking-label text-subtle">
                      yours
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {CHANGES[issue.key]}
                </p>
              </div>

              {/* Below `sm` these two share the third column and sit under
                  the name; from `sm` they get a column each. The range is
                  what to roll, the odds are how often that happens. */}
              <div className="col-start-2 flex items-center gap-4 sm:col-start-3 sm:col-span-2 sm:grid sm:grid-cols-[4.5rem_5.5rem] sm:gap-x-4">
                <span className="font-mono text-2xs uppercase tracking-label text-muted-foreground sm:text-right">
                  {issue.range[0]}&ndash;{issue.range[1]}
                </span>
                <span className="sm:text-right">
                  <span className="block font-mono text-2xs uppercase tracking-label text-foreground">
                    {issue.label}
                  </span>
                  {/* True to scale. Inverted is a sliver beside Definitive's
                      full bar, which is the honest picture and the reason to
                      draw it at all. `max()` keeps that sliver visible at
                      0.06% instead of rounding it to nothing, and the real
                      number sits directly above it either way. */}
                  <span
                    aria-hidden="true"
                    className="mt-1.5 block h-[3px] w-full overflow-hidden rounded-full bg-border"
                  >
                    <span
                      className={`block h-full rounded-full ${
                        mine ? "bg-foreground" : "bg-border-strong"
                      }`}
                      style={{
                        width: `max(2px, ${(issue.chance / WIDEST) * 100}%)`,
                      }}
                    />
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
