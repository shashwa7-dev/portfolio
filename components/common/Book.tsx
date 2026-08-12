"use client";

import { Book as BookProps } from "@/lib/books";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

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
      className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border bg-card block"
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
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-muted animate-pulse">
          <span className="text-sm opacity-50 italic">offcod8</span>
        </div>
      )}

      {/* Cover */}
      <Image
        src={cover}
        alt={`Cover of ${name}`}
        fill
        className="object-cover opacity-90"
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={false}
        onLoadingComplete={() => setLoaded(true)}
      />

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="absolute bottom-0 left-0 h-1 w-full bg-muted"
      >
        {/* One fill colour at every value; the width carries completion. */}
        <div
          className="h-1 bg-foreground transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-1 left-0 w-full backdrop-blur px-2 py-1 text-xs bg-secondary">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate italic text-muted-foreground">{author}</p>
      </div>
    </Link>
  );
}
