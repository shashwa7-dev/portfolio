import { organizations } from "@/lib/workData";
import { clients } from "@/lib/clients";
import { baseUrl } from "@/app/sitemap";
import { markdownResponse } from "@/lib/markdownResponse";

/**
 * Homepage rendered as `text/markdown`. The root middleware rewrites
 * `/` with `Accept: text/markdown` to this route; agents see a structured
 * site summary composed from the same source data the React homepage uses.
 *
 * Direct GET also works for testing.
 */
export const dynamic = "force-static";

export function GET() {
  return markdownResponse(composeHomepageMarkdown());
}

function composeHomepageMarkdown(): string {
  const lines: string[] = [];

  // Header + bio
  lines.push("# Shashwat Tripathi — Frontend Engineer");
  lines.push("");
  lines.push(
    "> Frontend engineer building AI-first product surfaces. Currently consultant at ShopOS, an AI-native commerce platform, where I ship merchant-facing agent UIs, workflow authoring (Canvas Builder), and content-rich chat. Across 9+ production products with top AI and Web3 teams."
  );
  lines.push("");

  // At-a-glance stats
  lines.push("## At a glance");
  lines.push("");
  lines.push("- **1M+** users reached at Coinbase × Polygon NFT");
  lines.push("- **100K** day-one mints at Coinbase × Polygon NFT");
  lines.push("- **9+** products shipped across ShopOS & Dehidden");
  lines.push("- **4+ years** building frontend");
  lines.push("");

  // Currently building
  const current = organizations.find((o) => o.duration.includes("Present"));
  if (current) {
    lines.push("## Currently building");
    lines.push("");
    lines.push(`**${current.name}** — ${current.role} (${current.duration})`);
    lines.push("");
    lines.push(current.description);
    lines.push("");
    if (current.links) {
      if (current.links.web) lines.push(`- Site: ${current.links.web}`);
      if (current.links.app) lines.push(`- App: ${current.links.app}`);
      if (current.links.twitter) lines.push(`- X: ${current.links.twitter}`);
      lines.push("");
    }
  }

  // Experience snapshot
  lines.push("## Experience");
  lines.push("");
  for (const org of organizations) {
    lines.push(`### ${org.name}`);
    lines.push(`*${org.role}* · ${org.duration}`);
    lines.push("");
    lines.push(org.description);
    lines.push("");
    if (org.highlights.length > 0) {
      for (const h of org.highlights) lines.push(`- ${h}`);
      lines.push("");
    }
    lines.push(
      `Full overview + contributions log (markdown-negotiable): ${baseUrl}work/${org.slug}`
    );
    lines.push("");
  }

  // Brand affiliations
  lines.push("## Worked with");
  lines.push("");
  for (const c of clients) {
    lines.push(`- **${c.name}** — ${c.contribution}`);
  }
  lines.push("");

  // Discovery / further reading
  lines.push("## Explore");
  lines.push("");
  lines.push(`- Blog posts: ${baseUrl}blogs`);
  lines.push(`- Side projects: ${baseUrl}projects`);
  lines.push(`- Reading list: ${baseUrl}books`);
  lines.push(`- Public Claude Code skills: ${baseUrl}skills`);
  lines.push(`- Design system: ${baseUrl}design`);
  lines.push(`- Agent index: ${baseUrl}.well-known/llms.txt`);
  lines.push("");

  // Contact
  lines.push("## Contact");
  lines.push("");
  lines.push("- Email: contact@shashwa7.in");
  lines.push(`- Site: ${baseUrl}`);
  lines.push("");

  return lines.join("\n");
}
