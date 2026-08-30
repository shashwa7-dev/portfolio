import Link from "next/link";
import { ArrowRight, Dices } from "lucide-react";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";

/**
 * A single-cell banner pointing at `/card`, sitting in the page flow between
 * `Projects` and `TechStack` rather than floating over it. Both corners of
 * the homepage are already spoken for: `LaunchNudge` owns bottom left and
 * the chat FAB owns bottom right (see their own comments), so a third
 * overlay would collide with one of them. A banner in the flow needs
 * neither a dismissal nor a mounted-later delay the way those two do, since
 * it never sits on top of anything.
 *
 * No local state, so this stays a server component like its neighbours.
 * `Bento` and `Section` are the same primitives `Activity.tsx` builds its
 * "Writing" cell from; this reuses that shape (eyebrow, heading-weight
 * link, one supporting line) rather than inventing a new surface.
 *
 * The card itself is generative and per-visitor, so nothing here renders a
 * minted card: a static screenshot would show one visitor's portrait and
 * serial as though it belonged to whoever is looking. `Dices` is safe
 * because it is the site's own iconography, not a claim about any one card.
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
            <Dices className="mt-0.5 h-5 w-5 shrink-0 text-subtle transition-colors duration-base ease-out group-hover:text-foreground" />
            <div>
              <p className="text-xl font-semibold text-foreground">
                Mint yourself a stamp card
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Roll two dice, three times, to decide its edition.
              </p>
            </div>
          </div>
          <span className="ml-8 inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-base ease-out group-hover:text-foreground sm:ml-0">
            Roll the dice
            <ArrowRight className="h-4 w-4 transition-transform duration-base ease-out group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Bento>
    </Section>
  );
}
