import { getOrganization } from "@/lib/workData";
import {
  diaries,
  getDiary,
  type TDiaryEntry,
  type TOrgDiary,
} from "@/lib/diaryData";
import { markdownResponse } from "@/lib/markdownResponse";

/**
 * Serves the org diary as `text/markdown`. Reached either by direct GET on
 * this URL, or by the root middleware rewriting `Accept: text/markdown`
 * requests from `/work/<org>/log`.
 */
export const dynamic = "force-static";

export async function generateStaticParams() {
  return diaries.map((d) => ({ org: d.org }));
}

export async function GET(
  _req: Request,
  { params }: { params: { org: string } }
) {
  const org = getOrganization(params.org);
  const diary = getDiary(params.org);
  if (!org || !diary) {
    return new Response("Not found", { status: 404 });
  }

  return markdownResponse(
    serializeDiary(org.name, org.role, org.duration, diary)
  );
}

function serializeDiary(
  orgName: string,
  role: string,
  duration: string,
  diary: TOrgDiary
): string {
  const lines: string[] = [];

  lines.push(`# ${orgName} — Diary`);
  lines.push("");
  lines.push(`**Role:** ${role}`);
  lines.push(`**Duration:** ${duration}`);
  lines.push("");

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

  if (diary.other && diary.other.length > 0) {
    lines.push("## Also shipped");
    lines.push("");
    diary.other.forEach((item) => {
      const date = item.date ? ` *(${item.date})*` : "";
      lines.push(`- **${item.title}**${date} — ${item.summary}`);
    });
    lines.push("");
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
