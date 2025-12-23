import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/common/mdx";
import { formatDate, getBlogPosts } from "../utils";
import { baseUrl } from "@/app/sitemap";
import Button from "@/components/common/Button";

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
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
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
  };
}

export default function Blog({ params }: any) {
  let post = getBlogPosts().find((post: any) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="container  max-w-2xl p-4 relative">
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
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blogs/${post.slug}`,
            author: {
              "@type": "Person",
              name: "My Portfolio",
            },
          }),
        }}
      />
      <h1 className="title  text-2xl font-sans">{post.metadata.title}</h1>
      <div className="flex justify-between items-center mt-1 text-sm">
        <p className="text-sm text-s7-gray300">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap mt-2">
        {JSON.parse(post.metadata.tags).map((tag: string, id: number) => (
          <Button key={id} variant="danger" size="sm">
            {tag}
          </Button>
        ))}
      </div>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
