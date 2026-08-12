import { getOrganization, getProjectFromOrg } from "@/lib/workData";
import { breadcrumbLd } from "@/lib/seo";

/**
 * Exists only to emit this route's breadcrumb JSON-LD from the server.
 *
 * The page itself is a client component (`"use client"`, for the video modal's
 * `useState` and its motion variants), and `lib/seo.ts` reads `baseUrl` from
 * `app/sitemap.ts`, which imports `app/blogs/utils.ts` and its `fs` usage.
 * Importing the helper into the client page would therefore pull `fs` into the
 * browser bundle. A server layout gets the same `params` and keeps the boundary
 * where it belongs, without having to refactor the page.
 */
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
