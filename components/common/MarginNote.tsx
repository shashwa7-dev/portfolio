import { marginNotes } from "@/lib/marginNotes";

/**
 * A handwritten aside beside a homepage row. In the right margin, rotated, from
 * `lg` (1024px). The note is 96px wide plus a 16px gap (112px), which fits the
 * ~124px margin left at 1024px even with a classic scrollbar; the few words
 * wrap to two or three lines. Inline under the row, upright, below `lg`.
 *
 * `indent` lines the inline (mobile) note up under a row's name when the row
 * starts with a logo; rows without one pass `indent={false}`.
 *
 * Caveat comes from `--font-hand`, which the root layout already sets on
 * <body> for the visitor card. Real content, read after the row it annotates.
 */
export default function MarginNote({ id, indent = true }: { id: string; indent?: boolean }) {
  const note = marginNotes[id];
  if (!note) return null;
  return (
    <p
      className={`pb-1 ${indent ? "pl-10" : ""} text-lg leading-none text-amber-700 dark:text-amber-300/90 lg:absolute lg:left-full lg:top-2 lg:ml-4 lg:w-24 lg:pb-0 lg:pl-0 lg:transform-[rotate(var(--note-rotate))]`}
      style={{ fontFamily: "var(--font-hand), cursive", ["--note-rotate" as string]: `${note.rotate}deg` }}
    >
      {note.text}
    </p>
  );
}
