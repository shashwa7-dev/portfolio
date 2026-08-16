import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import RoasterPicker from "@/components/shelf/RoasterPicker";
import GearTimeline from "@/components/shelf/GearTimeline";
import { bookmarks } from "@/lib/bookmarks";
import { setup, scents } from "@/lib/everyday";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, breadcrumbLd } from "@/lib/seo";

const SHELF_OG = ogUrl({
  title: "Shelf",
  subtitle: "Coffee I drink, the gear that got me here, and links worth keeping.",
  type: "generic",
  label: "Shelf",
});

export const metadata = {
  title: "Shelf",
  description:
    "Coffee I drink, the gear that got me here, and links worth keeping.",
  alternates: { canonical: `${baseUrl}shelf` },
  openGraph: {
    title: "Shelf",
    description:
      "Coffee I drink, the gear that got me here, and links worth keeping.",
    url: `${baseUrl}shelf`,
    images: [{ url: SHELF_OG }],
  },
  // Without this, Next inherits `twitter` wholesale from the root layout, so a
  // shared link showed the homepage card instead of this page's.
  twitter: {
    card: "summary_large_image",
    title: "Shelf",
    description:
      "Coffee I drink, the gear that got me here, and links worth keeping.",
    images: [SHELF_OG],
  },
};

export default function ShelfPage() {
  return (
    <main className="py-8 md:py-12">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", path: "" },
              { name: "Shelf", path: "shelf" },
            ])
          ),
        }}
      />

      <Container width="reading" className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Things I&apos;m into</h1>
        <p className="max-w-[62ch] text-muted-foreground">
          Coffee I drink, the gear that got me here, and links worth keeping.
          Updated whenever there is something to add, which is the only honest
          promise a page like this can make.
        </p>
      </Container>

      <Section number="01" label="Coffee" title="Roasters I buy from" width="reading">
        {/* The taste note sits above the picker, not below it. Underneath, it
            moved every time someone switched to a roaster with a different
            number of beans, which is a layout shift caused by nothing the
            reader did on purpose. */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Where my taste sits.
            </span>{" "}
            Dark and medium-dark, chocolate and nut over fruit. I am not into
            citrusy, high-acid profiles, so a light roast rarely makes it past
            one bag. Read the dots against that rather than against a cupping
            score: three means <em>not for me</em>, not <em>bad coffee</em>.
          </p>
        </div>

        <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
          Pick one to see what I have had. A dot underneath means it is in
          rotation right now.
        </p>

        <RoasterPicker />
      </Section>

      <Section number="02" label="Gear" title="Coffee gear" width="reading">
        <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
          How I got here. Each one solved the problem the last one left me with.
        </p>
        <GearTimeline />
      </Section>

      {/* The one place on the site with a picture behind the type. It earns it
          by being the doorway to the long read, and the illustration is drawn
          rather than photographic, so it sits with the rest of the design. */}
      <Container width="reading" className="py-10 md:py-14">
        <Link
          href="/shelf/coffee"
          className="group relative block overflow-hidden rounded-2xl border border-border bg-card"
        >
          <Image
            src="/shelf/coffee-backdrop.webp"
            alt=""
            width={1600}
            height={1067}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none object-cover opacity-[0.13] grayscale transition-opacity duration-med ease-out group-hover:opacity-[0.2] dark:opacity-[0.08] dark:group-hover:opacity-[0.14]"
          />
          <div className="relative flex items-end justify-between gap-6 p-6 pt-16 md:p-8 md:pt-24">
            <div>
              <p className="font-mono text-2xs uppercase tracking-label text-subtle">
                Longer version
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                How I got into coffee, and what I learnt
              </p>
              <p className="mt-1.5 max-w-[46ch] text-sm text-muted-foreground">
                Roast levels, grind size, portafilters, why a lever press works,
                and why there is nothing wrong with instant.
              </p>
            </div>
            <ArrowRight className="mb-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-base ease-out group-hover:translate-x-0.5" />
          </div>
        </Link>
      </Container>

      <Section number="03" label="Gear" title="Everyday setup" width="reading">
        <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
          The rest of the desk. No shopping links on this one, on purpose.
        </p>
        <ul className="border-t border-border">
          {setup.map((item) => (
            <li
              key={item.name}
              className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="font-mono text-2xs uppercase tracking-label text-subtle sm:w-24 sm:shrink-0">
                {item.role}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-foreground">{item.name}</span>
                {item.note && (
                  <span className="mt-1 block max-w-[58ch] text-sm text-muted-foreground">
                    {item.note}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section number="04" label="Scent" title="What I wear" width="reading">
        <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
          Two, and I rotate between them. I am not a collector.
        </p>
        <ul className="border-t border-border">
          {scents.map((s) => (
            <li key={s.name} className="border-b border-border py-4">
              <p className="font-medium text-foreground">
                {s.name}
                <span className="ml-2 font-mono text-2xs uppercase tracking-label text-subtle">
                  {s.house}
                </span>
              </p>
              <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">
                {s.note}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section number="05" label="Bookmarks" title="Worth keeping" width="reading">
        <p className="mb-6 max-w-[62ch] text-sm text-muted-foreground">
          Links I come back to. Every one carries a reason, or it does not go in.
        </p>

        {/* Plain text. A chip and a card around every link made three
            bookmarks look like a product grid; the reason is the content, so
            the reason gets the space. */}
        <ul className="border-t border-border">
          {bookmarks.map((b) => (
            <li key={b.url} className="border-b border-border py-4">
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-baseline gap-1.5 font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {b.title}
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 self-center text-subtle transition-transform duration-base ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">
                {b.why}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Container width="reading" className="pb-10">
        <Link
          href="/books"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
        >
          <span>
            <span className="block font-mono text-2xs uppercase tracking-label text-subtle">
              Also on the shelf
            </span>
            <span className="mt-1.5 block font-medium text-foreground">
              Books I&apos;m reading
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-base ease-out group-hover:translate-x-0.5" />
        </Link>
      </Container>
    </main>
  );
}
