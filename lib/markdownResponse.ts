/**
 * Helpers for the markdown-for-agents content-negotiation routes
 * (`Accept: text/markdown` → text/markdown rendition of a page).
 *
 * Centralizes:
 *  - Token estimate header (`x-markdown-tokens`)
 *  - Content-Type + charset
 *  - Cache directives
 *  - YAML frontmatter serialization
 *
 * Adding a new markdown route is then a one-liner:
 *   return markdownResponse(body);
 */

/** Rough char-based token estimate (~4 chars per token for English prose). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Standard headers used by every markdown rendition route. */
export function markdownHeaders(body: string): HeadersInit {
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(estimateTokens(body)),
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
  };
}

/** Build a complete `Response` with the standard markdown headers. */
export function markdownResponse(body: string): Response {
  return new Response(body, { headers: markdownHeaders(body) });
}

/**
 * Serialize a record of metadata to YAML frontmatter, with a trailing blank
 * line so the body that follows is cleanly separated. Values go through
 * `JSON.stringify` which is also valid YAML 1.2 (a JSON superset), so quotes,
 * backslashes, and newlines inside values are properly escaped.
 *
 * Falsy values (undefined, "") are omitted so the frontmatter stays compact.
 */
export function frontmatter(
  fields: Record<string, string | number | undefined>
): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === "") continue;
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push("---", "", "");
  return lines.join("\n");
}
