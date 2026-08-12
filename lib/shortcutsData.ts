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
];

export type Shortcut = { keys: string[]; label: string };

/**
 * `MOD_KEY` is a placeholder, resolved to ⌘ or Ctrl when rendered.
 *
 * It cannot be resolved here: this module is imported by a server-rendered tree
 * and `navigator` does not exist there, so the platform is only knowable in the
 * component. It used to be a hardcoded "⌘", which meant the cheatsheet told every
 * Windows and Linux visitor the wrong key for a shortcut that works on both, since
 * CommandPalette listens for `metaKey || ctrlKey`.
 */
export const MOD_KEY = "mod";

export const shortcutGroups: { title: string; items: Shortcut[] }[] = [
  {
    title: "General",
    items: [
      { keys: [MOD_KEY, "K"], label: "Open command menu" },
      { keys: ["t"], label: "Toggle theme" },
      { keys: ["?"], label: "Show this help" },
    ],
  },
  {
    title: "Go to",
    items: goToShortcuts.map((g) => ({ keys: ["g", g.key], label: g.label })),
  },
];
