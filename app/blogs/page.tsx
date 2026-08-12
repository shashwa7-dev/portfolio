import { BlogPosts } from "../../components/BlogPosts";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import { getBlogPosts } from "@/app/blogs/utils";
import { baseUrl } from "@/app/sitemap";
import { blogLd, breadcrumbLd } from "@/lib/seo";

export const metadata = {
  title: "Blog",
  description: "Thoughts, learnings, and things I find interesting.",
  alternates: { canonical: `${baseUrl}blogs` },
};

export default function Page() {
  const posts = getBlogPosts().sort((a, b) =>
    new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt) ? -1 : 1
  );

  return (
    <main className="py-8 md:py-12">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd(posts)) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", path: "" },
              { name: "Blog", path: "blogs" },
            ])
          ),
        }}
      />
      <Container width="reading" className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Writing</Label>
            <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]">
              Blog
            </h1>
            <p className="text-muted-foreground">
              Thoughts, learnings, and things I find interesting.
            </p>
          </div>
        </div>
        <BlogPosts />
      </Container>
    </main>
  );
}
