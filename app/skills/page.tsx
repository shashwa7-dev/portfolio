import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSkills } from "@/lib/skillsData";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";

export const metadata = {
  title: "Skills",
  description:
    "Claude Code skills I author and use. Fork, adapt, or drop them into your own .claude/skills/ directory.",
};

export default function SkillsIndex() {
  const skills = getSkills();
  return (
    <main className="py-8 md:py-12">
      <Container width="reading" className="space-y-10">
        <header className="space-y-4">
          <Label>Skills</Label>
          <h1 className="font-serif text-3xl font-medium tracking-tight md:text-[2.25rem]">
            Claude Code skills, open to fork
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Skills I author and use day-to-day. Each one is a single
            <span className="mx-1 font-mono text-[13px] text-foreground">
              SKILL.md
            </span>
            with YAML frontmatter that Claude Code (or any compatible runtime)
            can load. Open one to read the rendered version, or hit it with
            <span className="ml-1 font-mono text-[13px] text-foreground">
              {`Accept: text/markdown`}
            </span>{" "}
            to get the raw source.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-4">
          {skills.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/skills/${s.slug}`}
                className="group block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-border-strong"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">
                    {s.frontmatter.name || s.slug}
                  </h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle group-hover:text-accent">
                    Read
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.frontmatter.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-accent">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                    .claude/skills/{s.slug}/SKILL.md
                  </span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
