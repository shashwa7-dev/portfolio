import Image from "next/image";
import { Lightning } from "@phosphor-icons/react/ssr";
import Label from "@/components/layout/Label";
import Callout from "@/components/common/Callout";
import StackIcon from "@/components/common/StackIcon";
import ProductMark from "@/components/common/ProductMark";
import type { TDiaryEntry, TDiaryMedia } from "@/lib/diaryData";

/**
 * Renders a single diary entry as flow content (no card chrome). Consumed
 * inside an <ol>/<ul> that controls between-entry spacing via divide-* or
 * space-y-*.
 *
 * Three parts, top to bottom:
 * 1. Masthead: the product mark (optional: an entry whose mark would just
 *    repeat the org logo leaves it out), title and summary, then a meta line
 *    (position when there is more than one entry, date) and the stack. The stack lives in
 *    the masthead so the entry ends on its media or Impact, not on chips.
 * 2. Body: context as an unlabelled lede, then the contributions as a
 *    definition list. Contributions are written "Feature: what it does", and
 *    the part before the colon is pulled out as the term so a reader can scan
 *    feature names down the left edge. A line with no such prefix renders
 *    full width.
 * 3. Impact, the punchline, as a `Callout`.
 */
export default function DiaryEntry({
  entry,
  index,
  total,
}: {
  entry: TDiaryEntry;
  index: number;
  total: number;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <article className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-start gap-4">
          {entry.logo && <ProductMark src={entry.logo} size={48} />}
          <div className="min-w-0 space-y-1">
            <h3 className="text-2xl font-medium tracking-tight text-foreground">{entry.title}</h3>
            <p className="text-base leading-relaxed text-muted-foreground">{entry.summary}</p>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-x-3 font-mono text-2xs uppercase tracking-label text-subtle">
            {total > 1 && (
              <>
                <span className="text-foreground">
                  {pad(index)} <span className="text-subtle">/ {pad(total)}</span>
                </span>
                <span aria-hidden className="text-border-strong">·</span>
              </>
            )}
            <span>{entry.date}</span>
          </div>
          {entry.stack && entry.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.stack.map((name) => (
                <StackIcon key={name} name={name} size={12} />
              ))}
            </div>
          )}
        </div>
      </header>

      {entry.context && (
        <p className="text-base leading-relaxed text-muted-foreground">
          {entry.context}
        </p>
      )}

      <div className="space-y-3">
        <Label>What it does</Label>
        <dl className="space-y-3">
          {entry.contributions.map((c, i) => {
            const [term, body] = splitTerm(c);
            return (
              <div key={i} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
                {term ? (
                  <dt className="text-sm font-semibold text-foreground">{term}</dt>
                ) : (
                  <dt className="sr-only">Detail</dt>
                )}
                <dd className={`text-sm leading-relaxed text-muted-foreground ${term ? "" : "sm:col-span-2"}`}>
                  {body}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {entry.impact && (
        <Callout label="Impact" icon={Lightning}>
          {entry.impact}
        </Callout>
      )}

      <DiaryMediaGrid media={entry.media} />
    </article>
  );
}

/**
 * "Feature: what it does" becomes [feature, what it does]. The 40-character
 * cap keeps a sentence that merely contains a colon from being split: a
 * feature name is a few words, never a clause.
 */
function splitTerm(line: string): [string | null, string] {
  const i = line.indexOf(": ");
  return i > 0 && i < 40 ? [line.slice(0, i), line.slice(i + 2)] : [null, line];
}

/**
 * Snapshots and recordings for an entry. A slot without `src` is a capture
 * that is planned but not made yet: it shows as a labelled placeholder in
 * development so the gap is visible, and is dropped in production.
 */
function DiaryMediaGrid({ media }: { media?: TDiaryMedia[] }) {
  const showPlaceholders = process.env.NODE_ENV !== "production";
  const slots = (media ?? []).filter((m) => m.src || showPlaceholders);
  if (slots.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {slots.map((m, i) => (
        <figure key={i} className={slots.length % 2 === 1 && i === 0 ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
          <div className="relative aspect-16/10 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
            {!m.src ? (
              <div className="flex h-full items-center justify-center border border-dashed border-border-strong p-4 text-center font-mono text-2xs uppercase tracking-label text-subtle">
                {m.kind} slot
              </div>
            ) : m.kind === "video" ? (
              <video
                src={m.src}
                poster={m.poster}
                autoPlay
                muted
                loop
                playsInline
                aria-label={m.alt}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image src={m.src} alt={m.alt} fill sizes="(min-width: 640px) 380px, 100vw" className="object-cover" />
            )}
          </div>
          <figcaption className="text-xs leading-relaxed text-subtle">{m.alt}</figcaption>
        </figure>
      ))}
    </div>
  );
}
