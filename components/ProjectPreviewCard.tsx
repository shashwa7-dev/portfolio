import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ProjectCardData } from "@/lib/projectCards";
import StackIcon, { type StackName } from "@/components/common/StackIcon";
import Shimmer from "@/components/common/Shimmer";

/**
 * Compact project card. Shared by the Featured-projects rows on the Experience
 * section and the Side-projects grid on the homepage, so a change here lands in
 * both places.
 *
 * The thumbnail fills a fixed-width column flush to the card's left edge, full
 * height, with no ring of its own. The card's own border is the only frame; a
 * second hairline around the image inside it reads as a box in a box. The card
 * carries `overflow-hidden` so the image takes the rounded corner from it rather
 * than needing its own radius.
 *
 * Two earlier approaches are recorded here because both were worse and it would
 * be easy to drift back into either.
 *
 * The image used to bleed across the left 38 percent at 70 percent opacity behind
 * a right-fading mask, with the copy offset by `pl-[40%]` to clear it. It was
 * never legible at that size behind a fade, so it spent a third of the card
 * saying nothing, the copy was squeezed into the remainder, and the width, the
 * mask stops and the copy's offset were three numbers that only worked as a set.
 *
 * The metric used to be a pill absolutely positioned over that image at
 * `max-w-[34%] truncate`, so "100K mints · day one" was clipped: the strongest
 * fact on the card was the one thing you could not read. A solid high-contrast
 * chip was tried instead and read as too loud for a card this small. It is now
 * plain mono text in `text-foreground`, sitting on the last row against a
 * `text-muted-foreground` tagline. In a palette with no hue, that step in
 * lightness is the emphasis lever, and it needs no container to work.
 */
export default function ProjectPreviewCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={project.href}
      className="group flex overflow-hidden rounded-lg border border-border bg-card transition-colors duration-base ease-out hover:border-border-strong"
    >
      {/* `self-stretch` is what makes this full height: the column takes its
          height from the content beside it, which `fill` then needs to resolve
          against. */}
      <span className="relative w-[4.5rem] shrink-0 self-stretch bg-elevated sm:w-20">
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes="80px"
          className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
        />
      </span>

      {/* These containers are divs, not spans. A span's content model is phrasing
          content, so the <p> below could not legally sit inside one; the enclosing
          <a> has a transparent content model, so flow content is fine here. */}
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">
            {project.title}
          </span>
          {/* Status flag ("Recent" on the newest side project, "Live" on a work
              project). It was bare mono text, which read as a stray word beside
              the title; a hairline pill makes it a label. `tone="surface"` because
              it sits on `bg-card`, which inverts with the theme, so the sheen has
              to invert with it. */}
          {project.badge && (
            <Shimmer
              tone="surface"
              className="inline-block shrink-0 rounded-sm border border-border-strong"
            >
              <span className="block px-1.5 font-mono text-2xs uppercase tracking-label text-foreground">
                {project.badge}
              </span>
            </Shimmer>
          )}
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-subtle transition-colors duration-base ease-out group-hover:text-foreground" />
        </div>

        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {project.tagline}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {project.metric && (
            <span className="truncate font-mono text-2xs font-medium text-foreground">
              {project.metric}
            </span>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-subtle">
            {project.stack.slice(0, 4).map((t) => (
              <StackIcon key={t} name={t as StackName} size={13} showLabel={false} />
            ))}
          </span>
        </div>
      </div>
    </Link>
  );
}
