import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, getBlogPosts } from "@/app/blogs/utils";
import { readingTime } from "@/lib/readingTime";

/**
 * The blog index.
 *
 * This is a single-column list, not a grid. It was `grid gap-4 sm:grid-cols-2`,
 * which renders one card beside a large empty column at the one post this repo
 * currently has, and reads as a broken page. A list is correct at one post, five
 * or fifty, so the fix is structural rather than cosmetic.
 *
 * The thumbnail is a fixed width so rows stay uniform however long a title runs,
 * and it stacks above the copy below `sm` where a side-by-side row would leave
 * the text too narrow to read.
 */
export function BlogPosts() {
  const posts = getBlogPosts().sort((a, b) =>
    new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt) ? -1 : 1
  );

  return (
    <ul className="divide-y divide-border border-y border-border">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blogs/${post.slug}`}
            className="group flex flex-col gap-3 py-4 transition-colors duration-base ease-out sm:flex-row sm:items-start sm:gap-4"
          >
            {post.metadata.image && (
              <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg bg-elevated ring-1 ring-border sm:w-[9.5rem]">
                {/* Greyscale until hover, matching the org and brand logos, so
                    one idiom covers every image on the site. */}
                <Image
                  src={post.metadata.image}
                  alt={post.metadata.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 152px"
                  className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
                />
              </span>
            )}

            {/* Divs, not spans: a span holds phrasing content only, so the h3 and
                the p below could not legally sit inside one. The enclosing <a> has
                a transparent content model, so flow content is fine here. */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg leading-snug text-foreground">
                  {post.metadata.title}
                </h3>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-subtle transition-colors duration-base ease-out group-hover:text-foreground" />
              </div>

              <div className="mt-1 flex items-center gap-2 font-mono text-2xs uppercase tracking-label text-subtle">
                {formatDate(post.metadata.publishedAt, false)}
                <span aria-hidden className="text-border-strong">
                  ·
                </span>
                {readingTime(post.content)} min read
              </div>

              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {post.metadata.summary}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {JSON.parse(post.metadata.tags).map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full border border-border px-2 py-0.5 font-mono text-2xs uppercase tracking-label text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
