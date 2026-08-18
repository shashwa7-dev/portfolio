import fs from "fs";
import path from "path";
import Image from "next/image";
import { Download, Scissors } from "lucide-react";
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
 * cannot follow a cut shape, and the sheet is cut in three places: the wave
 * along the top, the wave along the bottom, and the two notches bitten out of
 * the edges at the tear line.
 *
 * The shadow is a `drop-shadow` filter on a wrapper. `box-shadow` is painted
 * from the element's box, so it would trace a rectangle around a sheet that is
 * no longer rectangular; `drop-shadow` follows the masked silhouette.
 */
const WAVE = 10; // wave band height; the sheet's vertical padding must clear it
const NOTCH = 22; // notch diameter, bitten out of both edges at the tear line
const R = NOTCH / 2;

/**
 * The stub's height, and the three mask offsets derived from it.
 *
 * In `rem`, not pixels, and that is the whole point. The stub is a fixed
 * height holding text that the reader can scale, so at 200% text-only zoom a
 * pixel height kept the strip at 64px while the label inside it grew, wrapped
 * to two lines and painted out through the bottom of the sheet. In `rem` the
 * strip grows with the text it holds.
 *
 * The mask has to grow with it or the notches would part company with the
 * perforation, so every offset below is derived from the same value rather
 * than written out. With WAVE 10 and R 11:
 *   tear line          PERF      = FOOT + 10
 *   notch row, bottom  PERF - R  = FOOT - 1
 *   stub band height   PERF-R-10 = FOOT - 11
 *   body band height   100% - (10 + PERF + R) = 100% - FOOT - 31
 */
const FOOT = "4rem"; // 64px at a default root, the same as it ever was

/**
 * The perforation, painted rather than bordered.
 *
 * `border-style: dashed` hands the dash length to the browser, which picks
 * something short and tight that reads as a hairline rule. A repeating
 * gradient is the only way to say how long a dash is and how much air sits
 * between two of them.
 *
 * Sized to a single pixel row and not repeated down, so it paints one line and
 * nothing else. That matters here: the stub sits above the grain layer, so a
 * background that covered the strip would blank the texture across it.
 */
const DASH = 8;
const GAP = 8;
const PERFORATION = `repeating-linear-gradient(to right, hsl(var(--border-strong)) 0 ${DASH}px, transparent ${DASH}px ${DASH + GAP}px)`;
const NOTCH_Y = `calc(${FOOT} - ${R - WAVE}px)`;
const STUB_H = `calc(${FOOT} - ${R}px)`;
const BODY_H = `calc(100% - ${FOOT} - ${WAVE * 2 + R}px)`;

const svg = (viewBox: string, d: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}' preserveAspectRatio='none'%3E%3Cpath d='${d}' fill='%23000'/%3E%3C/svg%3E")`;

const SOLID = "linear-gradient(#000, #000)";
const WAVEBOX = "0 0 40 12";
const NOTCHBOX = `0 0 ${NOTCH} ${NOTCH}`;

/**
 * Seven layers, because mask layers union rather than subtract.
 *
 * There is no "cut a hole" here: every layer adds to the visible area, so a
 * notch cannot be punched through the solid interior after the fact. Chromium
 * and Safari spell `mask-composite` differently enough that subtracting is not
 * worth relying on. Instead the interior is split into bands that stop short
 * of the notches, and the notch row is assembled from three pieces: a shaped
 * end at each edge and a plain fill between them.
 *
 * Everything below the tear line is measured up from the sheet's bottom edge
 * off the same FOOT the stub itself is sized by, which is what keeps the
 * notches on the perforation at any text size. Only the band above the tear
 * line flexes with the content.
 */
