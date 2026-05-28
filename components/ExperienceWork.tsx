import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { organizations } from "@/lib/workData";
import Section from "@/components/layout/Section";
import ProjectPreviewCard from "@/components/ProjectPreviewCard";
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
      <div className="relative pl-8">
        {/* timeline rail */}
        <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border-strong" aria-hidden />

        {organizations.map((org, idx) => {
          const isCurrent = org.duration.includes("Present");
          const isLast = idx === organizations.length - 1;
          const featured = org.projects.filter((p) => p.featured);
          return (
            <div key={org.id} className="relative pb-12 last:pb-0">
              {/* mask the timeline rail below the last node so it doesn't trail off */}
              {isLast && (
                <span className="absolute -left-[25px] top-3 bottom-0 w-px bg-background" aria-hidden />
              )}
              {/* node */}
              <span
                className={`absolute -left-8 top-1 grid h-4 w-4 place-items-center rounded-full border-2 bg-background ${
                  isCurrent ? "border-emerald-500" : "border-border-strong"
                }`}
                aria-hidden
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-emerald-500" : "bg-subtle"}`} />
              </span>

              {/* Row 1: identity (logo + name as one Link) | duration */}
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/work/${org.slug}`}
                  className="group/orglink flex min-w-0 items-center gap-2.5 transition-colors"
                >
                  <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-elevated ring-1 ring-border transition-[box-shadow] group-hover/orglink:ring-accent/50">
                    <Image src={org.logo} alt={org.name} fill className="object-cover" sizes="28px" />
                  </span>
                  <h3 className="truncate font-serif text-lg text-foreground transition-colors group-hover/orglink:text-accent">
                    {org.name}
                  </h3>
                </Link>
                <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">
                  {org.duration}
                </span>
              </div>

              {/* Row 2: role (designation) first, then tags after */}
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="text-sm text-accent-hover">{org.role}</span>
                <EmploymentTag employment={org.employment} />
                {isCurrent && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-emerald-500">
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
                  <li key={i} className="flex gap-2.5 text-[13.5px] text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
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
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Featured projects</span>
                    <Link href={`/work/${org.slug}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-accent">
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

