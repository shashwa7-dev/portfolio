import Book from "@/components/common/Book";
import SectionTitle from "@/components/common/SectionTitle";
import { books } from "@/lib/books";
import { Icon } from "@iconify/react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Books",
  description: "Books I’m reading and learning from.",
};
export default function BooksPage() {
  return (
    <section className="text-sm grid gap-4 max-w-2xl p-4 mx-auto">
      <SectionTitle
        variant="huge"
        title={"Book Shelf"}
        icon={<Icon icon={"material-symbols:book"} className="w-8 h-8" />}
      />

      <div className="grid grid-cols-3 gap-4">
        {books
          .sort((a, b) => Number(a.isDone) - Number(b.isDone))
          .map((book) => (
            <Book key={book.slug} {...book} />
          ))}
      </div>
    </section>
  );
}
