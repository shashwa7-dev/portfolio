"use client";

import { Book as BookProps } from "@/lib/books";
import { Check, ArrowRight } from "lucide-react";
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
  variant = "card",
}: BookProps & { variant?: "card" | "row" }) {
  const progress = useMemo(() => {
    if (!chapters.length) return 0;
    const completed = chapters.reduce(
      (count, c) => count + (c.completed ? 1 : 0),
      0
    );
    return Math.round((completed / chapters.length) * 100);
  }, [chapters]);

  if (variant === "row") {
    return (
      <Link
        href={`/books/${slug}`}
        className="group flex items-center gap-3 px-5 py-3 transition-[color,background-color,transform] duration-150 ease-out hover:bg-elevated active:scale-[0.98]"
      >
        {/* Cover thumbnail */}
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
          {isDone && (
            /* Reuses the verified-badge idiom from About.tsx: a solid
               foreground disc with inverted glyph and a ring that separates it
               from whatever cover art sits behind. Previously a bare green
               CheckCircle2 floating on the artwork, which read as a sticker and
               introduced a hue the palette does not use anywhere else. */
            <span className="absolute right-1 top-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background ring-2 ring-card">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
          <Image
            src={cover}
            alt={`Cover of ${name}`}
            fill
            className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
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
            {/* One fill colour at every value. A full-width bar already says
                complete, so recolouring at 100% was redundant signal carried by
                a hue the rest of the app does not use. */}
            <div
              className="h-1 rounded-full bg-foreground transition-[width] duration-base ease-out"
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
    );
  }

  return (
    <motion.li variants={itemVariants}>
      <Link
        href={`/books/${slug}`}
        className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-[color,background-color,border-color,transform] duration-150 ease-out hover:border-border-strong hover:bg-muted active:scale-[0.98]"
      >
        {/* Cover thumbnail */}
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
          {isDone && (
            /* Reuses the verified-badge idiom from About.tsx: a solid
               foreground disc with inverted glyph and a ring that separates it
               from whatever cover art sits behind. Previously a bare green
               CheckCircle2 floating on the artwork, which read as a sticker and
               introduced a hue the palette does not use anywhere else. */
            <span className="absolute right-1 top-1 z-10 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background ring-2 ring-card">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
          <Image
            src={cover}
            alt={`Cover of ${name}`}
            fill
            className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
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
            {/* One fill colour at every value. A full-width bar already says
                complete, so recolouring at 100% was redundant signal carried by
                a hue the rest of the app does not use. */}
            <div
              className="h-1 rounded-full bg-foreground transition-[width] duration-base ease-out"
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
