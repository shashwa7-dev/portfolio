import fs from "fs";
import path from "path";
import Image from "next/image";
import { DownloadSimple } from "@phosphor-icons/react/ssr";
import Container from "@/components/layout/Container";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, breadcrumbLd } from "@/lib/seo";
import { parseCv, inlineHtml, displayName, dotSeparated, headerFacts, type CvBlock } from "@/lib/cv";

const PDF = "/shashwat-tripathi-cv.pdf";

const DESCRIPTION =
  "The CV of Shashwat Tripathi, frontend engineer. Read it here or download the PDF.";

export const metadata = {
  title: "CV",
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}cv` },
  openGraph: {
    title: "CV",
    description: DESCRIPTION,
    url: `${baseUrl}cv`,
    images: [
      {
        url: ogUrl({
          title: "Shashwat Tripathi",
          subtitle: "Frontend engineer. Read the CV, or take the PDF.",
          type: "generic",
          label: "CV",
          meta: "Updated 2026",
        }),
      },
    ],
  },
};

/**
 * The CV as a page.
 *
 * Read from `data/cv.md` at build time, which is the same file the PDF is
 * generated from. Two renderings of one source rather than two documents to
 * keep in step.
 *
 * `dangerouslySetInnerHTML` is used against markdown this repo owns and that no
 * visitor can influence, and `inlineHtml` escapes before it adds any markup.
 */
export default function CvPage() {
  const md = fs.readFileSync(path.join(process.cwd(), "data/cv.md"), "utf8");
  const cv = parseCv(md);
  // Read from the file at build time, so the header can never advertise a size
  // the PDF no longer has after `npm run cv:pdf`.
  const pdfKb = Math.round(fs.statSync(path.join(process.cwd(), "public", PDF)).size / 1024);

  return (
    <main className="pt-8 md:pt-12 pb-8 md:pb-12">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", path: "" },
              { name: "CV", path: "cv" },
            ])
          ),
        }}
      />

      <Container width="reading">
        {/* The page header, the same shape as /shelf and /blogs: a display
            heading and a lede, plus what the download actually is. The button
            lives here so the page's one action sits with the page's title
            rather than floating above the document. */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="space-y-3">
            <h1 className="text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-tight">CV</h1>
            <p className="max-w-[52ch] text-muted-foreground">
              Five years of frontend for AI and Web3 products, from ShopOS back to
              Dehidden. Read it here, or take the one-page PDF.
            </p>
            <p className="font-mono text-xs text-subtle">One page · PDF · {pdfKb} KB</p>
          </div>
          <a
            href={PDF}
            download
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground transition-[color,background-color,transform] duration-fast ease-out hover:bg-accent-hover active:scale-[0.97] sm:self-auto"
          >
            <DownloadSimple aria-hidden className="h-3.5 w-3.5" />
            Download PDF
          </a>
        </header>

        {/* The sheet: one plain page. It used to be a receipt, with a wavy
            masked edge, notches bitten out at a tear line, a perforated
            "tear off a copy" stub and a paper-grain layer, and next to the
            minimal homepage that read as a gimmick. What is left is what makes
            it read as a document: a white page, a hairline edge, a barely
            there contact shadow, and a classic résumé layout that matches the
            PDF. A longer cast shadow was tried and read as a floating card. In dark
            mode the card surface and its border do the lifting, so the shadow
            is dropped there.

            The sheet starts at `sm`. On a phone its border and padding sat
            inside the page's own gutter, two frames that left the text about
            290px of a 390px screen, so there the CV is set straight on the
            page instead. */}
        <article className="mt-8 border-t border-border pt-8 md:mt-10 sm:rounded-md sm:border sm:border-border sm:bg-card sm:px-10 sm:py-10 sm:shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:dark:shadow-none md:px-12 md:py-12">
          <header className="flex items-start justify-between gap-4 sm:gap-6">
            <div className="min-w-0">
              {/* An h2: the page's h1 is "CV" in the header above. */}
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {displayName(cv.name)}
              </h2>
              <Facts line={cv.title} className="mt-1 text-sm text-muted-foreground md:text-base" />
              <div className="mt-3 space-y-1 font-mono text-xs leading-relaxed text-subtle [&_a]:transition-colors [&_a]:duration-fast [&_a]:ease-out hover:[&_a]:text-foreground">
                {cv.contact.map((line) => (
                  <Facts key={line} line={line} />
                ))}
              </div>
            </div>
            <Image
              src="/images/avatar.png"
              alt=""
              width={180}
              height={180}
              sizes="(min-width: 768px) 72px, 56px"
              className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover md:h-[72px] md:w-[72px]"
            />
          </header>

          <div className="[&>h2:first-of-type]:mt-9">
            {cv.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </article>

        {/* A second way to the PDF for whoever read to the end, quieter than
            the button at the top, which is long off screen by now. */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a
            href={PDF}
            download
            className="underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:text-foreground hover:decoration-foreground"
          >
            Download the PDF
          </a>
        </p>
      </Container>
    </main>
  );
}

/**
 * One header line, fact by fact. Each fact is unbreakable, so "+91 96941
 * 74289" or "5+ Years" never splits across two lines on a narrow screen.
 *
 * Every fact carries its separator in front, in a fixed 1rem box, and the row
 * is pulled 1rem left inside a clipping wrapper. Whichever fact starts a line,
 * the first or one that wrapped, has its dot in that clipped strip, so no line
 * ever opens on a stray "·".
 */
function Facts({ line, className }: { line: string; className?: string }) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <p className="-ml-4 flex flex-wrap">
        {headerFacts(line).map((fact) => (
          <span key={fact} className="inline-flex whitespace-nowrap">
            <span aria-hidden className="w-4 shrink-0 text-center text-border-strong">
              ·
            </span>
            <span dangerouslySetInnerHTML={{ __html: inlineHtml(fact) }} />
          </span>
        ))}
      </p>
    </div>
  );
}

function Block({ block }: { block: CvBlock }) {
  switch (block.kind) {
    case "section":
      return (
        // Small caps with a rule running out to the right edge, the classic
        // résumé section head.
        <h2 className="mt-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-label text-subtle after:h-px after:flex-1 after:bg-border">
          {block.text}
        </h2>
      );
    case "role":
      return (
        // Title left, dates right from `sm` up, so the eye can run down the
        // right edge for the timeline. Stacked on a phone.
        <div className="mt-7 sm:flex sm:items-baseline sm:justify-between sm:gap-6">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {block.title}
          </h3>
          <p
            className="mt-1 shrink-0 font-mono text-xs text-subtle sm:mt-0 [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-4"
            dangerouslySetInnerHTML={{ __html: inlineHtml(dotSeparated(block.meta)) }}
          />
        </div>
      );
    case "project":
      return (
        <p
          className="mt-6 text-sm font-semibold tracking-tight text-foreground [&_a]:font-normal [&_a]:text-muted-foreground [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-4"
          dangerouslySetInnerHTML={{
            __html: `${inlineHtml(block.name)} <span>${inlineHtml(block.meta)}</span>`,
          }}
        />
      );
    case "para":
      return (
        <p
          className="mt-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: dotSeparated(block.html) }}
        />
      );
    case "list":
      return (
        <ul className="mt-3 space-y-2">
          {block.items.map((item) => (
            <li
              key={item}
              className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.62em] before:h-1 before:w-1 before:rounded-full before:bg-border-strong [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: inlineHtml(item) }}
            />
          ))}
        </ul>
      );
    case "labelled":
      // No top border on the list. The section heading above already draws
      // one, and the two sat together as a doubled rule under the label.
      return (
        <dl className="mt-3 divide-y divide-border candy:divide-y-0">
          {block.rows.map((row) => (
            <div key={row.label} className="py-2.5 sm:flex sm:gap-5">
              <dt className="shrink-0 text-sm font-semibold text-foreground sm:w-40">
                {row.label}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-0">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      );
    case "stack":
      return (
        <p className="mt-3 font-mono text-xs text-subtle">{block.text}</p>
      );
  }
}
