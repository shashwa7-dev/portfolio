/**
 * Where this site links, in one place.
 *
 * The header and the footer both list the same routes, and the contact section
 * and the footer both list the same profiles. Kept apart they drift: a route
 * added to the navbar quietly goes missing from the footer, and nobody notices
 * because both look complete on their own.
 */

export type NavLink = {
  label: string;
  href: string;
  /**
   * The route this link owns, for the current-page state. Omitted for homepage
   * anchors: knowing whether "Work" or "Projects" is current would take scroll
   * tracking, and marking both active on `/` is worse than marking neither.
   */
  match?: string;
};

export const navLinks: NavLink[] = [
  { label: "Work", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Writing", href: "/blogs", match: "/blogs" },
  { label: "Books", href: "/books", match: "/books" },
  { label: "Shelf", href: "/shelf", match: "/shelf" },
];

/** Named rather than keyed by icon, so the icon stays a rendering concern. */
export type SocialLink = { name: "GitHub" | "LinkedIn" | "Twitter"; href: string };

export const socialLinks: SocialLink[] = [
  { name: "GitHub", href: "https://github.com/shashwa7-dev" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/shashwa7/" },
  { name: "Twitter", href: "https://x.com/offcod8" },
];

export const contactEmail = "contact@shashwa7.in";
