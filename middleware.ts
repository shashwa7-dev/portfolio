import { NextRequest, NextResponse } from "next/server";

/**
 * Content negotiation for AI agents — when a request includes
 * `Accept: text/markdown`, internally rewrite to a markdown-emitter route.
 * The user-facing URL stays the same; only the response body changes.
 *
 * See: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */

// Pre-compiled patterns to keep the per-request work cheap.
const blogRoute = /^\/blogs\/([^/]+)\/?$/;
const orgRoute = /^\/work\/([^/]+)\/?$/;
const skillRoute = /^\/skills\/([^/]+)\/?$/;

export function middleware(req: NextRequest) {
  const accept = req.headers.get("accept");
  const wantsMarkdown =
    !!accept && accept.toLowerCase().includes("text/markdown");

  const { pathname } = req.nextUrl;

  if (wantsMarkdown) {
    // Homepage — composes a markdown site summary from workData + clients.
    if (pathname === "/" || pathname === "") {
      const res = NextResponse.rewrite(new URL("/markdown", req.url));
      res.headers.append("Vary", "Accept");
      return res;
    }

    const blog = blogRoute.exec(pathname);
    if (blog) {
      const res = NextResponse.rewrite(
        new URL(`/blogs/${blog[1]}/markdown`, req.url)
      );
      res.headers.append("Vary", "Accept");
      return res;
    }

    const org = orgRoute.exec(pathname);
    if (org) {
      const res = NextResponse.rewrite(
        new URL(`/work/${org[1]}/markdown`, req.url)
      );
      res.headers.append("Vary", "Accept");
      return res;
    }

    const skill = skillRoute.exec(pathname);
    if (skill) {
      const res = NextResponse.rewrite(
        new URL(`/skills/${skill[1]}/markdown`, req.url)
      );
      res.headers.append("Vary", "Accept");
      return res;
    }
  }

  // No markdown rendition (or HTML requested) — fall through, but still hint
  // to caches that responses on these routes vary by Accept.
  const res = NextResponse.next();
  res.headers.append("Vary", "Accept");
  return res;
}

// Run on the two route families that have a markdown rendition. The path
// patterns below admit anything under those prefixes; the per-request regex
// inside `middleware()` filters to the exact shape we rewrite.
export const config = {
  matcher: ["/", "/blogs/:path*", "/work/:path*", "/skills/:path*"],
};
