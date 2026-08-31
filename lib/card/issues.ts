import { DICE_BANDS } from "@/lib/card/dice";
import type { Issue, IssueKey } from "@/lib/card/types";

export type { Issue, IssueKey } from "@/lib/card/types";

/**
 * The rarity numbers are not written here. They are read from the dice
 * bands, which are the counted 6d6 distribution, so there is exactly one
 * place a percentage can be wrong. Hand-editing a number into this file is
 * caught by issues.test.ts.
 */
function odds(key: IssueKey): Pick<Issue, "chance" | "label" | "range"> {
  const band = DICE_BANDS.find((b) => b.key === key);
  if (!band) throw new Error(`No dice band declared for issue "${key}"`);
  return { chance: band.chance, label: band.label, range: [band.min, band.max] };
}

/**
 * Named from philately rather than from a loot table.
 *
 * Two reasons. The artefact is a stamp, so the vocabulary is already sitting
 * there. And "common" is a deflating thing to tell half your visitors,
 * where "commemorative" is something a person would repeat out loud.
 *
 * Each issue changes something its name promises. That is a rule for anyone
 * adding a sixth: if the only difference is the gradient, it does not earn a
 * name.
 *
 * Which issue a visitor gets is decided by lib/card/dice.ts, from three
 * throws they make themselves, and is not fixed to their id. Their portrait
 * and serial still are. Identity is permanent, edition is fate.
 */
export const ISSUES: Record<IssueKey, Issue> = {
  definitive: {
    key: "definitive",
    name: "Definitive",
    ...odds("definitive"),
    sticker: null,
    inverted: false,
  },
  commemorative: {
    key: "commemorative",
    name: "Commemorative",
    ...odds("commemorative"),
    sticker: ["#8c8579", "#615b53", "#a49c8e", "#57524a", "#7d766b"],
    inverted: false,
  },
  firstDay: {
    key: "firstDay",
    name: "First day",
    ...odds("firstDay"),
    sticker: ["#2f6a88", "#63b6cf", "#bfe8ef", "#4b93bb", "#27596f"],
    inverted: false,
  },
  misprint: {
    key: "misprint",
    name: "Misprint",
    ...odds("misprint"),
    sticker: ["#ef548f", "#ef8b6d", "#cfef6b", "#3bf0c1", "#bb4af0"],
    inverted: false,
  },
  inverted: {
    key: "inverted",
    name: "Inverted",
    ...odds("inverted"),
    sticker: ["#6b4d12", "#c9a227", "#fff3c4", "#e8c96a", "#7a5c1e"],
    inverted: true,
  },
};

/**
 * "an Inverted", "a Misprint".
 *
 * Every string the site builds from an issue name needs this, and each one
 * that skipped it read wrong for exactly one of the five: the 0.06% card,
 * which is the only one anybody posts. Derived rather than special-cased on
 * "Inverted", so a sixth issue starting with a vowel cannot reintroduce it.
 */
export function indefiniteArticle(name: string): "a" | "an" {
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

/**
 * Resolves an `?issue=` query param to a real issue, or null.
 *
 * Takes `string | string[]` because that is what Next hands a page for a
 * query param, and a repeated `?issue=a&issue=b` arrives as an array. An
 * array fails the lookup and falls back to the generic card, which is
 * correct, but the parameter type has to admit it can happen.
 *
 * `hasOwnProperty`, not `key in ISSUES`. `in` walks the prototype chain, so
 * "constructor", "toString" and "__proto__" all answer true and hand back a
 * member of Object.prototype: `?issue=constructor` produced a card titled
 * "A Object souvenir card" pointing at og/issue-undefined.png. The param is
 * meant to be an enum with five values, and this is what makes it one.
 */
export function issueFromParam(
  key: string | string[] | undefined
): Issue | null {
  if (!key || typeof key !== "string") return null;
  return Object.prototype.hasOwnProperty.call(ISSUES, key)
    ? ISSUES[key as IssueKey]
    : null;
}
