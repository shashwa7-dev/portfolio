"use client";

import { Book as BookProps } from "@/lib/books";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
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
        <Icon
          icon={"bitcoin-icons:verify-filled"}
          className="w-8 h-8 absolute top-0 right-0 text-green-500 z-[10]"
        />
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
        className={cn("absolute bottom-0 left-0 h-1 w-full bg-muted")}
      >
        <div
          className={cn(
            "h-1 bg-muted-foreground transition-all",
            progress >= 100 && "!bg-button-danger"
          )}
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
