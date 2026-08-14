import { baseUrl } from "@/app/sitemap";
import type { TSideProject } from "@/lib/projectsData";

/**
 * Stable fragment ids so a crawler can merge nodes emitted from separate
 * <script> blocks, and from separate pages, into one entity.
 *
 * Without them every page's Person block is an unrelated object rather than
 * another reference to the same person, which is the difference between one
 * Knowledge Graph entity and a dozen orphans. The "#fragment" keeps each node's
 * id distinct from the page URL it appears on.
 */
export const JSON_LD_ID = {
  person: `${baseUrl}#person`,
  website: `${baseUrl}#website`,
} as const;

/** Reference to the canonical Person node rather than a restated copy of it. */
const AUTHOR_REF = { "@id": JSON_LD_ID.person } as const;

export function ogUrl(p: {
  title: string;
  subtitle?: string;
  type?: string;
  label?: string;
  /** Footer-right line: reading time, date, stack. Kept short, it is set in caps. */
  meta?: string;
  /**
   * Organisation slug whose avatar heads the card. A slug, not a path: the OG
   * route resolves it against the org list, so the query string cannot name a
   * file for the server to read and inline.
   */
  logo?: string;
}) {
  const q = new URLSearchParams();
  q.set("title", p.title);
  if (p.subtitle) q.set("subtitle", p.subtitle);
  if (p.type) q.set("type", p.type);
  if (p.label) q.set("label", p.label);
  if (p.meta) q.set("meta", p.meta);
  if (p.logo) q.set("logo", p.logo);
  return `${baseUrl}og?${q.toString()}`;
}

export function softwareAppLd(p: TSideProject) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.title,
    description: p.tagline,
    applicationCategory: "DeveloperApplication",
    url: `${baseUrl}project/${p.slug}`,
    author: AUTHOR_REF,
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": JSON_LD_ID.person,
    name: "Shashwat Tripathi",
    url: baseUrl,
    jobTitle: "Frontend Engineer",
    email: "mailto:contact@shashwa7.in",
    sameAs: [
      "https://github.com/shashwa7-dev",
      "https://x.com/offcod8",
      "https://www.linkedin.com/in/shashwa7/",
    ],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": JSON_LD_ID.website,
    name: "Shashwat Tripathi",
    url: baseUrl,
    publisher: AUTHOR_REF,
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/**
 * The homepage is the entity page for a portfolio, so it should say so rather
 * than leave a crawler to infer it from the Person node alone.
 */
export function profilePageLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": baseUrl,
    mainEntity: AUTHOR_REF,
  };
}

type PostLike = {
  slug: string;
  metadata: { title: string; publishedAt: string; summary: string; image?: string };
};

/**
 * Moved here from an inline block in `app/blogs/[slug]/page.tsx`, so every
 * schema in the app is built in one module. The emitted JSON is unchanged apart
 * from `author`, which now references the canonical Person node instead of
 * restating the name.
 */
export function blogPostingLd(post: PostLike) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `${baseUrl}${post.metadata.image}`
      : ogUrl({ title: post.metadata.title, type: "post" }),
    url: `${baseUrl}blogs/${post.slug}`,
    author: AUTHOR_REF,
  };
}

/** The blog index. Lists its posts so a crawler can discover them from one node. */
export function blogLd(posts: PostLike[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${baseUrl}blogs`,
    name: "Blog",
    url: `${baseUrl}blogs`,
    author: AUTHOR_REF,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.metadata.title,
      datePublished: post.metadata.publishedAt,
      description: post.metadata.summary,
      url: `${baseUrl}blogs/${post.slug}`,
    })),
  };
}

/**
 * `trail` runs root first, current page last. Pass paths without the leading
 * slash; they are resolved against `baseUrl`, which already ends in one.
 */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}
