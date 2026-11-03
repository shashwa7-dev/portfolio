/**
 * The section label row, shared by `Section` (homepage, /shelf, /swoopy) and
 * the /cv sheet's section heads, so the two can never drift apart:
 *
 *   ⠿ WRITING · · · · · · · · · · · · · 02 →
 *
 * A 3x3 dot-matrix glyph hashed from the label, the label in the dot face
 * (`font-label`), a dotted leader, the section's place on the page from a CSS
 * counter (`.section-no`, so it renumbers itself), then an optional action
 * such as the icon-only `ViewAllLink`. Hovering the row ripples the glyph
 * (`.section-head` in globals.css).
 */

/**
 * The glyph's pattern: an FNV-1a hash of the label, so a label always gets
 * the same mark and new sections need no hand-kept table. Four to seven dots
 * are lit, so none reads as empty or as a solid block.
 */
function glyph(label: string): boolean[] {
  let h = 2166136261;
  for (const ch of label) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const dots = Array.from({ length: 9 }, (_, i) => ((h >>> i) & 1) === 1);
  for (let i = 0; dots.filter(Boolean).length < 4; i += 2) dots[i % 9] = true;
  for (let i = 1; dots.filter(Boolean).length > 7; i += 2) dots[i % 9] = false;
  return dots;
}

type Props = {
  label: string;
  /** The label's element: "h2" when it is the section's heading, "p" when a title follows. */
  as?: "h2" | "p";
  action?: React.ReactNode;
  className?: string;
};

export default function SectionLabel({ label, as: Tag = "h2", action, className = "" }: Props) {
  return (
    <div className={`section-head flex items-center gap-3 ${className}`}>
      <span aria-hidden className="section-glyph grid shrink-0 grid-cols-3 gap-0.5 text-subtle">
        {glyph(label).map((on, i) => (
          <span
            key={i}
            data-on={on ? "" : undefined}
            // Diagonal order, so the ripple runs corner to corner.
            style={{ "--dot": Math.floor(i / 3) + (i % 3) } as React.CSSProperties}
            className="h-1 w-1 rounded-full bg-current"
          />
        ))}
      </span>
      <Tag className="font-label label-section shrink-0 text-subtle">{label}</Tag>
      <span aria-hidden className="section-leader min-w-6 flex-1" />
      <span className="-ml-1 flex shrink-0 items-center gap-1">
        <span aria-hidden className="section-no font-label text-xs tabular-nums text-subtle" />
        {action}
      </span>
    </div>
  );
}
