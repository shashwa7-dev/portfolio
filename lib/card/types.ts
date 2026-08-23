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

export type Cast = {
  hair: "short" | "long" | "bob" | "curls" | "buzz" | "topknot";
  glasses: "none" | "round" | "square";
  headwear: "none" | "flatCap" | "beanie";
  brow: "flat" | "arched" | "worried";
  mouth: "smile" | "line" | "open";
  /** 0 to 1, drives how heavily the face is hatched. */
  shade: number;
};

export type CardData = {
  visitorId: string;
  /** What the visitor typed, or "Visitor". */
  name: string;
  serial: string;
  issue: Issue;
  cast: Cast;
  /** "Bengaluru, IN" or null when the headers were absent. */
  origin: string | null;
  /** City alone for the cancel, or null. */
  city: string | null;
  /** "23 Aug 2026" */
  date: string;
};