const layers = [
  // The wave along the top, and the same wave mirrored along the bottom.
  { image: svg(WAVEBOX, "M0 6 Q10 0 20 6 T40 6 L40 12 L0 12 Z"), size: `40px ${WAVE}px`, position: "top left", repeat: "repeat-x" },
  { image: svg(WAVEBOX, "M0 6 Q10 12 20 6 T40 6 L40 0 L0 0 Z"), size: `40px ${WAVE}px`, position: "bottom left", repeat: "repeat-x" },
  // The body, from under the top wave down to the top of the notch row.
  { image: SOLID, size: `100% ${BODY_H}`, position: `left 0px top ${WAVE}px`, repeat: "no-repeat" },
  // The notch row: a square with a semicircle carved out of its outer edge at
  // each end, and plain fill spanning between them. The sweep flag is what
  // carves it. It picks the side of the chord the arc bows to, and bowing the
  // wrong way puts the bite outside the box, where mask-size clips it away and
  // the edge comes out straight.
  { image: svg(NOTCHBOX, `M0 0 H${NOTCH} V${NOTCH} H0 A${R} ${R} 0 0 0 0 0 Z`), size: `${NOTCH}px ${NOTCH}px`, position: `left 0px bottom ${NOTCH_Y}`, repeat: "no-repeat" },
  { image: svg(NOTCHBOX, `M${NOTCH} 0 H0 V${NOTCH} H${NOTCH} A${R} ${R} 0 0 1 ${NOTCH} 0 Z`), size: `${NOTCH}px ${NOTCH}px`, position: `right 0px bottom ${NOTCH_Y}`, repeat: "no-repeat" },
  { image: SOLID, size: `calc(100% - ${NOTCH * 2}px) ${NOTCH}px`, position: `left ${NOTCH}px bottom ${NOTCH_Y}`, repeat: "no-repeat" },
  // The stub, from under the notch row down to the bottom wave.
  { image: SOLID, size: `100% ${STUB_H}`, position: `left 0px bottom ${WAVE}px`, repeat: "no-repeat" },
];

const join = (key: keyof (typeof layers)[number]) =>
  layers.map((l) => l[key]).join(", ");

