import { getAllSideProjects } from "@/lib/projectsData";
import { goToShortcuts } from "@/lib/shortcutsData";

export type Command = {
  id: string;
  label: string;
  group: "Navigation" | "Projects" | "Actions";
  href?: string;
  action?: "toggle-theme" | "copy-email" | "open-shortcuts";
  /** Key hint shown on the right of the row, one chip per entry. */
  keys?: string[];
};

export function buildCommands(): Command[] {
  // Key hints are derived from `goToShortcuts` by href rather than hardcoded,
  // so renaming or rebinding a `g` shortcut cannot leave the palette showing a
  // chord that no longer works.
  const withGoToKeys = (c: Command): Command => {
    const dest = goToShortcuts.find((g) => g.href === c.href);
    return dest ? { ...c, keys: ["g", dest.key] } : c;
  };

  const nav: Command[] = (
    [
      { id: "nav-work", label: "Selected work", group: "Navigation", href: "/#projects" },
      { id: "nav-exp", label: "Experience", group: "Navigation", href: "/#experience" },
      { id: "nav-writing", label: "Writing", group: "Navigation", href: "/blogs" },
      { id: "nav-books", label: "Books", group: "Navigation", href: "/books" },
      { id: "nav-shelf", label: "Shelf", group: "Navigation", href: "/shelf" },
      // `/coffee` has no navbar entry of its own: it hangs off the shelf, and
      // a second coffee link in the header would oversell it. The palette is
      // the only direct route, so it stays listed here.
      { id: "nav-coffee", label: "Coffee", group: "Navigation", href: "/coffee" },
    ] satisfies Command[]
  ).map(withGoToKeys);
  const projects: Command[] = getAllSideProjects().map((p) => ({
    id: `proj-${p.slug}`,
    label: p.title,
    group: "Projects" as const,
    href: `/project/${p.slug}`,
  }));
  const actions: Command[] = [
    { id: "act-theme", label: "Toggle theme", group: "Actions", action: "toggle-theme", keys: ["t"] },
    { id: "act-email", label: "Copy email", group: "Actions", action: "copy-email" },
    { id: "act-shortcuts", label: "Keyboard shortcuts", group: "Actions", action: "open-shortcuts", keys: ["?"] },
  ];
  return nav.concat(projects, actions);
}

export function filterCommands(commands: Command[], q: string): Command[] {
  const s = q.trim().toLowerCase();
  if (!s) return commands;
  return commands.filter((c) => c.label.toLowerCase().includes(s) || c.group.toLowerCase().includes(s));
}
