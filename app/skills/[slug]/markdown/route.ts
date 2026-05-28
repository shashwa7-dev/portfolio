import { getSkill, getSkills } from "@/lib/skillsData";
import { frontmatter, markdownResponse } from "@/lib/markdownResponse";

/**
 * Serves the raw `SKILL.md` content as `text/markdown`. Reached either by
 * direct GET on this URL, or by the root middleware rewriting a request with
 * `Accept: text/markdown` from `/skills/<slug>`.
 */
export const dynamic = "force-static";

export async function generateStaticParams() {
  return getSkills().map((s) => ({ slug: s.slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const skill = getSkill(params.slug);
  if (!skill) {
    return new Response("Not found", { status: 404 });
  }
  const body =
    frontmatter({
      name: skill.frontmatter.name,
      description: skill.frontmatter.description,
    }) + skill.content;
  return markdownResponse(body);
}
