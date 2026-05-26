import type { TSideProject } from "@/lib/projectsData";

export type FilterTag = { tag: string; count: number };

/** Returns tag chips only when filtering is worthwhile: >=2 tags each used by >=2 projects. */
export function deriveFilters(projects: TSideProject[]): FilterTag[] {
  const counts = new Map<string, number>();
  for (const p of projects) for (const t of p.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
  const tags = Array.from(counts.entries()).map(([tag, count]) => ({ tag, count }));
  const meaningful = tags.filter((t) => t.count >= 2);
  return meaningful.length >= 2 ? tags.sort((a, b) => b.count - a.count) : [];
}
