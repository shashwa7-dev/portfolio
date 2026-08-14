"use client";

import { Book as BookProps } from "@/lib/books";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

/**
 * A shelf card: the cover, with the title and author on an overlay across the
 * bottom and a progress bar under that.
 *
 * This is the original treatment, restored. A flatter version was tried, with the
 * text below the cover and progress as a "8/24" count, and it lost more than it
 * gained: the overlay is what makes a wall of these read as a shelf rather than a
 * list with pictures.
 *
 * Four things differ from the original, all of them separate decisions rather
 * than part of that experiment:
 *
 * 1. `rounded-md` rather than `rounded-lg`, matching the radius scale's step for
 *    elements this size.
 * 2. Greyscale until hover, like every other image surface in the app.
 * 3. The progress bar's `transition-[width]` now carries duration and easing
 *    tokens. An arbitrary-value transition utility emits only
 *    `transition-property`, so with no duration the bar was snapping rather than
 *    animating and the class did nothing at all.
 * 4. `sizes` describes the real grid. It claimed `33vw` from when this was a
 *    fixed three-column layout; the grid is now two up, three at sm and four at
 *    md, so that was over-fetching on wide screens.
 */
export default function Book({
  slug,
  name,
  author,
  cover,
  chapters,
  isDone,
}: BookProps) {
  const [loaded, setLoaded] = useState(false);
  const progress = useMemo(() => {
    if (!chapters.length) return 0;

    const completed = chapters.reduce(
      (count, c) => count + (c.completed ? 1 : 0),
      0
    );

    return Math.round((completed / chapters.length) * 100);
  }, [chapters]);

  return (
    <Link
      href={`/books/${slug}`}
      className="group relative block aspect-[2/3] w-full overflow-hidden rounded-md border border-border bg-card"
    >
      {isDone && (
        /* Same verified-badge idiom as About.tsx and BookListItem. Inset from
           the corner rather than flush, so it reads as placed on the cover
           rather than clipped by it. */
        <span className="absolute right-1.5 top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-foreground text-background ring-2 ring-card">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}

      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 z-0 flex animate-pulse items-center justify-center bg-muted">
          <span className="text-sm italic opacity-50">offcod8</span>
        </div>
      )}

      {/* Cover */}
      <Image
        src={cover}
        alt={`Cover of ${name}`}
        fill
        className="object-cover opacity-90 grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 180px"
        priority={false}
        onLoadingComplete={() => setLoaded(true)}
      />

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label={`Reading progress for ${name}`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="absolute bottom-0 left-0 h-1 w-full bg-muted"
      >
        {/* One fill colour at every value; the width carries completion. */}
        <div
          className="h-1 bg-foreground transition-[width] duration-base ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-1 left-0 w-full bg-secondary px-2 py-1 text-xs backdrop-blur">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate italic text-muted-foreground">{author}</p>
      </div>
    </Link>
  );
}
