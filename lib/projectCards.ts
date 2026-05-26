import type { TSideProject } from "@/lib/projectsData";
import type { TProject } from "@/lib/workData";

export type ProjectCardData = {
  id: string;
  href: string;
  title: string;
  tagline: string;
  thumbnail: string;
  preview?: string;
  stack: string[];
  badge?: string;
  caseStudy?: boolean;
};

export function sideProjectToCard(p: TSideProject): ProjectCardData {
  return {
    id: p.id,
    href: `/project/${p.slug}`,
    title: p.title,
    tagline: p.tagline,
    thumbnail: p.thumbnail,
    preview: p.preview,
    stack: [...(p.stack.fe || []), ...(p.stack.be || [])],
    badge: p.isRecent ? "Recent" : undefined,
    caseStudy: Boolean(p.caseStudy && Object.keys(p.caseStudy).length > 0),
  };
}

export function workProjectToCard(orgSlug: string, p: TProject): ProjectCardData {
  return {
    id: p.id,
    href: `/work/${orgSlug}/${p.slug}`,
    title: p.shortTitle || p.title,
    tagline: p.description,
    thumbnail: p.thumbnail,
    preview: p.preview,
    stack: [...(p.stack.fe || []), ...(p.stack.be || [])],
    badge: p.isActive ? "Live" : undefined,
  };
}
