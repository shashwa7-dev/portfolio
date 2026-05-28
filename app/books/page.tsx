import Book from "@/components/common/Book";
import { books } from "@/lib/books";
import Container from "@/components/layout/Container";
import { ogUrl } from "@/lib/seo";
import { baseUrl } from "@/app/sitemap";

export const metadata = {
  title: "Books",
  description: "Books I've read and am currently reading.",
  alternates: { canonical: `${baseUrl}books` },
  openGraph: {
    title: "Books",
    description: "What I'm reading",
    images: [{ url: ogUrl({ title: "Books", subtitle: "What I'm reading", type: "books" }) }],
  },
};

export default function BooksPage() {
  return (
    <main className="min-h-screen py-8 md:py-12">
      <Container width="reading" className="space-y-8">
        <div className="space-y-4">
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
      </Container>
    </main>
  );
}
