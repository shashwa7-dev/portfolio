import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2 } from "lucide-react";
import { getSkill, getSkills } from "@/lib/skillsData";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import MarkdownMessage from "@/components/chat/MarkdownMessage";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getSkills().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) return { title: "Not Found" };
  return {
    title: `${skill.frontmatter.name} · Skills`,
    description: skill.frontmatter.description,
  };
}

export default async function SkillDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  const sourcePath = `.claude/skills/${slug}/SKILL.md`;

  return (
    <main className="py-8 md:py-12">
      <Container width="reading" className="space-y-10">
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All skills
        </Link>

        <header className="space-y-3">
          <Label>Skill</Label>
          <h1 className="font-serif text-3xl font-medium tracking-tight md:text-[2.25rem]">
            {skill.frontmatter.name}
          </h1>
          <p className="max-w-prose text-muted-foreground">
            {skill.frontmatter.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground">
              <Code2 className="h-3 w-3" /> {sourcePath}
            </span>
            <Link
              href={`/skills/${slug}/markdown`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              View raw .md →
            </Link>
          </div>
        </header>

        <article className="skill-prose text-[15px] leading-relaxed text-foreground">
          <MarkdownMessage content={skill.content} />
        </article>
      </Container>
    </main>
  );
}
