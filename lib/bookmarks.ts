/**
 * Links worth keeping.
 *
 * `why` is required, not optional. A bookmark list without a reason attached is
 * a folder of links, and a folder of links is not worth a page. Making the
 * field non-optional means the compiler stops a lazy entry before it ships.
 */

export type Bookmark = {
  title: string;
  url: string;
  kind: "Channel" | "Video" | "Article" | "Repo" | "Tool";
  why: string;
};

export const bookmarks: Bookmark[] = [
  {
    title: "James Hoffmann",
    url: "https://www.youtube.com/@jameshoffmann",
    kind: "Channel",
    why: "Where I learnt most of what I know about coffee. Watch the espresso and grinder videos before buying anything.",
  },
  {
    title: "kengocodes/cyber-crowd",
    url: "https://github.com/kengocodes/cyber-crowd",
    kind: "Repo",
    why: "The generative drawing code my portrait engine started from. Worth reading end to end.",
  },
];
