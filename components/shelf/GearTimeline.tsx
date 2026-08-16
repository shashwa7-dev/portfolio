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
 * The rail is a left border on the list with a marker absolutely positioned
 * over it, so the line joins the steps without any element needing to know how
 * tall its neighbours are.
 */
export default function GearTimeline() {
  return (
    <ol className="ml-[5px] border-l border-border">
      {gear.map((step, i) => (
        <li
          key={step.slug}
          className={cn("relative pl-8", i < gear.length - 1 && "pb-10")}
        >
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
            <div className="flex aspect-[16/10] w-full shrink-0 items-center justify-center rounded-xl border border-border bg-card p-3 sm:aspect-square sm:w-28">
              <Image
                src={step.image}
                alt={step.name}
                width={220}
                height={220}
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
