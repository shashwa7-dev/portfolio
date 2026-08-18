import fs from "fs";
import path from "path";
import Image from "next/image";
import { Download } from "lucide-react";
import Container from "@/components/layout/Container";
import { baseUrl } from "@/app/sitemap";
import { ogUrl, breadcrumbLd } from "@/lib/seo";
import { parseCv, inlineHtml, type CvBlock } from "@/lib/cv";

const PDF = "/shashwat-tripathi-cv.pdf";

/**
 * The wave along the top and bottom of the sheet.
 *
 * An SVG path rather than repeated radial-gradients. Scallops made of half
 * circles meet at a cusp on every repeat, and a row of cusps reads as spiky
 * rather than as a wave. `Q` followed by `T` reflects the control point, so
 * each crest flows into the next trough with a continuous tangent and no join
 * is visible.
 *
 * A mask rather than a border, because a border traces the element's box and
 * cannot follow a cut shape. Three layers: the wave along the top, the same
 * mirrored along the bottom, and a solid band filling everything between.
 *
 * The shadow is a `drop-shadow` filter on a wrapper. `box-shadow` is painted
 * from the element's box, so it would trace a rectangle around a sheet that is
 * no longer rectangular; `drop-shadow` follows the masked silhouette.
 */
const WAVE = 10; // wave band height in px; vertical padding must clear it
const svg = (d: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 12' preserveAspectRatio='none'%3E%3Cpath d='${d}' fill='%23000'/%3E%3C/svg%3E")`;

const maskLayers = [
  svg("M0 6 Q10 0 20 6 T40 6 L40 12 L0 12 Z"), // crests along the top
  svg("M0 6 Q10 12 20 6 T40 6 L40 0 L0 0 Z"), // mirrored along the bottom
  "linear-gradient(#000, #000)",
].join(", ");

const sheetMask = {
  WebkitMaskImage: maskLayers,
  maskImage: maskLayers,
  WebkitMaskSize: `40px ${WAVE}px, 40px ${WAVE}px, 100% calc(100% - ${WAVE * 2}px)`,
  maskSize: `40px ${WAVE}px, 40px ${WAVE}px, 100% calc(100% - ${WAVE * 2}px)`,
  WebkitMaskPosition: "top left, bottom left, center",
  maskPosition: "top left, bottom left, center",
  WebkitMaskRepeat: "repeat-x, repeat-x, no-repeat",
  maskRepeat: "repeat-x, repeat-x, no-repeat",
} as const;

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
        {/* The page action sits outside the sheet. Inside it, a download button
            would read as part of the document rather than as something the site
            offers you. */}
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-2xs uppercase tracking-label text-subtle">
            Curriculum vitae
          </p>
          <a
            href={PDF}
            download
            /* The site's primary CTA, matching the hero on the homepage:
               filled accent, same radius, weight, padding and press. This is
               the one action the page exists for, so it takes the primary
               treatment rather than the outlined secondary one. */
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-[color,background-color,transform] duration-150 ease-out hover:bg-accent-hover active:scale-[0.97]"
          >
            <Download aria-hidden className="h-4 w-4" />
            Download PDF
          </a>
        </div>

        {/* The sheet. `bg-card` rather than a literal white, so the page reads
            as paper in light mode and as a raised surface in dark rather than
            glowing off a near-black background. The shadow is split by theme
            for the same reason: the same alpha that lifts a white card off
            cream is invisible against near-black. */}
        {/* Three drop-shadows, each doing a different job. A half-pixel one
            traces the silhouette, standing in for the hairline border a mask
            cannot keep. A tight one seats the sheet. A wide, soft one lifts it.

            The light theme needs all of it: the sheet is 100% lightness on a
            98.5% page, so a point and a half separates them and only the
            shadow reads as an edge. Dark already has 8.5% against 5% doing
            that work, so it takes a shorter, deeper cast instead. */}
        <div className="mt-4 [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.14))_drop-shadow(0_1px_1px_rgb(0_0_0/0.05))_drop-shadow(0_8px_16px_rgb(0_0_0/0.10))] dark:[filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.5))_drop-shadow(0_2px_3px_rgb(0_0_0/0.45))_drop-shadow(0_10px_20px_rgb(0_0_0/0.5))]">
        <article
          style={sheetMask}
          className="bg-card px-6 py-11 sm:px-9 sm:py-12 md:px-12"
        >
          {/* A row at every width. Stacked on mobile it put the portrait below the
              contact block, which is the one place a portrait should never be:
              it reads as a stray image rather than as part of the header. It
              shrinks instead. */}
          <div className="flex items-start justify-between gap-4 sm:gap-5">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {cv.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{cv.title}</p>
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
              sizes="(min-width: 768px) 72px, 64px"
              className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]"
            />
          </div>

          {/* The first section heading opens the body, so it takes the block
              step rather than the section step it would otherwise inherit. */}
          <div className="[&>h2:first-of-type]:mt-8">
            {cv.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </article>
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
      // No top border on the list. The section heading above already draws
      // one, and the two sat together as a doubled rule under the label.
      return (
        <dl className="mt-3 divide-y divide-border border-b border-border">
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
