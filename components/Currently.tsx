import Link from "next/link";
import Section from "@/components/layout/Section";
import StackIcon from "@/components/common/StackIcon";
import { books } from "@/lib/books";
import { currently } from "@/lib/currently";
import { readingNow } from "@/lib/home";

/**
 * What is happening now, in three short rows. Replaced the Toolkit wall and
 * the "Now" bento: one line each for building and reading, and the everyday
 * stack. The Reading row is left out entirely when none of its books exist.
 */
export default function Currently() {
  const reading = readingNow(books);
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Building", value: currently.building },
    ...(reading.length
      ? [
          {
            label: "Reading",
            value: (
              <span>
                {reading.map((b, i) => (
                  <span key={b.slug}>
                    {i > 0 && <span className="text-subtle">, </span>}
                    <Link
                      href={`/books/${b.slug}`}
                      className="underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:decoration-foreground"
                    >
                      {b.name}
                    </Link>
                  </span>
                ))}
              </span>
            ),
          },
        ]
      : []),
  ];
  return (
    <Section id="currently" label="Currently" title="What I'm building, reading and using">
      <dl className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[6rem_1fr] gap-4 text-base">
            <dt className="text-subtle">{r.label}</dt>
            <dd className="text-foreground">{r.value}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[6rem_1fr] gap-4 text-base">
          <dt className="text-subtle">Stack</dt>
          <dd className="flex flex-wrap gap-1.5">
            {currently.stack.map((name) => (
              <StackIcon key={name} name={name} size={12} />
            ))}
          </dd>
        </div>
      </dl>
    </Section>
  );
}
