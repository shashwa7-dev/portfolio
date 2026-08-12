import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { organizations } from "@/lib/workData";
import Section from "@/components/layout/Section";
import ProjectPreviewCard from "@/components/ProjectPreviewCard";
import Clients from "@/components/Clients";
import { workProjectToCard } from "@/lib/projectCards";
import MarkerLink from "@/components/common/MarkerLink";
import { EmploymentTag, OrgLinkChip } from "@/components/common/OrgChips";

export default function ExperienceWork() {
  return (
    <Section
      id="experience"
      number="01"
      label="Experience & Work"
      title="Where I've worked, and what I shipped"
      width="reading"
    >
      {/* Credential strip. The logos frame the work history rather than sitting
          in a section of their own, because the outcomes that make them a
          credential (each project's `metric`) are rendered by the org rows
          below. See the note in Clients.tsx. */}
      <Clients />

      <div>
        {organizations.map((org) => {
          const isCurrent = org.duration.includes("Present");
          const featured = org.projects.filter((p) => p.featured);
          return (
            <div key={org.id} className="pb-12 last:pb-0">
              {/* Row 1: identity (logo + name as one Link) | duration */}
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/work/${org.slug}`}
                  className="group/orglink flex min-w-0 items-center gap-2.5 transition-colors"
                >
                  <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-elevated ring-1 ring-border transition-[box-shadow] group-hover/orglink:ring-border-strong">
                    <Image src={org.logo} alt={org.name} fill className="object-cover" sizes="28px" />
                  </span>
                  <h3 className="truncate text-lg font-semibold text-foreground/90 transition-colors group-hover/orglink:text-foreground">
                    {org.name}
                  </h3>
                </Link>
                <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">
                  {org.duration}
                </span>
              </div>

              {/* Row 2: role (designation) first, then tags after */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="text-sm text-muted-foreground">{org.role}</span>
                <EmploymentTag employment={org.employment} />
                {isCurrent && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 px-2 py-0.5 font-mono text-2xs font-medium uppercase tracking-label text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Currently building
                  </span>
                )}
              </div>

              {/* org links — landing site, app, etc. */}
              {org.links && (org.links.web || org.links.app || org.links.twitter) && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {org.links.web && (
                    <OrgLinkChip href={org.links.web} label="Site" />
                  )}
                  {org.links.app && (
                    <OrgLinkChip href={org.links.app} label="App" />
                  )}
                  {org.links.twitter && (
                    <OrgLinkChip href={org.links.twitter} label="X" />
                  )}
                </div>
              )}

              {/* highlights (top 2) */}
              <ul className="mt-3 space-y-1.5">
                {org.highlights.slice(0, 2).map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" />
                    {h}
                  </li>
                ))}
              </ul>

              {/* Deep-dive CTA — the org page now includes the full diary inline */}
              <div className="mt-4">
                <MarkerLink href={`/work/${org.slug}`} size="sm" tone="foreground">
                  See what I built at {org.name}
                </MarkerLink>
              </div>

              {/* featured projects */}
              {featured.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="font-mono text-2xs uppercase tracking-label text-subtle">Featured projects</span>
                    <Link href={`/work/${org.slug}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                      View all {org.projects.length} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {featured.map((p) => (
                      <ProjectPreviewCard key={p.id} project={workProjectToCard(org.slug, p)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

