import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/common/mdx";
import { formatDate, getBlogPosts } from "../utils";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";

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
  let post = getBlogPosts().find((post: any) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-16 relative">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : ogUrl({ title: post.metadata.title, type: "post" }),
            url: `${baseUrl}blogs/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Shashwat Tripathi",
            },
          }),
        }}
      />
      <h1 className="title  text-2xl font-sans">{post.metadata.title}</h1>
      <div className="flex justify-between items-center mt-1 text-sm">
        <p className="text-sm text-muted-foreground">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap mt-3">
        {JSON.parse(post.metadata.tags).map((tag: string, id: number) => (
          <Badge key={id} variant="secondary" className="text-accent">
            {tag}
          </Badge>
        ))}
      </div>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
