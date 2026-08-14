import { getOrganization, getProjectFromOrg } from "@/lib/workData";
import { breadcrumbLd, ogUrl } from "@/lib/seo";
import { baseUrl } from "@/app/sitemap";

/**
 * Carries this route's server-only metadata: the breadcrumb JSON-LD, and the
 * page metadata including its OG card.
 *
 * The metadata has to live here for the same reason the JSON-LD does. A client
 * component cannot export `generateMetadata`, so before this the case-study pages
 * had no OG image of their own and fell back to the site-wide default, meaning
 * every shared case study looked identical.
 *
 * The page itself is a client component (`"use client"`, for the video modal's
 * `useState` and its motion variants), and `lib/seo.ts` reads `baseUrl` from
 * `app/sitemap.ts`, which imports `app/blogs/utils.ts` and its `fs` usage.
 * Importing the helper into the client page would therefore pull `fs` into the
 * browser bundle. A server layout gets the same `params` and keeps the boundary
 * where it belongs, without having to refactor the page.
 */
export async function generateMetadata({
  params,
}: {
  params: { org: string; project: string };
}) {
  const org = getOrganization(params.org);
  const project = getProjectFromOrg(params.org, params.project);
  if (!org || !project) return { title: "Not Found" };

  const url = `${baseUrl}work/${org.slug}/${project.slug}`;
  const description = project.description;
  const image = ogUrl({
    title: project.title,
    // The description, not "Built at <org>": the org is already carried by the
    // logo and the footer, so the subtitle was spending the card's most
    // readable secondary line restating the header.
    subtitle: description,
    type: "project",
    logo: org.slug,
    meta: project.metric || `Built at ${org.name}`,
  });

  return {
    title: `${project.title} · ${org.name}`,
    description,
    alternates: { canonical: url },
    openGraph: { title: project.title, description, url, images: [{ url: image }] },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [image],
    },
  };
}

export default function WorkProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { org: string; project: string };
}) {
  const org = getOrganization(params.org);
  const project = getProjectFromOrg(params.org, params.project);

  return (
    <>
      {org && project && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              breadcrumbLd([
                { name: "Home", path: "" },
                { name: org.name, path: `work/${org.slug}` },
                { name: project.title, path: `work/${org.slug}/${project.slug}` },
              ])
            ),
          }}
        />
      )}
      {children}
    </>
  );
}
