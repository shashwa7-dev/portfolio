import { organizations, getOrganization } from "@/lib/workData";
import { getDiary, type TDiaryEntry, type TOrgDiary } from "@/lib/diaryData";
import { markdownResponse } from "@/lib/markdownResponse";

/**
 * Serves the org overview + diary as `text/markdown`. Reached either by
 * direct GET on this URL, or by the root middleware rewriting a request with
 * `Accept: text/markdown` from `/work/<org>`.
 */
export const dynamic = "force-static";

export async function generateStaticParams() {
  return organizations.map((o) => ({ org: o.slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: { org: string } }
) {
  const org = getOrganization(params.org);
  if (!org) {
    return new Response("Not found", { status: 404 });
  }
  return markdownResponse(serializeOrg(org.name, org.role, org.duration, org.description, org.highlights, getDiary(params.org)));
}

function serializeOrg(
  name: string,
  role: string,
  duration: string,
  description: string,
  highlights: string[],
  diary?: TOrgDiary
): string {
  const lines: string[] = [];
  lines.push(`# ${name}`);
  lines.push("");
  lines.push(`**Role:** ${role}`);
  lines.push(`**Duration:** ${duration}`);
  lines.push("");
  lines.push(description);
  lines.push("");

  if (highlights.length > 0) {
    lines.push("## Key contributions");
    lines.push("");
    highlights.forEach((h) => lines.push(`- ${h}`));
    lines.push("");
  }

  if (diary) {
    if (diary.overview) {
      lines.push("## Overview");
      lines.push("");
      lines.push(diary.overview);
      lines.push("");
    }
    lines.push("## What I built");
    lines.push("");
    diary.featured.forEach((entry, i) => {
      lines.push(...serializeEntry(entry, i + 1));
    });
  }

  return lines.join("\n");
}

function serializeEntry(entry: TDiaryEntry, index: number): string[] {
  const num = String(index).padStart(2, "0");
  const lines: string[] = [
    `### ${num} · ${entry.title}`,
    "",
    `*${entry.date}*`,
    "",
    entry.summary,
    "",
  ];
  if (entry.context) {
    lines.push("**Context.** " + entry.context);
    lines.push("");
  }
  lines.push("**Contributions.**");
  lines.push("");
  entry.contributions.forEach((c) => lines.push(`- ${c}`));
  lines.push("");
  if (entry.impact) {
    lines.push(`**Impact.** ${entry.impact}`);
    lines.push("");
  }
  if (entry.stack && entry.stack.length > 0) {
    lines.push(`**Stack.** ${entry.stack.join(", ")}`);
    lines.push("");
  }
  return lines;
}
