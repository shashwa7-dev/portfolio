import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { organizations } from "@/lib/workData";
import { formatPeriod, formatTenure } from "@/lib/tenure";
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
          const tenure = formatTenure(org.period);
          const featured = org.projects.filter((p) => p.featured);
          return (
            <div key={org.id} className="pb-10 last:pb-0 sm:pb-12">
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

              {/* The rail stops 26px short of the bottom so the elbow below can
                  continue it, and both sit at `left-3`, so the vertical line and
                  the elbow's left border are colinear and contiguous with no
                  overlap.

                  26px is the elbow's own 16px height plus a 10px lift. The lift
                  is what puts the elbow's horizontal stroke level with the last
                  line of text rather than below it: that last line is the
                  deep-dive link at `text-sm`, 13px on a 1.55 line height, so its
                  box is about 20px and its centre sits 10px above the wrapper's
                  bottom edge. Without the lift the stroke landed on the very
                  bottom of the line box, reading as though the rail overshot.

                  An earlier version ran the rail `h-full` and masked its tail
                  with a `bg-background` box, following the reference
                  implementation. That was wrong twice over: the curve was
                  translated a pixel left of the rail, and the mask began below
                  the curve's top, so the two strokes were briefly visible side
                  by side. Shortening the rail needs no mask, so it also cannot
                  drift out of alignment or depend on a box matching the page
                  background in both themes. */}
              <div className="relative pl-9 pt-2 before:absolute before:left-3 before:top-0 before:bottom-[1.625rem] before:w-px before:bg-border">
                {/* Role metadata as a real description list, so each value says
                    what it is to a screen reader and to the markdown renditions.
                    Values carry `whitespace-nowrap` so a narrow column wraps
                    between them rather than through the middle of a date range.

                    A "Currently building" badge used to sit at the end of this
                    row. It was the single biggest source of clutter on a phone,
                    and it was redundant: `formatPeriod` already renders the
                    ongoing case as "Present". */}
                <dl className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
                  <dt className="sr-only">Role</dt>
                  <dd>{org.role}</dd>

                  {org.employment && (
                    <dd>
                      <EmploymentTag employment={org.employment} />
                    </dd>
                  )}

                  <dt className="sr-only">Employment period</dt>
                  <dd className="whitespace-nowrap font-mono text-xs tabular-nums text-subtle">
                    {formatPeriod(org.period)}
                  </dd>

                  {/* `formatTenure` returns an empty string for a non-positive
                      span, so both the separator and the value are conditional.
                      Rendering the separator unconditionally would leave a
                      dangling middot on bad data. */}
                  {/* The separator lives inside the duration's own `dd` rather
                      than in a `dd` of its own. As a standalone `dd` it came
                      before its `dt`, so it read as a second value of
                      "Employment period" instead of punctuation. */}
                  {tenure && (
                    <>
                      <dt className="sr-only">Duration</dt>
                      <dd className="whitespace-nowrap font-mono text-xs tabular-nums text-subtle">
                        <span aria-hidden className="mr-2 text-border-strong">
                          ·
                        </span>
                        {tenure}
                      </dd>
                    </>
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

                {featured.length > 0 && (
                  <div className="mt-4">
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

                {/* Deep-dive CTA, deliberately last. It used to sit above the featured
                    projects, so it invited a reader deeper and was then followed by
                    more content. Being last also makes the rail's elbow land on a
                    line of text for every org rather than only for those with no
                    projects. */}
                <div className="mt-5">
                  <MarkerLink
                    href={`/work/${org.slug}`}
                    size="sm"
                    tone="foreground"
                  >
                    See what I built at {org.name}
                  </MarkerLink>
                </div>

                {/* The rail's bottom terminator. Its left border picks up
                    exactly where the rail stops, so the two read as one stroke
                    turning a corner. Nothing is masked and nothing is
                    translated: `left-3` and `h-4` are the only numbers, and they
                    are the same two the rail above uses. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 rounded-bl-md border-b border-l border-border"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
