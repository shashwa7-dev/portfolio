import { baseUrl } from "../sitemap";

/**
 * Custom robots.txt with Content-Signals declared per
 * draft-romm-aipref-contentsignals — opts out of AI training while staying
 * indexable for search engines and answerable for AI-input agents.
 *
 * Returning a plain Route Handler instead of `app/robots.ts` metadata so we
 * can emit non-standard lines (Content-Signal) that the typed MetadataRoute
 * shape doesn't support.
 */
export const dynamic = "force-static";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Agent content-signals (draft-romm-aipref-contentsignals)",
    "Content-Signal: ai-train=no, search=yes, ai-input=yes",
    "",
    `Sitemap: ${baseUrl}sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
