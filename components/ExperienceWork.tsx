import Link from "next/link";
import Image from "next/image";
import { organizations } from "@/lib/workData";
import { formatPeriod } from "@/lib/tenure";
import { orgSubtitle } from "@/lib/home";
import Section from "@/components/layout/Section";
import ProjectPreviewCard from "@/components/ProjectPreviewCard";
import { workProjectToCard } from "@/lib/projectCards";
import MarginNote from "@/components/common/MarginNote";

/**
 * Work, as one row per company: logo, name, what was built there (or for
 * whom), dates. The row opens the org's own page, which holds the detail the
 * homepage used to carry (role, tags, highlights, links). Featured project
 * cards stay under their org, indented to the name.
 */
export default function ExperienceWork() {
  return (
    <Section id="experience" label="Work" title="Where I've worked, and what I shipped">
      <ul className="space-y-1">
        {organizations.map((org) => {
          const featured = org.projects.filter((p) => p.featured);
          const subtitle = orgSubtitle(org);
          return (
            <li key={org.id} className="relative">
              <Link
                href={`/work/${org.slug}`}
                className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-base ease-out hover:bg-muted"
              >
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
                  <Image src={org.logo} alt="" fill sizes="28px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{org.name}</span>
                  {subtitle && <span className="block truncate text-sm text-muted-foreground">{subtitle}</span>}
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">{formatPeriod(org.period)}</span>
              </Link>
              <MarginNote id={org.slug} />
              {featured.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2.5 pb-4 sm:grid-cols-2 sm:pl-10">
                  {featured.map((p, i) => (
                    <ProjectPreviewCard key={p.id} project={workProjectToCard(org.slug, p)} index={i} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
