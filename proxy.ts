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

export function proxy(req: NextRequest) {
  const accept = req.headers.get("accept");
  const wantsMarkdown =
    !!accept && accept.toLowerCase().includes("text/markdown");

  const { pathname } = req.nextUrl;

  // Dev-only tools (the Vice FM editor, /dev/radio): a real 404 in any build
  // but `npm run dev`. The page cannot set the status itself: the root
  // loading.tsx starts streaming a 200 before the page runs.
  if (pathname.startsWith("/dev/")) {
    return process.env.NODE_ENV === "development"
      ? NextResponse.next()
      : new NextResponse("Not found", { status: 404 });
  }

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
  }

  // No markdown rendition (or HTML requested) — fall through, but still hint
  // to caches that responses on these routes vary by Accept.
  const res = NextResponse.next();
  res.headers.append("Vary", "Accept");
  return res;
}

// Run on the two route families that have a markdown rendition (the path
// patterns admit anything under those prefixes; the per-request regex inside
// `proxy()` filters to the exact shape we rewrite), and on the dev-only tools.
export const config = {
  matcher: ["/", "/blogs/:path*", "/work/:path*", "/dev/:path*"],
};
