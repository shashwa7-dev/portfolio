import fs from "fs";
import path from "path";
import Image from "next/image";
import { Download } from "lucide-react";
import Container from "@/components/layout/Container";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, breadcrumbLd } from "@/lib/seo";
import { parseCv, inlineHtml, type CvBlock } from "@/lib/cv";

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

  return (
    <main className="py-8 md:py-12">
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {cv.name}
            </h1>
            <p className="mt-1 text-base text-muted-foreground">{cv.title}</p>
            <div className="mt-3 space-y-0.5 font-mono text-2xs text-muted-foreground [&_a]:transition-colors [&_a]:duration-fast [&_a]:ease-out hover:[&_a]:text-foreground">
              {cv.contact.map((line) => (
                <p
                  key={line}
                  dangerouslySetInnerHTML={{ __html: inlineHtml(line) }}
                />
              ))}
            </div>
          </div>

          <Image
            src="/images/avatar.png"
            alt=""
            width={180}
            height={180}
            sizes="72px"
            className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover sm:h-[72px] sm:w-[72px]"
          />
        </div>

        {/* The download is the point of the page for half its visitors, so it
            sits above the CV rather than at the foot of it. `download` rather
            than a plain link, or the browser opens its own PDF viewer and the
            file never reaches disk. */}
        <a
          href={PDF}
          download
          className="group mt-7 inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-foreground transition-colors duration-fast ease-out hover:bg-elevated"
        >
          <Download aria-hidden className="h-4 w-4 text-subtle" />
          Download PDF
        </a>

        <div className="mt-10">
          {cv.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      </Container>
    </main>
  );
}

function Block({ block }: { block: CvBlock }) {
  switch (block.kind) {
    case "section":
      return (
        <h2 className="mt-10 border-b border-border pb-2 font-mono text-2xs uppercase tracking-label text-subtle">
          {block.text}
        </h2>
      );
    case "role":
      return (
        <div className="mt-7">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {block.title}
          </h3>
          <p
            className="mt-1 font-mono text-2xs text-subtle [&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-4"
            dangerouslySetInnerHTML={{ __html: inlineHtml(block.meta) }}
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
          dangerouslySetInnerHTML={{ __html: block.html }}
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
      return (
        <dl className="mt-3 divide-y divide-border border-y border-border">
          {block.rows.map((row) => (
            <div key={row.label} className="py-2.5 sm:flex sm:gap-5">
              <dt className="shrink-0 font-mono text-2xs uppercase tracking-label text-foreground sm:w-48 sm:pt-px">
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
        <p className="mt-3 font-mono text-2xs text-subtle">{block.text}</p>
      );
  }
}
