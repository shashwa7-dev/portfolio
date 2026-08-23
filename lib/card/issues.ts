import { hashWith, mulberry32 } from "@/lib/card/seed";
import type { Issue, IssueKey } from "@/lib/card/types";

export type { Issue, IssueKey } from "@/lib/card/types";

/**
 * Named from philately rather than from a loot table.
 *
 * Two reasons. The artefact is a stamp, so the vocabulary is already sitting
 * there. And "common" is a deflating thing to tell 27% of your visitors,
 * where "commemorative" is something a person would repeat out loud.
 *
 * Each issue changes something its name promises. That is a rule for anyone
 * adding a sixth: if the only difference is the gradient, it does not earn a
 * name.
 */
export const ISSUES: Record<IssueKey, Issue> = {
  definitive: {
    key: "definitive",
    name: "Definitive",
    share: 60,
    sticker: null,
    inverted: false,
  },
  commemorative: {
    key: "commemorative",
    name: "Commemorative",
    share: 27,
    sticker: ["#8c8579", "#615b53", "#a49c8e", "#57524a", "#7d766b"],
    inverted: false,
  },
  firstDay: {
    key: "firstDay",
    name: "First day",
    share: 11.9,
    sticker: ["#2f6a88", "#63b6cf", "#bfe8ef", "#4b93bb", "#27596f"],
    inverted: false,
  },
  misprint: {
    key: "misprint",
    name: "Misprint",
    share: 1,
    sticker: ["#ef548f", "#ef8b6d", "#cfef6b", "#3bf0c1", "#bb4af0"],
    inverted: false,
  },
  inverted: {
    key: "inverted",
    name: "Inverted",
    share: 0.1,
    sticker: ["#6b4d12", "#c9a227", "#fff3c4", "#e8c96a", "#7a5c1e"],
    inverted: true,
  },
};

/**
 * Order matters: the bands are walked in this sequence, so it must run from
 * commonest to rarest.
 */
const BANDS: readonly IssueKey[] = [
  "definitive",
  "commemorative",
  "firstDay",
  "misprint",
  "inverted",
];

/**
 * Fixed to the visitor id, so a person's issue never changes. There is no
 * re-roll: the card is theirs, not a pull.
 */
export function issueFrom(visitorId: string): IssueKey {
  const roll = mulberry32(hashWith(visitorId, "issue"))() * 100;
  let floor = 0;
  for (const key of BANDS) {
    floor += ISSUES[key].share;
    if (roll < floor) return key;
  }
  return "inverted";
}
