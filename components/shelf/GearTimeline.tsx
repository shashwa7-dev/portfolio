import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { gear } from "@/lib/gear";

/**
 * The gear, drawn as a timeline rather than a grid of tiles.
 *
 * A grid says "here are five objects". The order is the actual content: each
 * piece exists because of a problem the one before it left behind, and a
 * timeline is the only layout that carries that.
 *
 * The rail is drawn per step rather than as one border on the list, and only
 * between dots: it runs from this step's marker to the next one's, so the last
 * step ends on its dot instead of trailing a line down past the artwork and
 * the copy to the bottom of the list. A border on the <ol> cannot do that,
 * because it has no way to stop short of its own last child.
 *
 * The 11px is the marker's centre: `top-1.5` puts its top edge at 6, and it is
 * 10 tall. Running each rail from 11 to 11 past the item's bottom edge lands it
 * exactly on the next marker's centre, so the segments meet without a seam.
 */
export default function GearTimeline() {
  return (
    <ol className="ml-[5px]">
      {gear.map((step, i) => (
        <li
          key={step.slug}
          className={cn("relative pl-8", i < gear.length - 1 && "pb-10")}
        >
          {i < gear.length - 1 && (
            <span
              aria-hidden
              className="absolute left-0 top-[11px] -bottom-[11px] w-px bg-border"
            />
          )}
          <span
            aria-hidden
            className={cn(
              "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border",
              step.current
                ? "border-foreground bg-foreground"
                : "border-border-strong bg-background"
            )}
          />
          <p className="font-mono text-2xs uppercase tracking-label text-subtle">
            {step.when}
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:gap-6">
            {/* A small square on every width, rather than a full-width 16:10
                panel below `sm`. Stretched to the column it stood about 210px
                tall, so five steps pushed most of the timeline off a phone
                screen and the copy that explains each one sat below the fold.
                The artwork is a product cut-out on a plain field; it carries
                nothing at 210px that it does not carry at 96. */}
            <div className="flex aspect-square w-24 shrink-0 items-center justify-center rounded-xl border border-border bg-card p-3 sm:w-28">
              <Image
                src={step.image}
                alt={step.name}
                width={220}
                height={220}
                sizes="112px"
                className="h-full w-full object-contain grayscale transition-[filter] duration-base ease-out hover:grayscale-0"
              />
            </div>

            <div className="min-w-0">
              <p className="font-medium text-foreground">{step.name}</p>
              <p className="mt-0.5 font-mono text-2xs uppercase tracking-label text-subtle">
                {step.kind}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{step.note}</p>
              <a
                href={step.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 border-b border-border-strong pb-0.5 font-mono text-2xs uppercase tracking-label text-subtle transition-colors hover:text-foreground"
              >
                {step.vendor}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
