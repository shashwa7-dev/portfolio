import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { gear } from "@/lib/gear";

/**
 * The gear, as a list of rows in the order it was bought.
 *
 * A grid says "here are five objects". The order is the actual content: each
 * piece exists because of a problem the one before it left behind, so the
 * sequence has to survive whatever shape this takes.
 *
 * It used to survive as a proper timeline, with a rail, a marker per step and
 * the full note beside each. That ran about 1450px on a phone, roughly three
 * screens, for five pieces of kitchen equipment sitting inside a section that
 * also holds the roasters and a link to the long read. The order is worth
 * carrying. Three screens is not what it is worth.
 *
 * So the rail is gone and the rows do the sequencing instead: they are stacked,
 * numbered by position, and the `when` phrase on each ("Started here", "The
 * real bottleneck") says where in the chain it sits. That was always the thing
 * doing the work. The rail was drawing what the words already said.
 *
 * The long note stays in the data and is told properly in the `/coffee` read,
 * which is linked directly under this. The row carries `short` instead.
 */
export default function GearTimeline() {
  /* No rule between rows, and none around the list.
     Each row already carries a picture, a name in medium, and a line of
     description, which is more than enough to tell one from the next. The
     rules were separating things that were not running together, and forty
     five of them across this page turned a shelf into a spreadsheet.

     What replaces them is a tint on hover. A rule is on all the time and says
     nothing; the tint appears only when the reader is pointing at a row, which
     is the one moment knowing its exact extent is useful. The negative margin
     lets that tint reach past the text into the gutter, so it reads as a row
     rather than as a highlighted paragraph. */
  return (
    <ol className="-mx-3">
      {gear.map((step) => (
        <li key={step.slug}>
          <div className="group flex items-start gap-3 rounded-lg px-3 py-3.5 transition-colors duration-base ease-out hover:bg-elevated sm:gap-4">
            {/* 56px, down from 96. The artwork is a product cut-out on a plain
                field, and it carries nothing at 96 that it does not carry at
                56, so the extra 40px was 200px of page across five rows. */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-card p-1.5">
              <Image
                src={step.image}
                alt={step.name}
                width={220}
                height={220}
                sizes="56px"
                /* `group-hover`, not `hover`. On its own hover the picture
                   only found its colour when the cursor was directly over a
                   56px square, so pointing anywhere else on the row tinted the
                   row and left the image grey, which read as two things
                   reacting to two different gestures. */
                className="h-full w-full object-contain grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
              />
            </div>

            <div className="min-w-0 flex-1">
              {/* Name and vendor share a line. The vendor was a third line of
                  its own with 12px above it, which is a lot of page for the
                  word "Wacaco". */}
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate font-medium text-foreground">
                  {step.name}
                </p>
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 font-mono text-2xs uppercase tracking-label text-subtle transition-colors duration-fast ease-out hover:text-foreground"
                >
                  {step.vendor}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              {/* What it is and where in the chain it sits, on one line. The
                  dot marking whatever is in use replaces the filled marker the
                  rail used to carry. */}
              <p className="mt-0.5 flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-subtle">
                {step.current && (
                  <span
                    aria-label="What I use most"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground"
                  />
                )}
                <span className="truncate">
                  {step.kind}
                  <span aria-hidden className="text-border-strong">
                    {"  ·  "}
                  </span>
                  {step.when}
                </span>
              </p>

              <p
                className={cn(
                  "mt-1.5 text-sm leading-snug text-muted-foreground",
                  "max-w-[58ch]"
                )}
              >
                {step.short}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
