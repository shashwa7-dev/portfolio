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
  /** Percentage of all cards. The five sum to 100. */
  share: number;
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
