import { getBlogPosts } from "./blogs/utils";
import { books } from "@/lib/books";

export const baseUrl = "https://www.shashwa7.in/";

export default async function sitemap() {
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date().toISOString().split("T")[0],
    },
    {
      url: `${baseUrl}/books`,
      lastModified: new Date().toISOString().split("T")[0],
    },
  ];

  const blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const bookPages = books.map((book) => ({
    url: `${baseUrl}/books/${book.slug}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...bookPages];
}
