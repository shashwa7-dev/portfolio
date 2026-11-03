/**
 * A small dot-matrix icon drawn from a bitmap ("#" lit, "." unlit), in the
 * same dot language as the section glyphs (SectionLabel) and the Doto label
 * face. It reuses `.section-glyph`, so inside any `.section-head` it ripples
 * corner to corner on hover, exactly like a section label's glyph.
 */
export const GLYPHS = {
  bolt: ["...##", "..##.", ".####", "..##.", ".##.."],
} as const;

export default function DotGlyph({ rows, className = "" }: { rows: readonly string[]; className?: string }) {
  const cols = rows[0].length;
  return (
    <span
      aria-hidden
      className={`section-glyph dot-glyph grid shrink-0 gap-px ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
    >
      {rows.flatMap((row, r) =>
        row.split("").map((ch, c) => (
          <span
            key={`${r}-${c}`}
            data-on={ch === "#" ? "" : undefined}
            style={{ "--dot": r + c } as React.CSSProperties}
            className="h-0.5 w-0.5 rounded-full bg-current"
          />
        ))
      )}
    </span>
  );
}
