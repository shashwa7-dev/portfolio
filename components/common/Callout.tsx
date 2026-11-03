import type { ReactNode } from "react";
import DotGlyph from "@/components/common/DotGlyph";

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
 *
 * The label's mark is a dot-matrix glyph (DotGlyph), matching the section
 * labels; hovering the callout ripples it (`section-head` on the fieldset).
 */
export default function Callout({
  label,
  glyph,
  children,
}: {
  label: string;
  /** A DotGlyph bitmap, e.g. GLYPHS.bolt. */
  glyph?: readonly string[];
  children: ReactNode;
}) {
  return (
    <fieldset className="section-head rounded-xl border border-border-strong px-5 pb-5 pt-3 candy:rounded-sticker candy:border-2 candy:border-foreground candy:bg-candy-butter candy:shadow-sticker-1">
      <legend className="-ml-1 flex items-center gap-1.5 px-2 font-label text-2xs uppercase tracking-label text-foreground candy:ml-0 candy:rounded-tag candy:bg-foreground candy:py-0.5 candy:text-background">
        {glyph && <DotGlyph rows={glyph} />}
        {label}
      </legend>
      <div className="text-base font-medium leading-relaxed text-foreground">{children}</div>
    </fieldset>
  );
}
