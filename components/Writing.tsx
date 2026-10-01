import Link from "next/link";
import { getBlogPosts } from "@/app/blogs/utils";
import { latestPosts } from "@/lib/home";
import Section from "@/components/layout/Section";
import { ViewAllLink } from "@/components/common/ViewAllLink";

/** "Aug 2026": the same short form the rest of the homepage uses for dates. */
function shortDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * The latest three posts as plain rows: title, date. Same hover as the project
 * rows, an underline drawn in under the title. The full list lives on /blogs.
 */
export default function Writing() {
  const posts = latestPosts(getBlogPosts(), 3);
  if (posts.length === 0) return null;
  return (
    <Section
      id="writing"
      label="Writing"
      title="Notes on building"
      action={<ViewAllLink href="/blogs">View all</ViewAllLink>}
    >
      <ul className="space-y-1">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blogs/${post.slug}`}
              className="group -mx-3 flex items-baseline justify-between gap-6 rounded-lg px-3 py-3"
            >
              <span className="text-base font-medium text-foreground">
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-med ease-out group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px]">
                  {post.metadata.title}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">
                {shortDate(post.metadata.publishedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
