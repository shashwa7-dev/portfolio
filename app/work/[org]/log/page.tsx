import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getOrganization } from "@/lib/workData";
import { diaries, getDiary, type TDiaryEntry } from "@/lib/diaryData";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import StackIcon from "@/components/common/StackIcon";
import Marker from "@/components/common/Marker";
import { withMarker } from "@/lib/markerHighlight";

export async function generateStaticParams() {
  return diaries.map((d) => ({ org: d.org }));
}

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  if (!org) return { title: "Not Found" };
  return {
    title: `${org.name} · Diary`,
    description: `Long-form contributions log at ${org.name}, ${org.role}.`,
  };
}

export default async function OrgLogPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  const diary = getDiary(orgSlug);
  if (!org || !diary) notFound();

  return (
    <main className="py-16 md:py-24">
      <Container width="reading" className="space-y-12">
        <Link
          href={`/work/${orgSlug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {org.name}
        </Link>

        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-elevated ring-1 ring-border">
              <Image src={org.logo} alt={org.name} fill className="object-cover" sizes="48px" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{org.name}</h1>
                {org.link && (
                  <a
                    href={org.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {org.role}
                <span className="mx-1.5 text-border-strong">·</span>
                <span className="font-mono text-xs tabular-nums text-subtle">{org.duration}</span>
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <Marker variant="marker">
              <Label>Diary</Label>
            </Marker>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
              {diary.featured.length} featured
              {diary.other?.length ? ` · ${diary.other.length} more` : ""}
            </span>
          </div>
        </header>

        {diary.overview && (
          <section>
            <p className="text-muted-foreground">
              {withMarker(diary.overview, diary.overviewHighlight, "marker", 0.15)}
            </p>
          </section>
        )}

        <section className="space-y-4">
          <Label>What I built</Label>
          <ol className="space-y-4">
            {diary.featured.map((entry, idx) => (
              <li key={entry.id}>
                <FeaturedEntryCard entry={entry} index={idx + 1} />
              </li>
            ))}
          </ol>
        </section>

        {diary.other && diary.other.length > 0 && (
          <section className="space-y-3">
            <Label>Also shipped</Label>
            <ul className="space-y-3">
              {diary.other.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-foreground">{item.title}</span>
                      {item.date && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                          {item.date}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">{item.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </main>
  );
}

function FeaturedEntryCard({ entry, index }: { entry: TDiaryEntry; index: number }) {
  const num = String(index).padStart(2, "0");
  return (
    <article className="rounded-2xl border border-border bg-card p-6 md:p-7">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-hover">
          {num}
        </span>
        <h3 className="font-serif text-[1.35rem] font-semibold tracking-tight text-foreground">
          {entry.title}
        </h3>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {entry.date}
        </span>
      </header>

      <p className="mt-3 text-[15px] font-medium leading-relaxed text-foreground/90">
        {withMarker(entry.summary, entry.summaryHighlight, "marker", 0.1)}
      </p>

      {entry.context && (
        <div className="mt-6 space-y-2">
          <Label>Context</Label>
          <p className="text-sm leading-relaxed text-muted-foreground">{entry.context}</p>
        </div>
      )}

      <div className="mt-6 space-y-2">
        <Label>Contributions</Label>
        <ul className="space-y-2">
          {entry.contributions.map((c, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/60" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {entry.impact && (
        <div className="mt-6 rounded-lg border-l-2 border-accent bg-accent/5 px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Impact
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {withMarker(entry.impact, entry.impactHighlight, "line", 0.35)}
          </p>
        </div>
      )}

      {entry.stack && entry.stack.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5 border-t border-border pt-5">
          {entry.stack.map((name) => (
            <StackIcon key={name} name={name} size={12} />
          ))}
        </div>
      )}
    </article>
  );
}
