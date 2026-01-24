import Book from "@/components/common/Book";
import { books } from "@/lib/books";
import Link from "next/link";
import { ArrowLeft } from "feather-icons-react";

export const metadata = {
  title: "Books",
  description: "Books I've read and am currently reading.",
};

export default function BooksPage() {
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
          <h1 className="text-3xl font-semibold tracking-tight">Book Shelf</h1>
          <p className="text-muted-foreground">
            Books I've read and am currently reading.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {books
            .sort((a, b) => Number(a.isDone) - Number(b.isDone))
            .map((book) => (
              <Book key={book.slug} {...book} />
            ))}
        </div>
      </div>
    </main>
  );
}
