"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { books } from "@/lib/books";
import BookListItem from "./BookListItem";
import Section from "@/components/layout/Section";
import GridPanel from "@/components/layout/GridPanel";

export default function Activity() {
  return (
    <Section id="activity" number="05" label="Now" title="What I'm up to" width="reading">
      <GridPanel>
        {/* top: two cells split by a hairline */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="p-5">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Writing</p>
            <Link href="/blogs" className="group inline-flex items-center gap-2 text-base font-medium transition-colors hover:text-accent">
              Read my blog posts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">Notes on frontend, Web3 &amp; building products.</p>
          </div>
          <div className="border-t border-border p-5 sm:border-l sm:border-t-0">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Currently</p>
            <p className="font-serif text-xl text-foreground">Building at ShopOS</p>
            <p className="mt-1 text-xs text-muted-foreground">AI-native commerce · open to freelance.</p>
          </div>
        </div>

        {/* reading: full-width hairline-divided book rows */}
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Currently Reading</p>
            <Link href="/books" className="text-xs text-muted-foreground transition-colors hover:text-foreground">View all →</Link>
          </div>
          {/* BookListItem renders its own <motion.li> with border-b in row variant — no outer <li> needed */}
          <ul className="border-t border-border">
            {books.slice(0, 3).map((book) => (
              <BookListItem key={book.slug} {...book} variant="row" />
            ))}
          </ul>
        </div>
      </GridPanel>
    </Section>
  );
}
