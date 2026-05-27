import { BlogPosts } from "../../components/BlogPosts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";

export const metadata = {
  title: "Blog",
  description: "Thoughts, learnings, and things I find interesting.",
};

export default function Page() {
  return (
    <main className="py-16 md:py-24">
      <Container width="wide" className="space-y-8">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="space-y-2">
            <Label>Writing</Label>
            <h1 className="font-serif text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]">
              Blog
            </h1>
            <p className="text-muted-foreground">
              Thoughts, learnings, and things I find interesting.
            </p>
          </div>
        </div>
        <BlogPosts />
      </Container>
    </main>
  );
}
