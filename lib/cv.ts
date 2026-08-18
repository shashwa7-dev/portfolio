/**
 * The CV, parsed from one markdown file.
 *
 * `data/cv.md` is the single source: the same file is rendered to PDF for
 * download and to HTML for `/cv`. Keeping one source is the whole point. A
 * hand-maintained page beside a hand-maintained PDF drifts within one edit, and
 * the drift is invisible until someone reads both.
 */

export type CvBlock =
  | { kind: "section"; text: string }
  | { kind: "role"; title: string; meta: string }
  | { kind: "para"; html: string }
  | { kind: "labelled"; rows: { label: string; value: string }[] }
  | { kind: "list"; items: string[] }
  | { kind: "stack"; text: string }
  | { kind: "project"; name: string; meta: string };

export type Cv = {
  name: string;
  title: string;
  contact: string[];
  blocks: CvBlock[];
};

/**
 * Matches a `Label: value` row, the shape the skills and stack lines use.
 *
 * The character class has to include the comma. Without it "Backend, AI and
 * Web3" failed to match and fell through to the paragraph branch, so one skills
 * row rendered as full-width body prose in the middle of an aligned table.
 * Renaming a category should never change how it lays out.
 */
const LABEL = /^([A-Z][A-Za-z0-9/+&.,' -]{1,38}):\s(.+)$/;

/**
 * A side-project heading: `**Name** (year) — link`.
 *
 * The year and dash are required. Matching any line that merely opens with
 * bold caught the summary's first line, which begins `**AI-adaptive frontend
 * engineer**`, and tore the paragraph in half with its opening words promoted
 * to a heading.
 */
const PROJECT = /^\*\*(.+?)\*\*\s*(\(\d{4}\)\s*—\s*.*)$/;

/**
 * Inline markdown to HTML: bold, explicit links, then bare contact details and
 * domains. Escaping happens first, and the autolinker runs only on text outside
 * existing anchors, so a URL already inside an href is never linked twice.
 */
export function inlineHtml(input: string): string {
  const esc = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withMarks = esc
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

  const CONTACT =
    /([\w.+-]+@[\w-]+\.[\w.]+)|(\+91 \d{5} \d{5})|((?:[\w-]+\.)+(?:in|ai|com|network|io|dev|technology|live)(?:\/[\w./#?=-]*)?)/g;

  // Product names that merely look like domains.
  const NOLINK = new Set(["eatri8.ai"]);

  let depth = 0;
  return withMarks
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        if (part.startsWith("<a ")) depth++;
        else if (part.startsWith("</a")) depth--;
        return part;
      }
      if (depth > 0) return part;
      return part.replace(CONTACT, (m, email, phone, domain) => {
        if (email) return `<a href="mailto:${email}">${email}</a>`;
        if (phone) return `<a href="tel:${phone.replace(/\s/g, "")}">${phone}</a>`;
        if (NOLINK.has(domain.toLowerCase().replace(/\/$/, ""))) return domain;
        return `<a href="https://${domain}" target="_blank" rel="noopener noreferrer">${domain}</a>`;
      });
    })
    .join("");
}

export function parseCv(md: string): Cv {
  const lines = md.split("\n");
  const name = lines[0].replace(/^#\s*/, "").trim();
  const title = lines[1].trim();
  const contact = lines
    .slice(2, 6)
    .filter((l) => l.trim() && !l.startsWith("---"));

  const blocks: CvBlock[] = [];
  let i = lines.findIndex((l) => l.startsWith("---")) + 1;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      blocks.push({ kind: "section", text: line.slice(3).trim() });
      i++;
    } else if (line.startsWith("### ")) {
      blocks.push({
        kind: "role",
        title: line.slice(4).trim(),
        meta: (lines[i + 1] ?? "").trim(),
      });
      i += 2;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("  "))) {
        if (lines[i].startsWith("- ")) items.push(lines[i].slice(2).trim());
        else items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      blocks.push({ kind: "list", items });
    } else if (LABEL.test(line.trim())) {
      const rows: { label: string; value: string }[] = [];
      while (i < lines.length && lines[i].trim()) {
        const m = LABEL.exec(lines[i].trim());
        if (!m) break;
        rows.push({ label: m[1], value: m[2] });
        i++;
      }
      // A lone `Stack:` under a role reads as a caption, not as a table.
      if (rows.length === 1 && rows[0].label === "Stack") {
        blocks.push({ kind: "stack", text: `${rows[0].label}: ${rows[0].value}` });
      } else {
        blocks.push({ kind: "labelled", rows });
      }
    } else if (line.startsWith("**") && PROJECT.test(line)) {
      // Its own block, or the paragraph collector below swallows the heading
      // and the description into one run-on line.
      const m = PROJECT.exec(line)!;
      blocks.push({ kind: "project", name: m[1], meta: m[2].trim() });
      i++;
    } else if (line.startsWith("---") || !line.trim()) {
      i++;
    } else {
      const para: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].startsWith("#") &&
        !lines[i].startsWith("-") &&
        !lines[i].startsWith("---") &&
        !LABEL.test(lines[i].trim())
      ) {
        para.push(lines[i].trim());
        i++;
      }
      blocks.push({ kind: "para", html: inlineHtml(para.join(" ")) });
    }
  }

  return { name, title, contact, blocks };
}
