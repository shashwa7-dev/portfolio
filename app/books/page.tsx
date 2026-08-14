import Book from "@/components/common/Book";
import { books } from "@/lib/books";
import Container from "@/components/layout/Container";
import { ogUrl } from "@/lib/seo";
import { baseUrl } from "@/app/sitemap";

// Built once and shared by both blocks, as the blog index does. The two calls
// this replaced took identical arguments, so they were the same URL written
// twice, which is one place for them to drift apart.
const BOOKS_OG = ogUrl({
  title: "Books",
  subtitle: "What I'm reading",
  type: "books",
});

export const metadata = {
  title: "Books",
  description: "Books I've read and am currently reading.",
  alternates: { canonical: `${baseUrl}books` },
  openGraph: {
    title: "Books",
    description: "What I'm reading",
    images: [{ url: BOOKS_OG }],
  },
  // Without this, Next inherits `twitter` wholesale from the root layout, so a
  // shared link showed the homepage card instead of this page's.
  twitter: {
    card: "summary_large_image",
    title: "Books",
    description: "What I'm reading",
    images: [BOOKS_OG],
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

        {/* Two columns on a phone, not three. At 375px a three-up grid of 2:3
            covers leaves each one about 100px wide, which is smaller than the
            thumbnails in the Activity list. */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
          {/* Copy before sorting. `Array.prototype.sort` is in place, so sorting
              the imported array directly reorders the module's own `books` export
              for every other consumer. */}
          {[...books]
            .sort((a, b) => Number(a.isDone) - Number(b.isDone))
            .map((book) => (
              <Book key={book.slug} {...book} />
            ))}
        </div>
      </Container>
    </main>
  );
}
