import Label from "@/components/layout/Label";
import StackIcon from "@/components/common/StackIcon";
import { withMarker } from "@/lib/markerHighlight";
import type { TDiaryEntry } from "@/lib/diaryData";

/**
 * Renders a single diary entry as flow content (no card chrome). Consumed
 * inside an <ol>/<ul> that controls between-entry spacing via divide-* or
 * space-y-*.
 *
 * The Impact callout keeps its accent-tinted left-border treatment — that's
 * the punchline of the entry, not card UI.
 */
export default function DiaryEntry({
  entry,
  index,
}: {
  entry: TDiaryEntry;
  index: number;
}) {
  const num = String(index).padStart(2, "0");
  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-hover">
          {num}
        </span>
        <h3 className="font-serif text-[1.35rem] font-semibold tracking-tight text-foreground">
          {entry.title}
        </h3>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {entry.date}
        </span>
      </header>

      <p className="text-[15px] font-medium leading-relaxed text-foreground/90">
        {withMarker(entry.summary, entry.summaryHighlight, "marker", 0.1)}
      </p>

      {entry.context && (
        <div className="space-y-2">
          <Label>Context</Label>
          <p className="text-sm leading-relaxed text-muted-foreground">{entry.context}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Contributions</Label>
        <ul className="space-y-2">
          {entry.contributions.map((c, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
            >
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {entry.impact && (
        <div className="rounded-lg border-l-2 border-accent bg-accent/5 px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Impact
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {withMarker(entry.impact, entry.impactHighlight, "line", 0.35)}
          </p>
        </div>
      )}

      {entry.stack && entry.stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {entry.stack.map((name) => (
            <StackIcon key={name} name={name} size={12} />
          ))}
        </div>
      )}
    </article>
  );
}
