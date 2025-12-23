import { formatDate, getBlogPosts } from "@/app/blogs/utils";
import Link from "next/link";
import SectionTitle from "./common/SectionTitle";
import Button from "./common/Button";
import { Icon } from "@iconify/react";

export function BlogPosts() {
  let allBlogs = getBlogPosts();

  return (
    <div className="text-sm grid gap-4">
      <SectionTitle
        variant="huge"
        title={"My Blogs"}
        icon={
          <Icon icon={"streamline-block:content-write"} className="w-8 h-8" />
        }
      />
      <div>
        {allBlogs
          .sort((a, b) => {
            if (
              new Date(a.metadata.publishedAt) >
              new Date(b.metadata.publishedAt)
            ) {
              return -1;
            }
            return 1;
          })
          .map((post) => (
            <Link
              className="grid grid-cols-[250px_1fr] border rounded-md overflow-hidden -md:grid-cols-1 bg-card text-card-foreground"
              href={`/blogs/${post.slug}`}
              key={post.slug}
            >
              <div className="grid place-items-center -md:h-[150px] overflow-hidden">
                <img
                  src={post.metadata.image}
                  alt={post.metadata.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="w-full grid gap-1 p-3">
                <div>
                  <p className="text-lg text-secondary-foreground font-sans">{`${post.metadata.title}`}</p>
                  <p className="text-s7-gray300 text-xs">
                    {formatDate(post.metadata.publishedAt, false)}
                  </p>
                </div>
                <p>{post.metadata.summary}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {JSON.parse(post.metadata.tags).map(
                    (tag: string, id: number) => (
                      <Button key={id} size="sm" variant="danger">
                        {tag}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
