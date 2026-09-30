import type { Book } from "./books";
import type { TSideProject } from "./projectsData";

/** The book in progress: the first one not marked done. */
export function currentBook(list: Book[]): Book | undefined {
  return list.find((b) => !b.isDone);
}

/**
 * The side projects the homepage names, in order. The full list lives on
 * /projects; the homepage keeps two so the section stays a glance.
 */
export const HOME_PROJECT_SLUGS = ["mehfil", "kiryoku"] as const;

export function homeProjects(list: TSideProject[]): TSideProject[] {
  return HOME_PROJECT_SLUGS.flatMap((slug) => list.filter((p) => p.slug === slug));
}
