/**
 * Heading slugs, and the table of contents built from them.
 *
 * `slugify` lives here rather than in `components/common/mdx.tsx` because two
 * things need it and they must agree exactly: the MDX renderer, which stamps
 * the `id` onto each heading, and the table of contents, which links to those
 * ids from a server component. A second copy that drifted by one character
 * would produce links that silently go nowhere.
 */

import type { TocSection } from "@/components/common/StickyScrollSpyTOC";

export function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Top level headings from MDX source, as a table of contents.
 *
 * Two things this deliberately does not do.
 *
 * It ignores anything inside a fenced code block, because `# something` is a
 * comment in half the languages on this site and would otherwise turn up as a
 * section.
 *
 * It skips headings containing inline markup. The MDX renderer derives its id
 * by treating the heading's children as a string, which only holds when the
 * heading is plain text; with `**bold**` or a code span in it the children are
 * an array and the resulting id is not something this can predict. Skipping
 * those keeps every entry pointing at an id that exists, rather than guessing
 * and linking into the void.
 */
export function tocFromMdx(source: string): TocSection[] {
  const out: TocSection[] = [];
  let inFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const label = match[1];
    if (/[*_`[\]<>]/.test(label)) continue;

    out.push({ id: slugify(label), label });
  }

  return out;
}
