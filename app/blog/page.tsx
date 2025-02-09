import { BlogPosts } from "../components/BlogPosts";

export const metadata = {
  title: "Blog",
  description: "Read my blog.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 font-sans">My Blog</h1>
      <BlogPosts />
    </section>
  );
}
