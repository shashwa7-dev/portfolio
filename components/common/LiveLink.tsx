import { ArrowUpRight, Star } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

/**
 * The one "Live" link: a star, the label and an outbound arrow, used wherever
 * a product or project links to its live site.
 *
 * It shimmers on a loop, hovered or not. That breaks the usual rule against
 * ambient loops on purpose: this is the link we want people to notice. The
 * sweep is a mask over the whole label, so the text and both icons catch the
 * same light. `.live-shimmer` in globals.css holds it, and it stops under
 * reduced motion.
 *
 * - `outline` carries a border, for links sitting in running text or a meta
 *   line where it needs to read as a control.
 * - `ghost` is the same thing without the border, for link lists.
 */
export default function LiveLink({
  href,
  label = "Live",
  variant = "ghost",
  className,
}: {
  href: string;
  label?: string;
  variant?: "outline" | "ghost";
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex w-fit items-center whitespace-nowrap rounded-sm font-mono text-2xs font-medium uppercase tracking-label text-foreground transition-colors duration-fast ease-out",
        variant === "outline" ? "border border-border-strong px-2 py-0.5 hover:border-foreground/40" : "py-0.5",
        className
      )}
    >
      <span className="live-shimmer inline-flex items-center gap-1.5">
        <Star size={11} weight="fill" aria-hidden className="shrink-0 text-amber-700 transition-transform duration-med ease-out group-hover:rotate-[72deg] dark:text-amber-300" />
        {label}
        <ArrowUpRight size={10} weight="bold" aria-hidden className="shrink-0 transition-transform duration-fast ease-out group-hover:-translate-y-px group-hover:translate-x-px" />
      </span>
    </a>
  );
}
