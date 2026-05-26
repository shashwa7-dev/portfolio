import { getAllSideProjects } from "@/lib/projectsData";

export type Command = {
  id: string;
  label: string;
  group: "Navigation" | "Projects" | "Actions";
  href?: string;
  action?: "toggle-theme" | "copy-email";
};

export function buildCommands(): Command[] {
  const nav: Command[] = [
    { id: "nav-work", label: "Selected work", group: "Navigation", href: "/#projects" },
    { id: "nav-exp", label: "Experience", group: "Navigation", href: "/#experience" },
    { id: "nav-writing", label: "Writing", group: "Navigation", href: "/blogs" },
    { id: "nav-books", label: "Books", group: "Navigation", href: "/books" },
  ];
  const projects: Command[] = getAllSideProjects().map((p) => ({
    id: `proj-${p.slug}`,
    label: p.title,
    group: "Projects" as const,
    href: `/project/${p.slug}`,
  }));
  const actions: Command[] = [
    { id: "act-theme", label: "Toggle theme", group: "Actions", action: "toggle-theme" },
    { id: "act-email", label: "Copy email", group: "Actions", action: "copy-email" },
  ];
  return nav.concat(projects, actions);
}

export function filterCommands(commands: Command[], q: string): Command[] {
  const s = q.trim().toLowerCase();
  if (!s) return commands;
  return commands.filter((c) => c.label.toLowerCase().includes(s) || c.group.toLowerCase().includes(s));
}
