import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { getOrganization, getProjectFromOrg } from "@/lib/workData";
import { ActiveBadge } from "@/components/common/ActiveBadge";
import StackIcon from "@/components/common/StackIcon";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import ProseGutter from "@/components/layout/ProseGutter";
import ProjectMedia from "@/components/project/ProjectMedia";

const LINKS = [
  ["web", "Live"],
  ["github", "GitHub"],
  ["twitter", "Twitter"],
  ["opensea", "OpenSea"],
  ["other", "More"],
] as const;

/**
 * A project shipped at an organisation. Laid out like a side project's page
 * (`app/project/[slug]/page.tsx`) so the two read as one family: a back link,
 * a label line, the title, the media, then a gutter of facts (who it was built
 * at, when, the stack as icons, links) beside the writing.
 *
 * A server component. The one interactive part, the preview video, lives in
 * `ProjectMedia`. Metadata and the breadcrumb JSON-LD are in `layout.tsx`.
 */
export default async function WorkProjectPage(props: { params: Promise<{ org: string; project: string }> }) {
  const params = await props.params;
  const org = getOrganization(params.org);
  const project = getProjectFromOrg(params.org, params.project);
  if (!org || !project) return notFound();

  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];
  const links = LINKS.flatMap(([key, label]) => (project.links?.[key] ? [{ label, href: project.links[key]! }] : []));

  return (
    <main className="pt-8 md:pt-12 pb-8 md:pb-12">
      <Container width="reading" className="space-y-8">
        <Link href={`/work/${org.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to {org.name}
        </Link>

        <div className="space-y-4">
          <Label>{[`Built at ${org.name}`, project.date].filter(Boolean).join(" · ")}</Label>
          <h1 className="text-[clamp(2.2rem,5vw,3rem)] font-medium leading-[1.03] tracking-tight">{project.title}</h1>
          {project.metric && <p className="text-lg text-muted-foreground">{project.metric}</p>}
        </div>

        <ProjectMedia thumbnail={project.thumbnail} preview={project.preview} title={project.title} />

        <ProseGutter
          gutter={
            <div className="space-y-5">
              <div>
                <div className="mb-1.5 font-mono text-2xs uppercase tracking-label text-subtle">Built at</div>
                <Link href={`/work/${org.slug}`} className="inline-flex items-center gap-2 text-sm text-foreground hover:underline hover:decoration-border-strong hover:underline-offset-4">
                  {/* Logos stay in colour; only thumbnails are greyscale. */}
                  <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md bg-elevated">
                    <Image src={org.logo} alt="" fill sizes="20px" className="object-cover" />
                  </span>
                  {org.name}
                </Link>
              </div>
              {project.date && <GutterItem k="When" v={project.date} />}
              {project.isActive && (
                <div>
                  <div className="mb-1.5 font-mono text-2xs uppercase tracking-label text-subtle">Status</div>
                  <ActiveBadge label="Active project" />
                </div>
              )}
              <div>
                <div className="mb-1.5 font-mono text-2xs uppercase tracking-label text-subtle">Stack</div>
                {/* Marks only, each named by a tooltip (and by its aria-label for screen readers). */}
                <div className="flex flex-wrap items-center gap-3">
                  {stack.map((t) => (
                    <StackIcon key={t} name={t} size={18} showLabel={false} showTooltip />
                  ))}
                </div>
              </div>
              {links.length > 0 && (
                <div>
                  <div className="mb-1.5 font-mono text-2xs uppercase tracking-label text-subtle">Links</div>
                  <div className="flex flex-col gap-1 text-sm">
                    {links.map((l) => (
                      <a key={l.label} className="hover:text-foreground" href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-9">
            <section className="space-y-2">
              <div className="font-mono text-2xs uppercase tracking-label text-foreground">Overview</div>
              <h2 className="text-2xl">What it is</h2>
              <p className="max-w-[62ch] text-base text-muted-foreground">{project.description}</p>
            </section>

            {project.highlights && project.highlights.length > 0 && (
              <section className="space-y-2">
                <div className="font-mono text-2xs uppercase tracking-label text-foreground">Highlights</div>
                <h2 className="text-2xl">Key features</h2>
                <ul className="space-y-1.5">
                  {project.highlights.map((line, i) => (
                    <li key={i} className="flex gap-2.5 text-base text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ProseGutter>
      </Container>
    </main>
  );
}

function GutterItem({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="mb-1 font-mono text-2xs uppercase tracking-label text-subtle">{k}</div>
      <div className="text-sm text-foreground">{v}</div>
    </div>
  );
}
