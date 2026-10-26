import { getBlogPosts } from "./blogs/utils";
import { books } from "@/lib/books";
import { getProjectPageProjects } from "@/lib/projectsData";

export const baseUrl = "https://www.shashwa7.in/";

export default async function sitemap() {
  const today = new Date().toISOString().split("T")[0];

  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: today,
    },
    {
      url: `${baseUrl}projects`,
      lastModified: today,
    },
    {
      url: `${baseUrl}books`,
      lastModified: today,
    },
    {
      url: `${baseUrl}shelf`,
      lastModified: today,
    },
    {
      url: `${baseUrl}coffee`,
      lastModified: today,
    },
    {
      url: `${baseUrl}cv`,
      lastModified: today,
    },
    {
      url: `${baseUrl}card`,
      lastModified: today,
    },
    {
      url: `${baseUrl}swoopy`,
      lastModified: today,
    },
  ];

  // Projects with their own route (like /swoopy) are already listed above.
  const projects = getProjectPageProjects().map((p) => ({
    url: `${baseUrl}project/${p.slug}`,
    lastModified: today,
  }));

  const blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}blogs/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const bookPages = books.map((book) => ({
    url: `${baseUrl}books/${book.slug}`,
    lastModified: today,
  }));

  return routes.concat(projects, blogs, bookPages);
}
