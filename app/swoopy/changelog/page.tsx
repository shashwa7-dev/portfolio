import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import { ogUrl } from "@/lib/seo";
import { releases } from "../releases";

const DESCRIPTION = "Every Swoopy release: what's new and what got better.";

export const metadata: Metadata = {
  title: "Swoopy: version history",
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}swoopy/changelog` },
  openGraph: {
    title: "Swoopy: version history",
    description: DESCRIPTION,
    url: `${baseUrl}swoopy/changelog`,
    images: [{ url: ogUrl({ title: "Swoopy", subtitle: "Version history", type: "generic", label: "Chrome extension", meta: `v${releases[0].version}` }) }],
  },
};

export default function SwoopyChangelog() {
  return (
    <main className="pt-8 pb-8 md:pt-12 md:pb-12">
      <Container width="reading">
        <Link href="/swoopy" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground">
          <ArrowLeft size={14} aria-hidden />
          Swoopy
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tighter text-foreground md:text-4xl">Version history</h1>
        <p className="mt-3 text-muted-foreground">{DESCRIPTION}</p>

        <ol className="mt-10 space-y-12">
          {releases.map((r) => (
            <li key={r.version} id={`v${r.version}`} className="scroll-mt-16 md:grid md:grid-cols-[9rem_1fr] md:gap-8">
              <div className="mb-3 md:mb-0">
                <p className="font-mono text-lg font-medium text-foreground">v{r.version}</p>
                <p className="text-sm text-muted-foreground">{r.date}</p>
                {r.status === "In review" && (
                  <span className="mt-2 inline-block rounded-sm border border-border px-2 py-0.5 font-mono text-2xs uppercase tracking-label text-subtle">
                    In review
                  </span>
                )}
              </div>
              <div>
                <p className="text-base text-foreground">{r.summary}</p>
                {r.groups.map((g) => (
                  <div key={g.title} className="mt-5">
                    <Label>{g.title}</Label>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground marker:text-subtle">
                      {g.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </main>
  );
}
