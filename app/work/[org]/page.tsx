import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { organizations, getOrganization } from "@/lib/workData";
import { getDiary } from "@/lib/diaryData";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import Divider from "@/components/layout/Divider";
import ProjectShowcaseCard from "@/components/ProjectShowcaseCard";
import { workProjectToCard } from "@/lib/projectCards";
import DiaryEntry from "@/components/common/DiaryEntry";
import { EmploymentTag, OrgLinkChip } from "@/components/common/OrgChips";

export async function generateStaticParams() {
  return organizations.map((org) => ({ org: org.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) return { title: "Not Found" };
  return {
    title: `${org.name} · Work`,
    description: `Work, projects, and long-form contributions log at ${org.name}, ${org.role}.`,
  };
}

export default async function OrgPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) notFound();
  const diary = getDiary(orgSlug);

  return (
    <main className="py-8 md:py-12">
      <Container width="reading" className="space-y-10">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-elevated ring-1 ring-border">
              <Image src={org.logo} alt={org.name} fill className="object-cover" sizes="48px" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{org.name}</h1>
                {org.link && (
                  <a href={org.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-accent">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>{org.role}</span>
                <EmploymentTag employment={org.employment} />
                <span className="text-border-strong">·</span>
                <span className="font-mono text-xs tabular-nums text-subtle">{org.duration}</span>
              </p>
            </div>
          </div>
          {org.description && <p className="max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">{org.description}</p>}

          {/* outbound links — site / app / X (each guard short-circuits internally) */}
          {org.links && (
            <div className="flex flex-wrap items-center gap-1.5">
              {org.links.web && <OrgLinkChip href={org.links.web} label="Site" icon="external" />}
              {org.links.app && <OrgLinkChip href={org.links.app} label="App" icon="external" />}
              {org.links.twitter && <OrgLinkChip href={org.links.twitter} label="X" icon="external" />}
            </div>
          )}
        </header>

        {/* ── Key contributions ──────────────────────────────────────── */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <Label>Key contributions</Label>
          <ul className="space-y-2">
            {org.highlights.map((h, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                {h}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Projects ───────────────────────────────────────────────── */}
        {org.projects.length > 0 && (
          <>
            <Divider />
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-xl font-medium tracking-tight">Projects</h2>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                  {org.projects.length} shipped
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {org.projects.map((p) => (
                  <ProjectShowcaseCard key={p.id} project={workProjectToCard(org.slug, p)} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── Diary entries ──────────────────────────────────────────── */}
        {diary && (
          <>
            <Divider />
            <section id="diary" className="scroll-mt-16 space-y-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-xl font-medium tracking-tight">What I built</h2>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                  {diary.featured.length} featured
                </span>
              </div>
              <ol className="divide-y divide-border">
                {diary.featured.map((entry, idx) => (
                  <li key={entry.id} className="py-10 first:pt-0 last:pb-0">
                    <DiaryEntry entry={entry} index={idx + 1} />
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

