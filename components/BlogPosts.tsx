import { formatDate, getBlogPosts } from "@/app/blogs/utils";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BlogPosts() {
  const posts = getBlogPosts().sort((a, b) =>
    new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt) ? -1 : 1
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blogs/${post.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong"
        >
          {post.metadata.image && (
            <div className="relative aspect-[16/9] overflow-hidden bg-elevated">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.metadata.image}
                alt={post.metadata.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2 p-4">
            <span className="font-mono text-[10px] uppercase tracking-wide text-subtle">
              {formatDate(post.metadata.publishedAt, false)}
            </span>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg leading-snug text-foreground">{post.metadata.title}</h3>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-accent" />
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{post.metadata.summary}</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {JSON.parse(post.metadata.tags).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
