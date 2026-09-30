import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";

/**
 * A highlighted takeaway: the one statement in a block of prose that a reader
 * should leave with (a diary entry's Impact, a post's key result). Use it at
 * most once per block. It stops reading as the punchline the moment two of
 * them sit side by side.
 *
 * Built as a fieldset so the label notches into the border: the browser cuts
 * the border behind a <legend> itself, so the label needs no background fill
 * and the callout sits correctly on any surface. The site accent is
 * monochrome ink, so the emphasis comes from the strong border and the
 * full-foreground text, not colour. In Candy it becomes a butter sticker with
 * an ink tag for a label.
 */
export default function Callout({
  label,
  icon: IconComponent,
  children,
}: {
  label: string;
  icon?: Icon;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-border-strong px-5 pb-5 pt-3 candy:rounded-sticker candy:border-2 candy:border-foreground candy:bg-candy-butter candy:shadow-sticker-1">
      <legend className="-ml-1 flex items-center gap-1.5 px-2 font-mono text-2xs uppercase tracking-label text-foreground candy:ml-0 candy:rounded-tag candy:bg-foreground candy:py-0.5 candy:text-background">
        {IconComponent && <IconComponent aria-hidden weight="fill" className="h-3 w-3" />}
        {label}
      </legend>
      <div className="text-base font-medium leading-relaxed text-foreground">{children}</div>
    </fieldset>
  );
}
