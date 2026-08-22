import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CustomMDX } from "@/components/common/mdx";
import StickyScrollSpyTOC from "@/components/common/StickyScrollSpyTOC";
import { tocFromMdx } from "@/lib/toc";
import { cn } from "@/lib/utils";
import { readingTime } from "@/lib/readingTime";
import { formatDate, getBlogPosts } from "../utils";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, blogPostingLd, breadcrumbLd } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/layout/Container";
import CopyMarkdown from "@/components/common/CopyMarkdown";

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

  let { title, publishedAt: publishedTime, summary: description } = post.metadata;

  /**
   * Always the generated card, never the post's `image`.
   *
   * `image` is the thumbnail the blog index draws beside the excerpt, and it is
   * cropped and composed for that job: a wide screenshot that reads fine at
   * 96px in a list and arrives as an unlabelled, off-ratio picture when it is
   * blown up to 1200x630 in a timeline. Sharing a post that happened to carry a
   * thumbnail therefore looked nothing like sharing one that did not.
   *
   * The card gets the post's own summary as its brief, plus the two facts a
   * reader weighs before opening a link: how long it is, and how old it is.
   * `image` keeps its real job in the index and in the BlogPosting schema,
   * where a genuine photograph beats a text card.
   */
  let ogImage = ogUrl({
    title,
    subtitle: description,
    type: "post",
    meta: `${readingTime(post.content)} min read · ${formatDate(publishedTime, false)}`,
  });

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
  const toc = tocFromMdx(post.content);

  return (
    <Container
      as="section"
      width="reading"
      className={cn(
        "relative py-8 md:py-12",
        /* Only reserved when there is something to reserve it for. The table
           of contents renders nothing without headings, so a post that has
           none would otherwise end on 112px of empty page. */
        toc.length > 0 && "pb-28 md:pb-28 xl:pb-12"
      )}
    >
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

      {/* The header image, on the same 16/9 box the blog index draws it in, so
          a post shows the reader the same crop twice rather than two different
          framings of one picture.

          `fill` inside a fixed ratio rather than intrinsic width and height,
          because those would have to be hardcoded here and every future post's
          art would then have to match this one's dimensions.

          `priority`: on a post that has one, this is the largest thing above
          the fold, so it is the LCP element and should not wait for the lazy
          observer.

          `alt=""`: the picture illustrates the title it sits under and adds
          nothing a screen reader needs, and the alternative is inventing
          description for someone else's artwork. Decorative is the honest
          value. */}
      {post.metadata.image && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-elevated">
          <Image
            src={post.metadata.image}
            alt=""
            fill
            priority
            /* The reading container is max-w-[760px] with px-6, so the real
               content box is 712px, and below that breakpoint it is the
               viewport less the same 48px of gutter. Overstating this makes
               next/image serve the next bucket up for no benefit. */
            sizes="(max-width: 760px) calc(100vw - 48px), 712px"
            className="object-cover grayscale transition-[filter] duration-base ease-out hover:grayscale-0"
          />
        </div>
      )}
      {/* Derived from the source rather than the DOM, so it is server
          rendered and costs no layout pass. It returns null on a post with no
          headings, which is why there is no guard here. */}
      <StickyScrollSpyTOC sections={toc} />
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>

      <CopyMarkdown slug={post.slug} />

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
