import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ProjectCardData } from "@/lib/projectCards";
import StackIcon, { type StackName } from "@/components/common/StackIcon";

/**
 * Compact project card. Shared by the Featured-projects rows on the Experience
 * section and the Side-projects grid on the homepage, so a change here lands in
 * both places.
 *
 * The thumbnail is not an inline box any more. It bleeds from the card's left
 * edge across roughly half the width and fades out to the right, so it reads as
 * part of the card surface rather than as a pasted rectangle. The copy sits on
 * top of it, offset far enough right that it never lands on the solid part of
 * the image.
 */
export default function ProjectPreviewCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={project.href}
      className="group relative flex min-h-[4.75rem] items-center overflow-hidden rounded-xl border border-border bg-card p-2.5 transition-colors duration-base ease-out hover:border-border-strong"
    >
      {/* Thumbnail: anchored to the left edge, full card height, masked so it
          dissolves rightward into the card instead of ending on a hard edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[52%] select-none"
      >
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover object-left-top opacity-70 transition-transform duration-base ease-out group-hover:scale-[1.04]"
          style={{
            maskImage:
              "linear-gradient(to right, black 0%, black 30%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0%, black 30%, transparent 100%)",
          }}
        />
      </div>

      {/* Copy, above the thumbnail and clear of its solid region. */}
      <div className="relative z-[1] min-w-0 flex-1 pl-[34%]">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">{project.title}</span>
          {project.badge && (
            <span className="shrink-0 font-mono text-2xs uppercase tracking-label text-foreground">{project.badge}</span>
          )}
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-subtle transition-colors duration-base ease-out group-hover:text-foreground" />
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">{project.tagline}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-subtle">
          {project.stack.slice(0, 4).map((t) => (
            <StackIcon key={t} name={t as StackName} size={13} showLabel={false} />
          ))}
        </div>
      </div>

      {/* Metric moves out of the old thumbnail box and pins to the card's
          bottom-left, over the solid part of the image. */}
      {project.metric && (
        <span className="absolute bottom-1.5 left-2.5 z-[1] max-w-[30%] truncate rounded-full border border-border-strong bg-background/80 px-1.5 font-mono text-2xs font-medium text-foreground backdrop-blur">
          {project.metric}
        </span>
      )}
    </Link>
  );
}
