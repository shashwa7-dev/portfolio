import { ISSUES } from "@/lib/card/issues";
import { serialFrom } from "@/lib/card/seed";
import type { CardData, IssueKey, RollSet } from "@/lib/card/types";

/**
 * The five example cards, one per issue.
 *
 * Here rather than inside the component that first drew them, because two
 * things now need the same five: the ladder on `/card`, and the script that
 * renders the link-preview images (`scripts/render-issue-og.ts`). A preview
 * showing a different Misprint from the one on the page would be a small lie
 * told at the only moment anyone is looking.
 *
 * Pure data with no DOM in it, which is what lets the script import it from
 * Node at all.
 */

/* Fixed ids and rolls, one per issue, so every visitor sees the same five
   specimens and each one prints a total that actually falls inside the range
   printed beside it. */
export const SPECIMEN_ROLLS: Record<IssueKey, RollSet> = {
  definitive: [[3, 4], [5, 2], [6, 1]],
  commemorative: [[4, 4], [4, 4], [4, 4]],
  firstDay: [[5, 4], [5, 4], [5, 4]],
  misprint: [[6, 5], [6, 5], [5, 4]],
  inverted: [[6, 6], [6, 6], [6, 5]],
};

export const SPECIMENS: Record<IssueKey, { id: string; name: string; city: string; origin: string }> = {
  definitive: { id: "specimen-definitive", name: "Maya", city: "Lisbon", origin: "Lisbon, PT" },
  commemorative: { id: "specimen-commemorative", name: "Jonas", city: "Berlin", origin: "Berlin, DE" },
  firstDay: { id: "specimen-firstday", name: "Priya", city: "Toronto", origin: "Toronto, CA" },
  misprint: { id: "specimen-misprint", name: "Ade", city: "Lagos", origin: "Lagos, NG" },
  inverted: { id: "specimen-inverted", name: "Ana", city: "Porto", origin: "Porto, PT" },
};

/** The specimen for an issue: its own issue, never the one its id happens to
 *  roll, and a fixed roll so the five never differ between visitors. */
export function specimenData(key: IssueKey): CardData {
  const s = SPECIMENS[key];
  return {
    visitorId: s.id,
    name: s.name,
    serial: serialFrom(s.id),
    issue: ISSUES[key],
    roll: SPECIMEN_ROLLS[key],
    origin: s.origin,
    city: s.city,
    date: "23 Aug 2026",
  };
}
