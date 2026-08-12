import { books } from "@/lib/books";
import { notFound } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Link as LinkCTA } from "@/components/common/Link";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";
import Container from "@/components/layout/Container";

type Props = {
  params: { slug: string };
};

export function generateMetadata({ params }: Props) {
  const book = books.find((b) => b.slug === params.slug);
  if (!book) return undefined;

  const { name: title, description, cover: image } = book;
  const ogImage = image
    ? image
    : ogUrl({ title: book.name, type: "books" });
  return {
    title: book.name,
    description: book.description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}books/${book.slug}`,
      siteName: "S7.dev",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function BookPage({ params }: Props) {
  const book = books.find((b) => b.slug === params.slug);
  if (!book) notFound();

  const completedCount = book.chapters.filter((c) => c.completed).length;
  const isComplete = completedCount === book.chapters.length;

  return (
    <main className="min-h-screen py-8 md:py-12">
      <Container width="reading" className="space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="relative w-36 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary aspect-[2/3] md:w-40">
            <Image
              src={book.cover}
              alt={book.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 144px, 160px"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {book.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{book.author}</span>
              </p>
            </div>

            {book.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {book.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <LinkCTA name={`Buy ${book.name}`} link={book.link} className="px-2.5 py-1 h-fit" />
              <span className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                {completedCount}/{book.chapters.length} chapters
              </span>
              {/* Filled versus outline carries the state, not colour. Completed is
                  the solid pill and Reading stays an outline, so the two are
                  distinguishable at a glance without introducing a hue the palette
                  does not use anywhere else. */}
              {isComplete ? (
                <span className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background">
                  Completed
                </span>
              ) : (
                <span className="rounded-md border border-border-strong bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  Reading
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Chapters */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-label text-muted-foreground">
            Chapters
          </h2>
          <ul className="space-y-2.5">
            {book.chapters.map((chapter, index) => (
              <li
                key={chapter.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors",
                  chapter.completed
                    ? "bg-secondary/80 text-muted-foreground"
                    : "bg-card hover:border-border-strong hover:bg-muted"
                )}
              >
                <p
                  className={cn(
                    "flex min-w-0 items-center gap-2.5",
                    chapter.completed && "line-through"
                  )}
                >
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {index + 1}.
                  </span>
                  <span className="truncate">{chapter.title}</span>
                </p>
                {/* The row already strikes through when complete, so a "Done"
                    pill beside it said the same thing twice, in a colour used
                    nowhere else. A quiet check marks it without competing. */}
                {chapter.completed && (
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={2.5}
                    aria-label="Completed"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </main>
  );
}
