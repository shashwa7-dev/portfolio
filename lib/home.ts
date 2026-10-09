import type { Book } from "./books";
import type { TSideProject } from "./projectsData";

/**
 * The books the homepage "Reading" row names, in order. Chosen by hand rather
 * than "every unfinished book", because more than one sits half-read and the
 * row should say what is actually on the nightstand.
 */
export const READING_SLUGS = ["advanced-react", "cant-hurt-me"] as const;

export function readingNow(list: Book[]): Book[] {
  return READING_SLUGS.flatMap((slug) => list.filter((b) => b.slug === slug));
}

/**
 * The side projects the homepage names, in order, newest first. The full list
 * lives on /projects; the homepage keeps three so the section stays a glance.
 */
export const HOME_PROJECT_SLUGS = ["santul", "mehfil", "kiryoku"] as const;

export function homeProjects(list: TSideProject[]): TSideProject[] {
  return HOME_PROJECT_SLUGS.flatMap((slug) => list.filter((p) => p.slug === slug));
}

/** The newest `limit` posts, newest first, without reordering the input. */
export function latestPosts<T extends { metadata: { publishedAt: string } }>(posts: T[], limit: number): T[] {
  return [...posts]
    .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
    .slice(0, limit);
}
