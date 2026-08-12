import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { organizations } from "@/lib/workData";
import { formatPeriod, formatTenure, isCurrent } from "@/lib/tenure";
import Section from "@/components/layout/Section";
import ProjectPreviewCard from "@/components/ProjectPreviewCard";
import ClientStrip from "@/components/common/ClientStrip";
import { workProjectToCard } from "@/lib/projectCards";
import MarkerLink from "@/components/common/MarkerLink";
import { EmploymentTag, OrgLinkChip, Tag } from "@/components/common/OrgChips";

export default function ExperienceWork() {
  return (
    <Section
      id="experience"
      number="01"
      label="Experience & Work"
      title="Where I've worked, and what I shipped"
      width="reading"
    >
      <div>
        {organizations.map((org) => {
          const current = isCurrent(org.period);
          const tenure = formatTenure(org.period);
          const featured = org.projects.filter((p) => p.featured);
          return (
            <div key={org.id} className="pb-12 last:pb-0">
              {/* Identity, at the top level. Everything else hangs off the rail
                  below, so the org visibly owns its content.

                  `gap-3` is load-bearing, not cosmetic: a 24px logo plus a 12px
                  gap puts the org name at 36px, which is exactly where the
                  rail's `pl-9` children land. At the previous 28px logo and
                  `gap-2.5` the name sat two pixels left of everything beneath
                  it. */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/work/${org.slug}`}
                  className="group/orglink flex min-w-0 items-center gap-3"
                >
                  <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-elevated ring-1 ring-border">
                    {/* Greyscale until hover. Same treatment as the brand logos
                        in ClientStrip and the post thumbnails on the blog, so
                        one idiom covers every logo on the site. */}
                    <Image
                      src={org.logo}
                      alt={org.name}
                      fill
                      sizes="24px"
                      className="object-cover grayscale transition-[filter] duration-base ease-out group-hover/orglink:grayscale-0"
                    />
                  </span>
                  <h3 className="truncate text-lg font-semibold text-foreground/90 transition-colors duration-base ease-out group-hover/orglink:text-foreground">
                    {org.name}
                  </h3>
                </Link>
              </div>

              {/* The rail, stopping exactly 16px short of the bottom so the
                  elbow below can continue it. `before:bottom-4` matches the
                  elbow's `h-4`, and both sit at `left-3`, so the vertical line
                  and the elbow's left border are colinear and contiguous with no
                  overlap.

                  An earlier version ran the rail `h-full` and masked its tail
                  with a `bg-background` box, following the reference
                  implementation. That was wrong twice over: the curve was
                  translated a pixel left of the rail, and the mask began below
                  the curve's top, so the two strokes were briefly visible side
                  by side. Shortening the rail needs no mask, so it also cannot
                  drift out of alignment or depend on a box matching the page
                  background in both themes. */}
              <div className="relative pl-9 pt-2 before:absolute before:left-3 before:top-0 before:bottom-4 before:w-px before:bg-border">
                {/* Role metadata as a real description list, so each value says
                    what it is to a screen reader and to the markdown
                    renditions. */}
                <dl className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
                  <dt className="sr-only">Role</dt>
                  <dd>{org.role}</dd>

                  {org.employment && (
                    <dd>
                      <EmploymentTag employment={org.employment} />
                    </dd>
                  )}

                  <dt className="sr-only">Employment period</dt>
                  <dd className="font-mono text-xs tabular-nums text-subtle">
                    {formatPeriod(org.period)}
                  </dd>

                  {/* `formatTenure` returns an empty string for a non-positive
                      span, so both the separator and the value are conditional.
                      Rendering the separator unconditionally would leave a
                      dangling middot on bad data. */}
                  {tenure && (
                    <>
                      <dd aria-hidden className="text-border-strong">
                        ·
                      </dd>
                      <dt className="sr-only">Duration</dt>
                      <dd className="font-mono text-xs tabular-nums text-subtle">
                        {tenure}
                      </dd>
                    </>
                  )}

                  {/* Green is the dot only, matching the availability badge in
                      About.tsx. See the note there for why. No ping: a
                      permanent ambient loop is what this repo's motion audit
                      rejected. */}
                  {current && (
                    <dd>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-2 py-0.5 font-mono text-2xs font-medium uppercase tracking-label text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Currently building
                      </span>
                    </dd>
                  )}
                </dl>

                {org.skills && org.skills.length > 0 && (
                  <ul className="mt-2.5 flex flex-wrap gap-1.5">
                    {org.skills.map((s) => (
                      <li key={s} className="flex">
                        <Tag>{s}</Tag>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Brands worked with under this org. Sits above the outcome
                    bullets because it is a fact about the engagement, not an
                    outcome of it. Renders nothing for orgs with no brands. */}
                <div className="mt-3 empty:mt-0">
                  <ClientStrip orgSlug={org.slug} />
                </div>

                <ul className="mt-3 space-y-1.5">
                  {org.highlights.slice(0, 2).map((h, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" />
                      {h}
                    </li>
                  ))}
                </ul>

                {org.links &&
                  (org.links.web || org.links.app || org.links.twitter) && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
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

                {/* Deep-dive CTA — the org page includes the full diary inline */}
                <div className="mt-4">
                  <MarkerLink
                    href={`/work/${org.slug}`}
                    size="sm"
                    tone="foreground"
                  >
                    See what I built at {org.name}
                  </MarkerLink>
                </div>

                {featured.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="font-mono text-2xs uppercase tracking-label text-subtle">
                        Featured projects
                      </span>
                      <Link
                        href={`/work/${org.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors duration-base ease-out hover:text-foreground"
                      >
                        View all {org.projects.length}{" "}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {featured.map((p) => (
                        <ProjectPreviewCard
                          key={p.id}
                          project={workProjectToCard(org.slug, p)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* The rail's bottom terminator. Its left border picks up
                    exactly where the rail stops, so the two read as one stroke
                    turning a corner. Nothing is masked and nothing is
                    translated: `left-3` and `h-4` are the only numbers, and they
                    are the same two the rail above uses. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-3 h-4 w-4 rounded-bl-md border-b border-l border-border"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
