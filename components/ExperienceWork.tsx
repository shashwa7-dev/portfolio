import Link from "next/link";
import Image from "next/image";
import { organizations } from "@/lib/workData";
import Section from "@/components/layout/Section";
import ProjectShowcaseCard from "@/components/ProjectShowcaseCard";
import { workProjectToCard } from "@/lib/projectCards";

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

        {organizations.map((org) => {
          const isCurrent = org.duration.includes("Present");
          const featured = org.projects.filter((p) => p.featured);
          return (
            <div key={org.id} className="relative pb-12 last:pb-0">
              {/* node */}
              <span
                className={`absolute -left-8 top-1 grid h-4 w-4 place-items-center rounded-full border-2 bg-background ${
                  isCurrent ? "border-emerald-500" : "border-border-strong"
                }`}
                aria-hidden
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-emerald-500" : "bg-subtle"}`} />
              </span>

              {/* role header */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="relative h-7 w-7 overflow-hidden rounded-md bg-elevated ring-1 ring-border">
                    <Image src={org.logo} alt={org.name} fill className="object-cover" sizes="28px" />
                  </span>
                  <h3 className="font-serif text-lg text-foreground">{org.name}</h3>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Currently building
                    </span>
                  )}
                </div>
                <span className="ml-auto font-mono text-xs tabular-nums text-subtle">{org.duration}</span>
              </div>
              <div className="mt-1 text-sm text-accent-hover">{org.role}</div>

              {/* highlights (top 2) */}
              <ul className="mt-3 space-y-1.5">
                {org.highlights.slice(0, 2).map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-[13.5px] text-muted-foreground">
                    <span className="mt-2 h-px w-3 shrink-0 bg-subtle" />
                    {h}
                  </li>
                ))}
              </ul>

              {/* featured projects */}
              {featured.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Featured projects</span>
                    <Link href={`/work/${org.slug}`} className="text-xs text-muted-foreground transition-colors hover:text-accent">
                      View all {org.projects.length} →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {featured.map((p) => (
                      <ProjectShowcaseCard key={p.id} project={workProjectToCard(org.slug, p)} />
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
