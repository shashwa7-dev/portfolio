import type { Book as BookProps } from "@/lib/books";
import Image from "next/image";
import Link from "next/link";

/**
 * A shelf card: cover, title, author, progress.
 *
 * It used to stack five layers on the cover itself — a done badge, a loading
 * skeleton, the image, a progress bar, and a backdrop-blurred strip carrying the
 * title and author. Five overlays on a 2:3 thumbnail is a lot of machinery for
 * something a reader glances at, and the blurred strip covered the bottom third
 * of the artwork, which is the part a book cover usually puts its title on.
 *
 * Now the cover is just the cover and the text sits underneath it, which is how
 * shelves work. Progress is a count rather than a bar: "8/24" says more than a
 * partially filled line, and it needs no extra element.
 *
 * Dropping the skeleton also made this a server component. The `loaded` state
 * existed only to fade a placeholder out, which `bg-elevated` behind the image
 * does without JavaScript, and `useMemo` for a filter over a handful of chapters
 * was never earning its keep either.
 */
export default function Book({
  slug,
  name,
  author,
  cover,
  chapters,
  isDone,
}: BookProps) {
  const completed = chapters.filter((c) => c.completed).length;

  return (
    <Link href={`/books/${slug}`} className="group block">
      <span className="relative block aspect-[2/3] overflow-hidden rounded-lg border border-border bg-elevated">
        <Image
          src={cover}
          alt={`Cover of ${name}`}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 180px"
          className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
        />
      </span>

      <span className="mt-2 block truncate text-sm font-medium text-foreground">
        {name}
      </span>

      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{author}</span>
        <span aria-hidden className="text-border-strong">
          ·
        </span>
        <span className="shrink-0 font-mono text-2xs tabular-nums">
          {isDone ? "Done" : `${completed}/${chapters.length}`}
        </span>
      </span>
    </Link>
  );
}
