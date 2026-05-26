import { baseUrl } from "@/app/sitemap";
import type { TSideProject } from "@/lib/projectsData";

export function ogUrl(p: { title: string; subtitle?: string; type?: string; label?: string }) {
  const q = new URLSearchParams();
  q.set("title", p.title);
  if (p.subtitle) q.set("subtitle", p.subtitle);
  if (p.type) q.set("type", p.type);
  if (p.label) q.set("label", p.label);
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
    author: { "@type": "Person", name: "Shashwat Tripathi" },
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
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
    name: "Shashwat Tripathi",
    url: baseUrl,
  };
}
