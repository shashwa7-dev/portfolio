export type IssueKey =
  | "definitive"
  | "commemorative"
  | "firstDay"
  | "misprint"
  | "inverted";

export type Issue = {
  key: IssueKey;
  /** Shown on the card and in the gallery. */
  name: string;
  /**
   * Exact per-roll probability as a percentage, e.g. 12.495713. Comes from
   * DICE_BANDS and is asserted against an exhaustive enumeration of every
   * possible roll. Tested, never displayed: render `label` instead.
   */
  chance: number;
  /** The rounded string that renders, e.g. "12.5%". */
  label: string;
  /** The inclusive pip-total band that produces this issue. */
  range: readonly [number, number];
  /** Five gradient stops for the sticker, or null for the issue that has none. */
  sticker: readonly string[] | null;
  /** Only the rarest issue flips the stock. */
  inverted: boolean;
};

export type CardData = {
  visitorId: string;
  /** What the visitor typed, or "Visitor". */
  name: string;
  serial: string;
  issue: Issue;
  /** "Bengaluru, IN" or null when the headers were absent. */
  origin: string | null;
  /** City alone for the cancel, or null. */
  city: string | null;
  /** "23 Aug 2026" */
  date: string;
  /**
   * The three throws that produced this issue. Printed on the card so a
   * downloaded PNG records how it was earned and can be checked against
   * the ladder. Not persisted anywhere: a re-roll produces a new set.
   */
  roll: RollSet;
};

/** One face of one die. */
export type Die = 1 | 2 | 3 | 4 | 5 | 6;

/** One throw of two dice. */
export type Roll = readonly [Die, Die];

/**
 * Three throws, which is the whole set a visitor makes before their card
 * prints. Six dice in total, so the pip total runs 6 to 36.
 */
export type RollSet = readonly [Roll, Roll, Roll];
