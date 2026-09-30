import type { TOrganization } from "./workData";
import { clients } from "./clients";

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
