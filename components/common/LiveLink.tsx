import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

/**
 * The one "Live" link: the label and an outbound arrow, used wherever a
 * product or project links to its live site. Plain text, no border.
 *
 * It shimmers on a loop, hovered or not. That breaks the usual rule against
 * ambient loops on purpose: this is the link we want people to notice. The
 * sweep is a mask over the whole label, so the text and the arrow catch the
 * same light. `.live-shimmer` in globals.css holds it, and it stops under
 * reduced motion.
 */
export default function LiveLink({
  href,
  label = "Live",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex w-fit items-center whitespace-nowrap py-0.5 font-mono text-2xs font-medium uppercase tracking-label text-foreground",
        className
      )}
    >
      <span className="live-shimmer inline-flex items-center gap-1">
        {label}
        <ArrowUpRight size={10} weight="bold" aria-hidden className="shrink-0 transition-transform duration-fast ease-out group-hover:-translate-y-px group-hover:translate-x-px" />
      </span>
    </a>
  );
}
