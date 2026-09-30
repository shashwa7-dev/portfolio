import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";

/**
 * The shared "View all" CTA: plain muted text and an arrow that nudges right on
 * hover. It used to be a bordered mono pill; on the minimal homepage that read
 * as a control competing with the section title, so it is a quiet link now.
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
      className="group inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors duration-base ease-out hover:text-foreground"
    >
      {children}
      <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-fast ease-out group-hover:translate-x-0.5" />
    </Link>
  );
}