const sheetMask = {
  WebkitMaskImage: join("image"),
  maskImage: join("image"),
  WebkitMaskSize: join("size"),
  maskSize: join("size"),
  WebkitMaskPosition: join("position"),
  maskPosition: join("position"),
  WebkitMaskRepeat: join("repeat"),
  maskRepeat: join("repeat"),
  // Set here rather than as a class because the mask decides it: the stub is
  // positioned from the bottom edge, so the sheet's own bottom padding has to
  // be exactly the wave band and nothing more.
  paddingBottom: WAVE,
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
        {/* The page action sits outside the sheet, where it reads as something
            the site offers rather than as document content. The sheet carries
            the same action again at the bottom, on the stub: by the time you
            have read to the end, this one is long off screen. */}
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
            cannot keep. A tight, comparatively dark one is the contact: the
            line where paper meets desk, and the layer that makes the whole
            thing read as a shadow rather than as a grey glow. A long, soft one
            is the cast that lifts it.

            The contact and the cast are what changed. They used to be 1px/1px
            at 0.05 and 8px/16px at 0.10, which is a card's shadow, and this is
            not a card: it is a sheet several thousand pixels tall, so a cast
            that travels eight pixels is lost against it and reads as haze at
            the edges. The contact now carries roughly twice the alpha over
            twice the blur so the seat is visible, and the cast drops sixteen
            pixels over twenty-eight so there is somewhere for the paper to
            float above.

            Ordered tightest to widest on purpose. Chained `drop-shadow`
            filters each take the previous one's output as their source, so the
            wide layer is cast by the sheet plus a one-pixel fringe, which is
            near enough the sheet. Reversed, the tight layer would be cast by
            the sheet plus a 28px halo and would smear a second soft ramp over
            the contact line.

            The light theme needs all of it: the sheet is 100% lightness on a
            98.5% page, so a point and a half separates them and only the
            shadow reads as an edge. Dark already has 8.5% against 5% doing
            that work, so it takes the same shape at a shorter throw. */}
        <div className="mt-4 [filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.13))_drop-shadow(0_2px_4px_rgb(0_0_0/0.09))_drop-shadow(0_16px_28px_rgb(0_0_0/0.12))] dark:[filter:drop-shadow(0_0_0.5px_rgb(0_0_0/0.55))_drop-shadow(0_2px_4px_rgb(0_0_0/0.5))_drop-shadow(0_14px_24px_rgb(0_0_0/0.55))]">
        <article
          style={sheetMask}
          className="relative bg-card px-6 pt-11 sm:px-9 sm:pt-12 md:px-12"
        >
          {/* Paper grain, as a layer rather than a background on the sheet
              itself, so its strength can be tuned per theme without touching
              the card colour.

              `multiply` in light: the texture is flat grey with the grain
              carried in its alpha, so multiplying it into white leaves the
              tooth and none of the grey. `soft-light` in dark, because
              multiplying into a near-black card would only make it blacker and
              the grain would vanish.

              The light opacity is low, and it has to be. The texture is grey
              203 and its alpha never drops below 84, so there is no clear pixel
              anywhere on it: whatever opacity this layer carries darkens the
              whole sheet, not just the grain. At 0.3 the mean landed near 245,
              which is darker than the 252 page behind it, so the paper read as
              a grey panel rather than as a white sheet and the ink on it lost
              its snap. 0.08 puts the mean back at 252, level with the page and
              free to be lifted off it by the shadow, and still leaves about
              three levels between the texture's lightest and darkest points.
              That is little in the abstract and plenty across a sheet this
              wide, which is the only place it is ever seen.

              It sits inside the masked element, so the wave clips it too and
              the texture stops exactly where the paper does. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply dark:opacity-[0.22] dark:mix-blend-soft-light"
            style={{
              backgroundImage: "url(/cv/paper-texture.webp)",
              backgroundSize: "250px 250px",
            }}
          />
          {/* A row at every width. Stacked on mobile it put the portrait below the
              contact block, which is the one place a portrait should never be:
              it reads as a stray image rather than as part of the header. It
              shrinks instead. */}
          <div className="relative flex items-start justify-between gap-4 sm:gap-5">
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
          <div className="relative [&>h2:first-of-type]:mt-8">
            {cv.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>

          {/* The tear-off stub.
              Full bleed, so it negates the sheet's horizontal padding: a
              perforation that stopped short of the edges would read as a rule
              under the text rather than as a line the paper tears along.
              The perforation and the notches meet because both are sized off
              FOOT: this height, and the mask offsets derived from it. That is
              also why the height is set here rather than as a class, so the
              one value feeds both.

              The whole stub is the link, rather than a small link centred in
              it. The strip below a perforation is one thing you tear, so
              anything less than all of it is a smaller target than it looks.
              An anchor rather than a click handler on the div: it is the same
              one element, and keyboard, middle click and open-in-new-tab come
              with it instead of being reimplemented.

              No hover fill, deliberately. The stub paints above the grain
              layer, so a background would blank the texture across the strip
              on hover and the paper would look like it had a hole in it.

              Typeset as a section heading rather than as a button. Inside the
              sheet the accent CTA from the top would read as a control dropped
              onto the paper.

              The scissors snip once on hover. Once, not on a loop: the icon
              is 14px of decoration next to the thing you actually came for,
              and anything that keeps moving under the cursor competes with
              the label instead of pointing at it. */}
          <a
            href={PDF}
            download
            className="group relative -mx-6 mt-11 flex items-center justify-center gap-2 font-mono text-2xs uppercase tracking-label text-subtle transition-colors duration-fast ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:-mx-9 md:-mx-12"
            style={{
              height: FOOT,
              backgroundImage: PERFORATION,
              backgroundSize: "100% 1px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "top left",
            }}
          >
            <Scissors aria-hidden className="h-3.5 w-3.5 group-hover:animate-snip" />
            Tear off a copy (PDF)
          </a>
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
