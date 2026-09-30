import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { organizations, getOrganization } from "@/lib/workData";
import { getDiary } from "@/lib/diaryData";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import PageBand from "@/components/layout/PageBand";
import Label from "@/components/layout/Label";
import ProjectShowcaseCard from "@/components/ProjectShowcaseCard";
import { workProjectToCard } from "@/lib/projectCards";
import DiaryEntry from "@/components/common/DiaryEntry";
import ProductMark from "@/components/common/ProductMark";
import CollapsibleGrid from "@/components/common/CollapsibleGrid";
import { EmploymentTag, OrgLinkChip } from "@/components/common/OrgChips";
import { formatPeriod, formatTenure } from "@/lib/tenure";
import { breadcrumbLd, ogUrl } from "@/lib/seo";

export async function generateStaticParams() {
  return organizations.map((org) => ({ org: org.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) return { title: "Not Found" };
  const description = `Work, projects, and long-form contributions log at ${org.name}, ${org.role}.`;
  const image = ogUrl({
    title: org.name,
    subtitle: org.role,
    type: "project",
    label: "Experience",
    logo: org.slug,
    meta: formatPeriod(org.period),
  });

  return {
    title: `${org.name} · Work`,
    description,
    alternates: { canonical: `${baseUrl}work/${org.slug}` },
    openGraph: { title: org.name, description, url: `${baseUrl}work/${org.slug}`, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title: org.name, description, images: [image] },
  };
}

export default async function OrgPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) notFound();
  const diary = getDiary(orgSlug);

  return (
    <main className="pb-8 md:pb-12">
      <PageBand id="Work" name={org.name} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", path: "" },
              { name: org.name, path: `work/${org.slug}` },
            ])
          ),
        }}
      />
      <Container width="reading" className="space-y-10">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-elevated ring-1 ring-border">
              <Image
                src={org.logo}
                alt={org.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-medium tracking-tight">{org.name}</h1>
                {org.link && (
                  <a href={org.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                    <ArrowSquareOut className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>{org.role}</span>
                <EmploymentTag employment={org.employment} />
                <span className="text-border-strong">·</span>
                <span className="font-mono text-xs tabular-nums text-subtle">{formatPeriod(org.period)}</span>
                {formatTenure(org.period) && (
                  <>
                    <span aria-hidden className="text-border-strong">·</span>
                    <span className="font-mono text-xs tabular-nums text-subtle">{formatTenure(org.period)}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          {org.description && <p className="max-w-[62ch] text-base leading-relaxed text-muted-foreground">{org.description}</p>}

          {/* outbound links — site / app / X (each guard short-circuits internally) */}
          {org.links && (
            <div className="flex flex-wrap items-center gap-1.5">
              {org.links.web && <OrgLinkChip href={org.links.web} label="Site" icon="external" />}
              {org.links.app && <OrgLinkChip href={org.links.app} label="App" icon="external" />}
              {org.links.twitter && <OrgLinkChip href={org.links.twitter} label="X" icon="external" />}
            </div>
          )}
        </header>

        {/* ── Key contributions ──────────────────────────────────────
            With a multi-entry diary, this is its table of contents: one row
            per product, each jumping to its entry below. No hairlines: the
            marks and the hover fill carry the rows. A single-entry diary needs
            no index, so it gets nothing. Without a diary, the org's highlight
            bullets. */}
        {diary ? (
          diary.featured.length > 1 && (
            <nav aria-label="Key contributions" className="space-y-3">
              <Label>Key contributions</Label>
              <ol className="-mx-3 space-y-1">
                {diary.featured.map((entry, i) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="group flex items-center gap-4 rounded-lg px-3 py-3 transition-colors duration-base ease-out hover:bg-muted"
                    >
                      <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-subtle">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {entry.logo && <ProductMark src={entry.logo} size={28} />}
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground">{entry.title}</span>
                        <span className="block truncate text-sm text-muted-foreground">{firstSentence(entry.summary)}</span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-subtle transition-[color,transform] duration-base ease-out group-hover:translate-x-0.5 group-hover:text-foreground"
                      />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )
        ) : (
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <Label>Key contributions</Label>
            <ul className="space-y-2">
              {org.highlights.map((h, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Projects ───────────────────────────────────────────────── */}
        {org.projects.length > 0 && (
          <>
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-medium tracking-tight">Projects</h2>
                <span className="font-mono text-xs uppercase tracking-label text-subtle">
                  {org.projects.length} shipped
                </span>
              </div>
              <CollapsibleGrid visible={4}>
                {org.projects.map((p) => (
                  <ProjectShowcaseCard key={p.id} project={workProjectToCard(org.slug, p)} />
                ))}
              </CollapsibleGrid>
            </section>
          </>
        )}

        {/* ── Diary entries ──────────────────────────────────────────── */}
        {diary && (
          <>
            <section id="diary" className="scroll-mt-16 space-y-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-medium tracking-tight">What I built</h2>
                <span className="font-mono text-xs uppercase tracking-label text-subtle">
                  {diary.featured.length} featured
                </span>
              </div>
              <ol className="divide-y divide-border candy:divide-y-0">
                {diary.featured.map((entry, idx) => (
                  <li key={entry.id} id={entry.id} className="scroll-mt-20 py-10 first:pt-0 last:pb-0">
                    <DiaryEntry entry={entry} index={idx + 1} total={diary.featured.length} />
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </Container>
    </main>
  );
}


/** The index row's one-liner: the summary up to its first full stop. */
function firstSentence(text: string): string {
  const i = text.indexOf(". ");
  return i === -1 ? text : text.slice(0, i + 1);
}
