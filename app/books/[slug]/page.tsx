import { books } from "@/lib/books";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Link as LinkCTA } from "@/components/common/Link";
import { ArrowLeft } from "feather-icons-react";
import { baseUrl } from "@/app/sitemap";

type Props = {
  params: { slug: string };
};

export function generateMetadata({ params }: Props) {
  const book = books.find((b) => b.slug === params.slug);
  if (!book) return undefined;

  const { name: title, description, cover: image } = book;
  const ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(book.name)}`;
  return {
    title: book.name,
    description: book.description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/books/${book.slug}`,
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
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-16">
        {/* Back link */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Book Shelf
        </Link>

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
                by <span className="font-medium text-accent">{book.author}</span>
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
              {isComplete ? (
                <span className="rounded-md border border-transparent bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                  Completed
                </span>
              ) : (
                <span className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
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
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                    : "bg-card hover:border-accent/50 hover:bg-accent/5"
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
                {chapter.completed && (
                  <span className="shrink-0 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                    Done
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
