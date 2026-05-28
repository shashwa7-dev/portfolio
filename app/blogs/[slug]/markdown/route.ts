import { getBlogPosts } from "@/app/blogs/utils";
import { frontmatter, markdownResponse } from "@/lib/markdownResponse";

/**
 * Serves the raw MDX body of a blog post as `text/markdown`. Reached either by
 * direct GET on this URL, or by the root middleware rewriting a request with
 * `Accept: text/markdown` from `/blogs/<slug>`.
 */
export const dynamic = "force-static";

export async function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const post = getBlogPosts().find((p) => p.slug === params.slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const body =
    frontmatter({
      title: post.metadata.title,
      publishedAt: post.metadata.publishedAt,
      summary: post.metadata.summary,
      tags: post.metadata.tags,
    }) + post.content;

  return markdownResponse(body);
}
