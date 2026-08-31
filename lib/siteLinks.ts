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
  { label: "CV", href: "/cv", match: "/cv" },
];

/**
 * The footer's Navigate row: a curated subset of the header's list, plus the
 * two routes that are not in it.
 *
 * The footer briefly carried every route in `navLinks`, which is what the
 * sticky header already renders at every width. Repeating the whole bar is
 * what made it worth cutting; carrying the handful someone actually leaves a
 * page for is not the same thing. Books and Shelf are the personal-interest
 * pages and stay in the header only, where a reader browsing for them will be.
 *
 * `href`s come from `navLinks` rather than being retyped, so a route that
 * moves cannot leave a dead link here. The trade is that renaming a label in
 * `navLinks` drops it from this row, which is visible in the footer the
 * moment it happens.
 */
const FOOTER_ROUTES = new Set(["Work", "Projects", "Writing", "CV"]);

export const footerLinks: NavLink[] = [
  // Not in `navLinks`: the header's own wordmark is the way home from the
  // top of the page, so the header does not need the word as well.
  { label: "Home", href: "/" },
  ...navLinks.filter((l) => FOOTER_ROUTES.has(l.label)),
  // Deliberately absent from the header: it is a toy and the header is for
  // the work. An unlinked route is an undiscovered one, so it lives here.
  { label: "Visitor card", href: "/card", match: "/card" },
];

/** Named rather than keyed by icon, so the icon stays a rendering concern. */
export type SocialLink = { name: "GitHub" | "LinkedIn" | "Twitter"; href: string };

export const socialLinks: SocialLink[] = [
  { name: "GitHub", href: "https://github.com/shashwa7-dev" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/shashwa7/" },
  { name: "Twitter", href: "https://x.com/offcod8" },
];

export const contactEmail = "contact@shashwa7.in";

/**
 * Where Shashwat works from.
 *
 * Here rather than in whichever component happened to show it first, for the
 * reason at the top of this file: the hero states it and so does the contact
 * section, and two copies of a fact drift the moment one of them is edited.
 *
 * `data/cv.md` keeps its own copy on purpose. It is markdown read at build time
 * and cannot import this, and it is the single source the PDF is generated
 * from, so its contact line has to stay self-contained.
 */
export const location = {
  /** IATA code. What the hero's compact row has room for. */
  code: "BLR",
  /** What prose surfaces show, and what assistive tech gets in place of the code. */
  name: "Bengaluru, India",
  /** Shashwat's zone, not the visitor's. That is the whole point of showing it. */
  timeZone: "Asia/Kolkata",
  tzLabel: "IST",
};
