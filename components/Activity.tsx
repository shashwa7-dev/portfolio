import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { books } from "@/lib/books";
import BookListItem from "./BookListItem";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";

export default function Activity() {
  return (
    <Section id="activity" number="05" label="Now" title="What I'm up to" width="reading">
      <Bento className="grid-cols-1 sm:grid-cols-2">
        <div className="bg-card p-5">
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Writing</p>
          <Link href="/blogs" className="group inline-flex items-center gap-2 text-base font-medium transition-colors hover:text-accent">
            Read my blog posts <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">Notes on frontend, AI &amp; building products.</p>
        </div>
        <div className="bg-card p-5">
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Currently</p>
          <p className="font-serif text-xl text-foreground">Building at ShopOS</p>
          <p className="mt-1 text-xs text-muted-foreground">AI-native commerce · open to freelance.</p>
        </div>
        <div className="col-span-full flex items-center justify-between bg-card px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Currently Reading</p>
          <Link href="/books" className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        {books.slice(0, 3).map((book) => (
          <div key={book.slug} className="col-span-full bg-card">
            <BookListItem {...book} variant="row" />
          </div>
        ))}
      </Bento>
    </Section>
  );
}
