import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CustomMDX } from "@/components/common/mdx";
import { readingTime } from "@/lib/readingTime";
import { formatDate, getBlogPosts } from "../utils";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, blogPostingLd, breadcrumbLd } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/layout/Container";

export async function generateStaticParams() {
  let posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: any) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image ? image : ogUrl({ title, subtitle: description, type: "post" });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}blogs/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: `${baseUrl}blogs/${post.slug}` },
  };
}

export default function Blog({ params }: any) {
  const posts = getBlogPosts().sort((a, b) =>
    new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt) ? -1 : 1
  );
  const index = posts.findIndex((p: any) => p.slug === params.slug);
  const post = index === -1 ? undefined : posts[index];

  if (!post) {
    notFound();
  }

  // Sorted newest first, so the next entry is the older post and the previous
  // entry is the newer one. Labelled by age rather than by array direction,
  // because "next" is ambiguous to a reader and "older" is not.
  const older = posts[index + 1];
  const newer = posts[index - 1];

  return (
    <Container as="section" width="reading" className="py-8 md:py-12 relative">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd(post)) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", path: "" },
              { name: "Blog", path: "blogs" },
              { name: post.metadata.title, path: `blogs/${post.slug}` },
            ])
          ),
        }}
      />
      <h1 className="title  text-2xl font-sans">{post.metadata.title}</h1>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{formatDate(post.metadata.publishedAt)}</span>
        <span aria-hidden className="text-border-strong">
          ·
        </span>
        <span>{readingTime(post.content)} min read</span>
      </div>
      <div className="flex gap-2 flex-wrap mt-3">
        {JSON.parse(post.metadata.tags).map((tag: string, id: number) => (
          <Badge key={id} variant="secondary" className="text-foreground">
            {tag}
          </Badge>
        ))}
      </div>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>

      {/* Post neighbours. Rendered only when a neighbour exists, so at one post
          this emits nothing at all rather than an empty bordered block. It is
          the machinery that pays off from the second post onward. */}
      {(newer || older) && (
        <nav
          aria-label="More posts"
          className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
        >
          {newer ? (
            <Link
              href={`/blogs/${newer.slug}`}
              className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-3.5 transition-colors duration-base ease-out hover:border-border-strong"
            >
              <span className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-subtle">
                <ArrowLeft className="h-3 w-3" /> Newer
              </span>
              <span className="text-sm text-foreground">
                {newer.metadata.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {older && (
            <Link
              href={`/blogs/${older.slug}`}
              className="group flex flex-col gap-1 rounded-lg border border-border bg-card p-3.5 text-right transition-colors duration-base ease-out hover:border-border-strong sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1.5 font-mono text-2xs uppercase tracking-label text-subtle">
                Older <ArrowRight className="h-3 w-3" />
              </span>
              <span className="text-sm text-foreground">
                {older.metadata.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </Container>
  );
}
