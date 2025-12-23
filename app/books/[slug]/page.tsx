import { books } from "@/lib/books";
import { notFound } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Link } from "@/components/common/Link";
import { baseUrl } from "@/app/sitemap";

type Props = {
  params: { slug: string };
};
export function generateMetadata({ params }: any) {
  const book = books.find((b) => b.slug === params.slug);
  if (!book) {
    return;
  }

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
      url: `${baseUrl}/books`,
      siteName: "S7.dev",
      images: [
        {
          url: ogImage,
        },
      ],
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

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <header className="flex flex-col items-center text-center md:text-left md:flex-row gap-6 md:items-start">
        <div className="relative w-40 aspect-[2/3] shrink-0 overflow-hidden rounded-lg border-4">
          <Image
            src={book.cover}
            alt={book.name}
            fill
            className="object-cover rounded-md"
            priority
          />
        </div>

        <div className="space-y-2">
          <div>
            <h1 className="text-3xl font-semibold leading-tight">
              {book.name}
            </h1>
            {book.description ? (
              <p className="text-subtitle text-sm">{book.description}</p>
            ) : null}
          </div>

          <p className="text-muted-foreground text-sm">
            by{" "}
            <span className="text-amber-500 font-semibold">{book.author}</span>
          </p>
          <Link name={`Buy ${book.name}`} link={book.link} />
          <div className="flex -md:justify-center items-center gap-2 text-sm">
            <span className="rounded-md  px-2 py-1 bg-button-danger">
              {completedCount}/{book.chapters.length} chapters
            </span>

            {completedCount === book.chapters.length ? (
              <span className="rounded-md bg-green-500/10 text-green-600 px-2 py-1 font-medium">
                Completed
              </span>
            ) : (
              <span className="rounded-md bg-amber-500/10 text-amber-500 px-2 py-1 font-medium border">
                Reading
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Chapters */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">Chapters</h2>

        <ul className="space-y-2">
          {book.chapters.map((chapter, index) => (
            <li
              key={chapter.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition bg-muted 
                ${
                  chapter.completed
                    ? "!bg-secondary text-muted-foreground"
                    : "hover:bg-primary"
                }
              `}
            >
              <p
                className={cn(
                  "flex items-center gap-3",
                  chapter.completed && "line-through"
                )}
              >
                <span className="text-xs opacity-50">{index + 1}.</span>
                {chapter.title}
              </p>

              {chapter.completed && (
                <span className="rounded-md bg-green-500/10 text-green-600 px-2 py-1 text-xs">
                  Done
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
