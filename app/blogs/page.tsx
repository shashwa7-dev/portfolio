import { BlogPosts } from "../../components/BlogPosts";

export const metadata = {
  title: "Blogs",
  description: "Read my blog.",
};

export default function Page() {
  return (
    <section className="text-sm grid gap-4 max-w-2xl p-4 mx-auto">
      <BlogPosts />
    </section>
  );
}
