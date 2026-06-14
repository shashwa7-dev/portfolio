// Single source of truth for global keyboard shortcuts. Consumed by both the
// KeyboardShortcuts handler (to act on keys) and its cheatsheet overlay (to
// render them), so the two never drift apart.

export type GoTo = { key: string; label: string; href: string };

/** `g` then <key> jumps. Letters map to nav destinations. */
export const goToShortcuts: GoTo[] = [
  { key: "h", label: "Home", href: "/" },
  { key: "w", label: "Work", href: "/#experience" },
  { key: "p", label: "Projects", href: "/#projects" },
  { key: "r", label: "Writing", href: "/blogs" },
  { key: "b", label: "Books", href: "/books" },
  { key: "d", label: "Design", href: "/design" },
];

export type Shortcut = { keys: string[]; label: string };

export const shortcutGroups: { title: string; items: Shortcut[] }[] = [
  {
    title: "General",
    items: [
      { keys: ["⌘", "K"], label: "Open command menu" },
      { keys: ["t"], label: "Toggle theme" },
      { keys: ["?"], label: "Show this help" },
    ],
  },
  {
    title: "Go to",
    items: goToShortcuts.map((g) => ({ keys: ["g", g.key], label: g.label })),
  },
];
