import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";

/**
 * The shared "view all" link at the end of a section's label row: an arrow
 * only, in the same muted tone as the dotted leader and count beside it. The
 * words ("All writing") are its accessible name and its tooltip, so screen
 * readers and a hover still say where it goes. The tap area is a 28px circle
 * so the bare icon stays easy to hit on a phone.
 *
 * It used to be a bordered mono pill, then "View all" in text; next to the
 * dot-matrix label row the text read as a second label, so it is an icon now.
 *
 * `next/link` because every destination is an internal route.
 */
export function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="group -my-1.5 -mr-1.5 inline-grid h-7 w-7 shrink-0 place-items-center rounded-full text-subtle transition-colors duration-base ease-out hover:bg-elevated hover:text-foreground"
    >
      <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-fast ease-out group-hover:translate-x-0.5" />
    </Link>
  );
}
