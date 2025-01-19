import { formatDate, getBlogPosts } from "@/app/blog/utils";
import Link from "next/link";

export function BlogPosts() {
  let allBlogs = getBlogPosts();

  return (
    <div className="text-sm grid gap-2">
      <p className="text-lg font-medium border-b text-s7-gray_graphite">
        {"Blogs"}
      </p>
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
          .map((post, id) => (
            <Link
              key={post.slug}
              className="flex flex-col space-y-1 mb-4"
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
                <p className="">{`${id + 1}. ${post.metadata.title}`}</p>
                <p className="text-s7-gray300">
                  {formatDate(post.metadata.publishedAt, true)}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
