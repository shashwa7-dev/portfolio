import { Book as BookProps } from "@/lib/books";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * A single book as a compact row. Used by the Activity section on the homepage.
 *
 * This used to take a `variant` prop of `"card" | "row"` defaulting to `"card"`,
 * but every call site passed `"row"`, so the entire card branch was unreachable:
 * roughly sixty lines of markup, a `motion.li` wrapper and an `itemVariants`
 * import that nothing could ever render. The shelf grid on /books is served by
 * `components/common/Book.tsx` instead. The branch is gone and the prop with it.
 *
 * Dropping it also made this a server component. `"use client"` was only there for
 * the deleted branch's `motion.li`, and `useMemo` over a handful of chapters was
 * never earning its keep.
 */
export default function BookListItem({
  slug,
  name,
  author,
  cover,
  chapters,
}: BookProps) {
  const completed = chapters.filter((c) => c.completed).length;
  const progress = chapters.length
    ? Math.round((completed / chapters.length) * 100)
    : 0;

  return (
    <Link
      href={`/books/${slug}`}
      className="group flex items-center gap-3 px-5 py-3 transition-[color,background-color,transform] duration-fast ease-out hover:bg-elevated active:scale-[0.98]"
    >
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-elevated">
        <Image
          src={cover}
          alt={`Cover of ${name}`}
          fill
          sizes="40px"
          className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs italic text-muted-foreground">{author}</p>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
        >
          {/* One fill colour at every value. A full-width bar already says
              complete, so recolouring at 100% was redundant signal carried by a
              hue the rest of the app does not use. */}
          <div
            className="h-1 rounded-full bg-foreground transition-[width] duration-base ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">
          {completed}/{chapters.length}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-base ease-out group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}
