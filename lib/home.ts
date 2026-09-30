import type { TOrganization } from "./workData";
import { clients } from "./clients";
import type { Book } from "./books";
import type { TSideProject } from "./projectsData";

/**
 * The one line beside an org's name on the homepage Work row: what was built
 * there (its products) or, failing that, who it was built for. Empty when
 * neither is known, so the row renders no separator.
 */
export function orgSubtitle(org: TOrganization): string {
  const names = org.products?.length
    ? org.products.map((p) => p.name)
    : clients
        .filter((c) => c.org === org.slug && c.name.toLowerCase().replace(/\s+/g, "") !== org.slug)
        .map((c) => c.name);
  return names.join(" · ");
}

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
