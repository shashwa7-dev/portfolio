import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";

/**
 * The shared "View all" CTA.
 *
 * Every place that hands off to a fuller list once used a bare text link with a
 * small arrow, which read as a caption rather than as something to press. This
 * gives it the same bordered sticker-pill silhouette the rest of the app uses
 * for interactive chips (see `OrgLinkChip`), so it looks clickable, and keeps
 * all the call sites identical. Still mono and label-sized on purpose: in the
 * Projects section band it has to stay page structure, not body content.
 *
 * `next/link` because every destination is an internal route.
 */
export function ViewAllLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1 font-mono text-2xs uppercase tracking-label text-muted-foreground transition-colors duration-base ease-out hover:border-border-strong hover:text-foreground sticker sticker-sm candy:rounded-tag candy:font-semibold candy:text-foreground"
    >
      {children}
      <ArrowRight className="h-3 w-3 transition-transform duration-fast ease-out group-hover:translate-x-0.5" />
    </Link>
  );
}
