/**
 * Renders `data/cv.md` to `public/shashwat-tripathi-cv.pdf`.
 *
 *   npm run cv:pdf
 *
 * Uses the same `parseCv` the `/cv` page uses, so the PDF and the page cannot
 * say different things. The HTML is printed by headless Chrome (the system
 * install), which is what produced every earlier version of the file. Fonts come
 * from Google Fonts, so the first run needs network.
 *
 * One page is the target. If an edit pushes it to two, the script says so
 * rather than failing: two pages is allowed, it just should not happen by
 * accident.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseCv, inlineHtml, type CvBlock } from "../lib/cv";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/shashwat-tripathi-cv.pdf");
const HTML = path.join(ROOT, ".cache/cv-print.html");
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const cv = parseCv(readFileSync(path.join(ROOT, "data/cv.md"), "utf8"));
const avatar = readFileSync(path.join(ROOT, "public/images/avatar.png")).toString("base64");

/**
 * A role's meta line is "dates | extra". The dates go to the right of the
 * title, as a CV reader expects; anything after the first "|" (a domain, say)
 * follows them.
 */
function roleRow(title: string, meta: string): string {
  const parts = meta.split(/\s+\|\s+/).map((p) => inlineHtml(p));
  return `<div class="row role"><h3>${inlineHtml(title)}</h3><span class="when">${parts.join(" · ")}</span></div>`;
}

let section = "";
function block(b: CvBlock): string {
  switch (b.kind) {
    case "section":
      section = b.text;
      return `<h2>${b.text}</h2>`;
    case "role":
      return roleRow(b.title, b.meta);
    case "para": {
      // Education is one line of "degree | years | grade": the degree stays
      // left and the rest right-aligns, the same shape as a role row.
      if (section === "EDUCATION" && b.html.includes(" | ")) {
        const [left, ...rest] = b.html.split(" | ");
        return `<div class="row"><p>${left}</p><span class="when">${rest.join(" · ")}</span></div>`;
      }
      return `<p class="intro">${b.html}</p>`;
    }
    case "list":
      return `<ul>${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("")}</ul>`;
    case "stack": {
      const [label, value] = b.text.split(/:\s(.+)/);
      return `<div class="stack"><b>${label}</b> ${value}</div>`;
    }
    case "labelled":
      return `<table class="rows">${b.rows
        .map((r) => `<tr><th>${r.label}</th><td>${inlineHtml(r.value)}</td></tr>`)
        .join("")}</table>`;
    case "project":
      return `<h3>${inlineHtml(b.name)} <span class="when">${inlineHtml(b.meta)}</span></h3>`;
  }
}

const body = cv.blocks.map(block).join("\n");

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm 15mm 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font: 9.2pt/1.47 "DM Sans", system-ui, sans-serif; color: #2a2724; }
  a { color: inherit; text-decoration: underline; text-decoration-color: #c9c4bd; text-underline-offset: 2px; }
  strong, b { font-weight: 600; color: #0e0d0c; }

  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.02em; line-height: 1; color: #0e0d0c; }
  .title { margin-top: 6px; font-size: 10.2pt; color: #4a4642; }
  .contact { margin-top: 8px; font: 8pt/1.65 "IBM Plex Mono", monospace; color: #6b6660; }
  .contact a { text-decoration: none; }
  .avatar { width: 62px; height: 62px; border-radius: 12px; border: 1px solid #ddd8d1; object-fit: cover; }

  h2 { margin: 14px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd8d1;
       font: 600 8.2pt "DM Sans", sans-serif; letter-spacing: 0.14em; color: #0e0d0c; }

  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
  .role { margin-top: 12px; }
  h2 + .role { margin-top: 0; }
  h3 { font-size: 10.8pt; font-weight: 600; color: #0e0d0c; }
  .when { flex-shrink: 0; font: 8pt "IBM Plex Mono", monospace; color: #6b6660; }
  .when a { text-decoration: none; }

  p.intro { margin: 4px 0 6px; color: #3a3632; }
  ul { margin: 0 0 0 14px; }
  li { margin: 0 0 4.2px; padding-left: 3px; }
  li::marker { color: #9a938a; }
  .stack { margin: 6px 0 0; font: 7.9pt "IBM Plex Mono", monospace; color: #6b6660; }
  .stack b { color: #2a2724; font-weight: 500; }

  table.rows { border-collapse: collapse; }
  table.rows th { text-align: left; font-weight: 600; color: #0e0d0c; padding: 2.4px 16px 2.4px 0; white-space: nowrap; vertical-align: top; }
  table.rows td { padding: 2.4px 0; }
</style></head>
<body>
  <header>
    <div>
      <h1>${cv.name}</h1>
      <div class="title">${cv.title}</div>
      <div class="contact">${cv.contact.map((c) => `<div>${inlineHtml(c)}</div>`).join("")}</div>
    </div>
    <img class="avatar" src="data:image/png;base64,${avatar}" alt="">
  </header>
  ${body}
</body></html>`;

mkdirSync(path.dirname(HTML), { recursive: true });
writeFileSync(HTML, html);

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME_PATH.`);
  process.exit(1);
}
execFileSync(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--virtual-time-budget=8000",
  `--print-to-pdf=${OUT}`,
  `file://${HTML}`,
], { stdio: "ignore" });

const pages = (readFileSync(OUT, "latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
console.log(`Wrote ${path.relative(ROOT, OUT)} (${pages} page${pages === 1 ? "" : "s"})`);
if (pages > 1) console.warn("More than one page: tighten data/cv.md if that was not intended.");
