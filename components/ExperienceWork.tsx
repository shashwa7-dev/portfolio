import Link from "next/link";
import Image from "next/image";
import { organizations } from "@/lib/workData";
import { formatPeriod } from "@/lib/tenure";
import { EmploymentTag, WorkModeTag } from "@/components/common/OrgChips";
import Section from "@/components/layout/Section";
import MarginNote from "@/components/common/MarginNote";

/**
 * Work, as one row per company: logo, name, designation with its employment
 * and work-mode tags, a one-line summary, dates. The row opens the org's own page, which holds the detail the
 * homepage used to carry (role, tags, highlights, links, featured projects).
 */
export default function ExperienceWork() {
  return (
    <Section id="experience" label="Work" title="Where I've worked, and what I shipped">
      <ul className="space-y-1">
        {organizations.map((org) => {
          return (
            <li key={org.id} className="relative">
              <Link
                href={`/work/${org.slug}`}
                className="group -mx-3 flex items-start gap-3 rounded-lg px-3 py-3 transition-colors duration-base ease-out hover:bg-muted"
              >
                <span className="relative mt-px h-7 w-7 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
                  <Image src={org.logo} alt="" fill sizes="28px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{org.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-foreground/80">
                    <span className="mr-0.5">{org.role}</span>
                    <EmploymentTag employment={org.employment} />
                    <WorkModeTag mode={org.workMode} />
                  </span>
                  {org.summary && <span className="mt-1 block text-sm text-muted-foreground">{org.summary}</span>}
                </span>
                <span className="mt-1 shrink-0 font-mono text-xs tabular-nums text-subtle">{formatPeriod(org.period)}</span>
              </Link>
              <MarginNote id={org.slug} />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
