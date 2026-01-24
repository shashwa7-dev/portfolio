import { BlogPosts } from "../../components/BlogPosts";
import Link from "next/link";
import { ArrowLeft } from "feather-icons-react";

export const metadata = {
  title: "Blog",
  description: "Thoughts, learnings, and things I find interesting.",
};

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Thoughts, learnings, and things I find interesting.
          </p>
        </div>
        <BlogPosts />
      </div>
    </main>
  );
}
