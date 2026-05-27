import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSideProject, getAllSideProjects } from "@/lib/projectsData";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import ProseGutter from "@/components/layout/ProseGutter";
import StackIcon from "@/components/common/StackIcon";
import ProjectMedia from "@/components/project/ProjectMedia";
import { softwareAppLd, ogUrl } from "@/lib/seo";

export function generateStaticParams() {
  return getAllSideProjects().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getSideProject(params.slug);
  if (!project) return {};
  const title = project.title;
  const description = project.tagline;
  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];
  const og = ogUrl({ title, subtitle: description, type: "project", label: stack.slice(0, 3).join(" · ") });
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}project/${project.slug}` },
    openGraph: { title, description, type: "article", url: `${baseUrl}project/${project.slug}`, images: [{ url: og }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

const toList = (v?: string[] | string) => (Array.isArray(v) ? v : v ? [v] : []);

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getSideProject(params.slug);
  if (!project) return notFound();

  const cs = project.caseStudy || {};
  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];
  const sections: { key: string; label: string; heading: string; body: string[] }[] = [
    { key: "overview", label: "Overview", heading: "Overview", body: toList(cs.overview) },
    { key: "problem", label: "The problem", heading: "Why this exists", body: toList(cs.problem) },
    { key: "constraints", label: "Constraints", heading: "Constraints", body: toList(cs.constraints) },
    { key: "architecture", label: "Architecture", heading: "How it's built", body: toList(cs.architecture) },
    { key: "tradeoffs", label: "Tradeoffs", heading: "Tradeoffs", body: toList(cs.tradeoffs) },
    { key: "performance", label: "Performance", heading: "Performance", body: toList(cs.performance) },
    { key: "lessons", label: "Lessons", heading: "Lessons learned", body: toList(cs.lessons) },
  ].filter((s) => s.body.length > 0);

  return (
    <main className="py-16 md:py-24">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd(project)) }}
      />
      <Container width="reading" className="space-y-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>

        <div className="space-y-4">
          <Label>
            {["Case Study", cs.year, cs.role].filter(Boolean).join(" · ")}
          </Label>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3rem)] font-medium leading-[1.03] tracking-[-0.02em]">
            {project.title}
          </h1>
          <p className="text-lg text-muted-foreground">{project.tagline}</p>
        </div>

        <ProjectMedia thumbnail={project.thumbnail} preview={project.preview} title={project.title} />

        <ProseGutter
          gutter={
            <div className="space-y-5">
              {cs.role && <GutterItem k="Role" v={cs.role} />}
              {cs.year && <GutterItem k="Year" v={cs.year} />}
              <div>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Stack</div>
                <div className="flex flex-wrap gap-2">
                  {stack.map((t) => (
                    <StackIcon key={t} name={t} size={14} showLabel />
                  ))}
                </div>
              </div>
              {project.links && (
                <div>
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Links</div>
                  <div className="flex flex-col gap-1 text-sm">
                    {project.links.web && <a className="hover:text-accent" href={project.links.web} target="_blank" rel="noopener noreferrer">Live ↗</a>}
                    {project.links.github && <a className="hover:text-accent" href={project.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
                    {project.links.download && <a className="hover:text-accent" href={project.links.download} target="_blank" rel="noopener noreferrer">Download ↗</a>}
                    {project.links.producthunt && <a className="hover:text-accent" href={project.links.producthunt} target="_blank" rel="noopener noreferrer">Product Hunt ↗</a>}
                  </div>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-9">
            {sections.map((s) => (
              <section key={s.key} className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{s.label}</div>
                <h2 className="font-serif text-2xl">{s.heading}</h2>
                {s.body.length > 1 ? (
                  <ul className="space-y-1.5">
                    {s.body.map((line, i) => (
                      <li key={i} className="flex gap-2.5 text-[15px] text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="max-w-[62ch] text-[15px] text-muted-foreground">{s.body[0]}</p>
                )}
              </section>
            ))}

            {cs.results && cs.results.length > 0 && (
              <section className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">Results</div>
                <h2 className="font-serif text-2xl">Impact</h2>
                <div className="flex flex-wrap gap-3">
                  {cs.results.map((r, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card px-4 py-3">
                      <div className="font-serif text-2xl text-foreground">{r.value}</div>
                      <div className="text-xs text-subtle">{r.caption}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sections.length === 0 && !cs.results && project.longDescription && (
              <div className="space-y-4">
                {project.longDescription.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[15px] text-muted-foreground">{p}</p>
                ))}
              </div>
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
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{k}</div>
      <div className="text-sm text-foreground">{v}</div>
    </div>
  );
}
