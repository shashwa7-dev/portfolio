"use client";

import { Book as BookProps } from "@/lib/books";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import { itemVariants } from "@/lib/motionVariants";

export default function BookListItem({
  slug,
  name,
  author,
  cover,
  chapters,
  isDone,
}: BookProps) {
  const progress = useMemo(() => {
    if (!chapters.length) return 0;
    const completed = chapters.reduce(
      (count, c) => count + (c.completed ? 1 : 0),
      0
    );
    return Math.round((completed / chapters.length) * 100);
  }, [chapters]);

  return (
    <motion.li variants={itemVariants}>
      <Link
        href={`/books/${slug}`}
        className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-accent/50 hover:bg-accent/5"
      >
        {/* Cover thumbnail */}
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded border bg-muted">
          {isDone && (
            <CheckCircle2 className="absolute right-0.5 top-0.5 z-10 h-4 w-4 text-green-500" />
          )}
          <Image
            src={cover}
            alt={`Cover of ${name}`}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs italic text-muted-foreground">
            {author}
          </p>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-1 rounded-full transition-all",
                progress >= 100 ? "bg-green-500" : "bg-muted-foreground"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Chapter count + arrow */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {chapters.filter((c) => c.completed).length}/{chapters.length}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </Link>
    </motion.li>
  );
}
