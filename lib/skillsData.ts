import fs from "fs";
import path from "path";

/**
 * Public Claude Code skills shared from this portfolio. Each entry maps a
 * URL slug to the directory under `.claude/skills/` (or a symlink target
 * under `.agents/skills/`) containing a `SKILL.md` with YAML frontmatter.
 *
 * Only allowlisted skills are exposed — everything else under .claude/skills/
 * (plugin caches, work-in-progress, etc.) stays private.
 */
const PUBLIC_SKILLS: { slug: string; dir: string }[] = [
  { slug: "design-system", dir: "design-system" },
];

export type TSkillFrontmatter = {
  name: string;
  description: string;
};

export type TSkill = {
  slug: string;
  /** Parsed YAML frontmatter (name + description). */
  frontmatter: TSkillFrontmatter;
  /** Markdown body (everything after the closing `---`). */
  content: string;
};

const SKILLS_ROOT = path.join(process.cwd(), ".claude", "skills");

function parseFrontmatter(raw: string): { frontmatter: TSkillFrontmatter; content: string } {
  const match = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/.exec(raw);
  if (!match) {
    return {
      frontmatter: { name: "untitled", description: "" },
      content: raw,
    };
  }
  const [, fmBlock, body] = match;
  const frontmatter: Partial<TSkillFrontmatter> = {};
  for (const line of fmBlock.trim().split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim().replace(/^['"](.*)['"]$/, "$1");
    if (key === "name" || key === "description") {
      frontmatter[key] = value;
    }
  }
  return {
    frontmatter: {
      name: frontmatter.name || "untitled",
      description: frontmatter.description || "",
    },
    content: body.trim(),
  };
}

function readSkillFile(dir: string): TSkill | null {
  const filePath = path.join(SKILLS_ROOT, dir, "SKILL.md");
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, content } = parseFrontmatter(raw);
  return {
    slug: PUBLIC_SKILLS.find((s) => s.dir === dir)?.slug ?? dir,
    frontmatter,
    content,
  };
}

export function getSkills(): TSkill[] {
  return PUBLIC_SKILLS.map((s) => readSkillFile(s.dir)).filter(
    (s): s is TSkill => s !== null
  );
}

export function getSkill(slug: string): TSkill | undefined {
  const entry = PUBLIC_SKILLS.find((s) => s.slug === slug);
  if (!entry) return undefined;
  return readSkillFile(entry.dir) ?? undefined;
}
