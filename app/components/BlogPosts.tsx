import { formatDate, getBlogPosts } from "@/app/blog/utils";
import Link from "next/link";

export function BlogPosts() {
  let allBlogs = getBlogPosts();

  return (
    <div className="text-sm grid gap-3">
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
              className="grid grid-cols-[250px_1fr] border rounded-md overflow-hidden -md:grid-cols-1 bg-gray-50"
              href={`/blog/${post.slug}`}
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
                  <p className="font-semibold text-lg text-s7-gray_graphite">{`${post.metadata.title}`}</p>
                  <p className="text-s7-gray300 text-xs">
                    {formatDate(post.metadata.publishedAt, false)}
                  </p>
                </div>
                <p>{post.metadata.summary}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {JSON.parse(post.metadata.tags).map(
                    (tag: string, id: number) => (
                      <span
                        key={id}
                        className="border inline-block p-[2px] px-2 border-b-4 text-xs rounded-md"
                      >
                        {tag}
                      </span>
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
