import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowsInSimple,
  BezierCurve,
  Camera,
  ChartLineUp,
  CheckCircle,
  ClipboardText,
  ClockCounterClockwise,
  Coffee,
  FileZip,
  FrameCorners,
  Globe,
  MagnifyingGlassPlus,
  MinusCircle,
  PaintBrushBroad,
  Palette,
  Stack,
  Check,
  XCircle,
} from "@phosphor-icons/react/ssr";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import Section from "@/components/layout/Section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siGooglechrome } from "simple-icons";
import { faqLd } from "@/lib/seo";
import { releases } from "./releases";

/**
 * Swoopy, the Chrome extension, explained.
 *
 * A product page, not a case study: it is written for someone who has never
 * heard of Swoopy and already knows Chrome's own "Save image as". So the page
 * leads with where that menu fails (overlays, CSS backgrounds, inline SVG,
 * canvas) and with real moments people hit, then the extras.
 *
 * The extension's Support, Terms and Privacy pages are static files under
 * `public/swoopy/`, synced from the extension's own repo, which is why they are
 * plain links here rather than routes.
 *
 * `STORE_URL` is the one switch for launch: while it is null the install
 * button reads "Coming soon"; set it to the Chrome Web Store listing and the
 * same button becomes "Add to Chrome".
 */
const STORE_URL: string | null = "https://chromewebstore.google.com/detail/swoopy/fihbpikmjcanljjgaklpehocecppilea";

const DESCRIPTION =
  "Swoopy is a free Chrome extension that saves the images Chrome won't: Instagram posts, Pinterest pins, CSS backgrounds, SVG icons and charts. Save them as WebP, copy them as PNG or pull their colors as design tokens.";

// The Swoopy poster, cropped to 1200x630 (public/swoopy/poster.webp is the source).
const OG_IMAGE = {
  url: "/swoopy/og.jpg",
  alt: "Swoopy, a shih tzu holding a photo: Swoop any image. Grab its palette.",
};

export const metadata: Metadata = {
  title: "Swoopy: save the images Chrome won't",
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}swoopy` },
  openGraph: {
    title: "Swoopy: save the images Chrome won't",
    description: DESCRIPTION,
    url: `${baseUrl}swoopy`,
    images: [{ url: OG_IMAGE.url, width: 1200, height: 630, alt: OG_IMAGE.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swoopy: save the images Chrome won't",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const comparison = [
  { icon: Camera, when: "An Instagram post", why: "A clear layer sits over the photo.", chrome: "No option", fail: true, swoopy: "Saves the photo" },
  { icon: FrameCorners, when: "A Pinterest pin, shop gallery or hero banner", why: "Shown as a page background.", chrome: "Not an image", fail: true, swoopy: "Saves it" },
  { icon: BezierCurve, when: "An icon or logo", why: "Drawn in code (SVG), with no file.", chrome: "No file", fail: true, swoopy: ".svg, PNG or React" },
  { icon: ChartLineUp, when: "A chart, drawing or editor canvas", why: "Painted on a canvas, not a file.", chrome: "Can't save", fail: true, swoopy: "Saves as PNG" },
  { icon: MagnifyingGlassPlus, when: "A small or blurry preview", why: "Chrome saves the size you see.", chrome: "Small copy", fail: false, swoopy: "Sharpest version" },
  { icon: ArrowsInSimple, when: "A heavy PNG for your website", why: "Usually a trip to a compressor site.", chrome: "Original only", fail: false, swoopy: "Export as WebP" },
  { icon: Stack, when: "Every image on a page", why: "Chrome saves one at a time.", chrome: "One by one", fail: false, swoopy: "All of them, one ZIP" },
  { icon: ClipboardText, when: "Pasting it into Figma, Slack or Docs", why: "Only where Chrome offers Copy image.", chrome: "Sometimes", fail: false, swoopy: "Any image" },
] as const;

const scenarios = [
  {
    tag: "Instagram",
    title: "The 1 a.m. outfit find",
    body: (
      <>
        You&apos;re scrolling and spot the perfect reference. Right-click: no &ldquo;Save image as&rdquo;. With Swoopy it&apos;s{" "}
        <strong className="font-semibold text-foreground">Download</strong>, at full resolution. No screenshot, no cropped status bar.
      </>
    ),
  },
  {
    tag: "Pinterest",
    title: "A moodboard in minutes",
    body: (
      <>
        Planning a room, a brand or a wedding? Pins, shop photos and banners are often backgrounds Chrome won&apos;t save. Swoopy fetches each one in a single right-click.
      </>
    ),
  },
  {
    tag: "Client work",
    title: "“Just use the logo from our site”",
    body: (
      <>
        It&apos;s an inline SVG, so there&apos;s nothing to save. Swoopy hands you the{" "}
        <strong className="font-semibold text-foreground">.svg</strong>, a crisp PNG, or a ready React component.
      </>
    ),
  },
  {
    tag: "Reports",
    title: "That chart, in your doc",
    body: (
      <>
        Dashboards paint charts on a canvas you can&apos;t copy.{" "}
        <strong className="font-semibold text-foreground">Copy Image</strong>, then paste it straight into Google Docs, Slides, Notion or Slack.
      </>
    ),
  },
  {
    tag: "Shopping",
    title: "See the product up close",
    body: (
      <>
        Store thumbnails are tiny. Swoopy grabs the sharpest version the site has, so you can zoom into the stitching before you buy.
      </>
    ),
  },
  {
    tag: "Design",
    title: "“Those colors, but in my app”",
    body: (
      <>
        Love a photo&apos;s palette? Inspect it and copy the colors as{" "}
        <strong className="font-semibold text-foreground">Tailwind, CSS or JSON tokens</strong>, ready to paste into your project.
      </>
    ),
  },
];

const features = [
  {
    icon: ArrowsInSimple,
    title: "Compress and convert, right here",
    body: "No more uploading images to a compressor website. Choose to download the original, or export it as WebP, PNG or JPEG at the quality you pick, with each file's size shown first. A 2.5 MB PNG can go out as a 296 KB WebP. You can also right-click Download as WebP, or point and press Alt+Shift+W.",
    image: "/swoopy/screens/convert-panel.webp",
    alt: "Swoopy's Save as options: a 2.5 MB PNG shown as a 296 KB WebP, 89% smaller, with a quality slider",
  },
  {
    icon: Globe,
    title: "Read any site's design",
    body: "Open the Site tab on any page to see its brand colors, fonts and logos, its spacing and icons, and how its link looks when shared on X, LinkedIn, Slack or WhatsApp. Copy it all as design tokens.",
    image: "/swoopy/screens/site-brand-panel.webp",
    alt: "Swoopy's Site tab showing a page's brand colors with their roles and its fonts",
  },
  {
    icon: FileZip,
    title: "A whole page of images, in one go",
    body: "See every image on the page in one grid, filter out the tiny icons, pick what you want and download it as a single ZIP.",
    image: "/swoopy/screens/site-images-panel.webp",
    alt: "Swoopy's Site tab listing every image on a page, ready to select and download",
  },
  {
    icon: Palette,
    title: "Every image is a color palette",
    body: "See which colors make an image work, how much of each, and which text reads on top. Export them to CSS, JSON, Tailwind or SCSS in one click.",
    image: "/swoopy/screens/palette-panel.webp",
    alt: "Swoopy's Inspect tab showing a photo's palette, token export and copy as code",
  },
  {
    icon: PaintBrushBroad,
    title: "Make any icon yours",
    body: "Recolor an SVG to your brand in seconds, try a palette, tweak the code, then export SVG, PNG, React or React Native.",
    image: "/swoopy/screens/svg-editor-panel.webp",
    alt: "Swoopy's SVG editor recoloring a badge with the Sunset palette",
  },
  {
    icon: ClockCounterClockwise,
    title: "Never lose a find",
    body: "Your last 100 images and videos, grouped by day and one click from downloading again. Kept only on your device.",
    image: "/swoopy/screens/history-panel.webp",
    alt: "Swoopy's History tab, a gallery of saved images grouped by day",
  },
];

const included = [
  "Saves images under overlays",
  "Compress without other sites",
  "WebP, PNG, JPEG + quality",
  "Whole page as one ZIP",
  "Any site's colors and fonts",
  "Tokens for CSS and Tailwind",
  "SVG editor, React export",
  "Real GIFs and videos",
  "Copy any image as PNG",
  "Private history on device",
];

const faqs = [
  { q: "Does it save GIFs as real GIFs?", a: "Yes. On sites like Giphy and Tenor, Swoopy saves the actual animated .gif, not the still or WebP preview the page shows. Where a site plays a GIF as a short video, like X or Reddit, Download saves that original video file." },
  { q: "Can it save images as WebP?", a: "Yes. Right-click and choose Swoopy ▸ Download as WebP, or point at an image and press Alt+Shift+W. Animated GIFs, SVGs and images that are already smaller are saved as they are. In the side panel you can also save as PNG or JPEG and see each file size before you save." },
  { q: "Can it download videos?", a: "Yes, when the video is a file. Right-click it and choose Download Video, Copy Video Address or Open Video in New Tab. Streaming players like YouTube don't play a single file, so there Swoopy saves the cover image and tells you." },
  { q: "Is it allowed to save images like this?", a: "Swoopy only saves what is already loaded on your screen, much like a screenshot but sharper. What you do with an image is up to you: respect the creator's rights and each site's rules. The Terms of Service has the details." },
  { q: "Does it send my data anywhere?", a: "No. Everything runs in your browser. There is no account, no analytics and no tracking, and your history never leaves your device." },
  { q: "Why does Chrome say it can \"read and change data\" on websites?", a: "Chrome shows that warning for any extension that works on every site. Swoopy uses it only to look at the spot you right-click and find the image there, and, only when you open its Site tab, to read that page's images, colors, fonts and tags. It never changes the page." },
  { q: "Which browsers does it work in?", a: "Chrome, and other browsers that install from the Chrome Web Store, such as Brave, Arc and Edge." },
  { q: "Is it really free?", a: "Yes, every feature, for everyone. If Swoopy saves your day, you can buy me a coffee, but it unlocks nothing extra." },
];

const swoopyLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Swoopy",
  description: DESCRIPTION,
  applicationCategory: "BrowserApplication",
  operatingSystem: "Chrome",
  url: `${baseUrl}swoopy`,
  installUrl: STORE_URL ?? undefined,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const linkClass = "text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:decoration-foreground";

function InstallButton({ compact = false }: { compact?: boolean }) {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground";
  if (!STORE_URL) {
    return (
      <span className={`${base} cursor-default`} aria-disabled="true">
        {compact ? "Coming soon to Chrome" : "Coming soon to the Chrome Web Store"}
      </span>
    );
  }
  return (
    <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className={`${base} transition-colors duration-fast ease-out hover:bg-accent-hover`}>
      Add to Chrome
      <ArrowUpRight size={16} weight="bold" aria-hidden />
    </a>
  );
}

function ChromeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={siGooglechrome.path} />
    </svg>
  );
}

/**
 * Chrome vs Swoopy, laid out like a plan comparison: a header per product, the
 * Swoopy column tinted end to end, one icon per situation and filled
 * check / cross marks. From md up it is three columns; on phones each row
 * becomes a small card with the two answers side by side.
 */
function ComparisonTable() {
  const cols = "md:grid md:grid-cols-[1fr_9rem_12rem]";
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className={`hidden ${cols} border-b border-border`}>
        <div className="px-4 py-2.5">
          <Label>When you right-click</Label>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5">
          <ChromeMark className="size-3.5 text-subtle" />
          <Label>Chrome</Label>
        </div>
        <div className="flex items-center gap-2 bg-muted px-4 py-2.5">
          <Image src="/swoopy/icons/swoopy.svg" alt="" width={16} height={16} />
          <Label className="text-foreground">Swoopy</Label>
        </div>
      </div>
      {comparison.map((row) => (
        <div key={row.when} className={`border-t border-border [&:nth-child(2)]:border-t-0 ${cols}`}>
          <div className="flex min-w-0 gap-3 px-4 py-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
              <row.icon size={16} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground md:truncate">{row.when}</p>
              <p className="mt-0.5 text-sm text-muted-foreground md:truncate">{row.why}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-border bg-border md:contents">
            <div className="flex flex-col items-start gap-1.5 bg-card px-4 py-3 md:flex-row md:items-start md:py-4">
              <span className="md:hidden"><Label>Chrome</Label></span>
              <span className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
                {row.fail ? (
                  <XCircle size={18} weight="fill" className="shrink-0 text-subtle opacity-60" aria-label="No:" />
                ) : (
                  <MinusCircle size={18} weight="fill" className="shrink-0 text-subtle opacity-60" aria-hidden />
                )}
                {row.chrome}
              </span>
            </div>
            <div className="flex flex-col items-start gap-1.5 bg-muted px-4 py-3 md:flex-row md:items-start md:py-4">
              <span className="md:hidden"><Label>Swoopy</Label></span>
              <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-foreground">
                <CheckCircle size={18} weight="fill" className="shrink-0 text-foreground" aria-hidden />
                {row.swoopy}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SwoopyPage() {
  return (
    <main className="pt-8 pb-8 md:pt-12 md:pb-12">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify([swoopyLd, faqLd(faqs)]) }}
      />

      {/* Hero */}
      <Container width="reading" className="text-center">
        <Image
          src="/swoopy/icons/swoopy.svg"
          alt="Swoopy, a shih tzu holding a photo in its mouth"
          width={88}
          height={88}
          priority
          className="mx-auto mb-5 rounded-2xl border border-border bg-card p-2"
        />
        <Label>Free Chrome extension</Label>
        <h1 className="mt-3 text-3xl font-semibold tracking-tighter text-foreground md:text-4xl">
          Swoopy fetches the images Chrome won&apos;t.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          That Instagram post. That Pinterest pin. That logo hiding in the code. If it&apos;s on your screen, right-click and Swoopy saves it, lets you export a lighter WebP, or breaks it down into colors you can use.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <InstallButton />
          <a
            href="#moments"
            className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2 text-sm text-foreground transition-colors duration-fast ease-out hover:bg-muted"
          >
            See it in action
            <ArrowDown size={16} aria-hidden />
          </a>
        </div>
        <Image
          src="/swoopy/screens/right-click-menu.webp"
          alt="Right-clicking a photo shows Swoopy's menu: Download, Download as WebP, Copy Image, Copy Image Address, Open Image in New Tab and Inspect Colors and Details, with the side panel open"
          width={1280}
          height={800}
          priority
          sizes="(min-width: 768px) 712px, 100vw"
          className="mt-10 rounded-lg border border-border"
        />
      </Container>

      {/* Why Swoopy */}
      <Section label="Why Swoopy" title={"\u201cSave image as\u201d only works on plain images"}>
        <p className="-mt-4 mb-6 text-muted-foreground">
          Chrome&apos;s menu only appears when you right-click a simple image file. Most images on modern sites aren&apos;t that simple.
        </p>
        <ComparisonTable />
      </Section>

      {/* Real moments */}
      <Section id="moments" label="Real life, real saves" title="Moments where Swoopy just works">
        <p className="-mt-4 mb-6 text-muted-foreground">
          Six times you&apos;d normally give up, take a blurry screenshot, or go digging in developer tools.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {scenarios.map((s) => (
            <div key={s.title} className="rounded-lg border border-border bg-card p-5">
              <span className="inline-block rounded-sm border border-border px-2 py-0.5 font-mono text-2xs uppercase tracking-label text-subtle">
                {s.tag}
              </span>
              <h3 className="mt-3 text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 border-l-2 border-border-strong pl-3 text-sm text-muted-foreground">
          Swoopy saves what&apos;s already on your screen. You&apos;re responsible for how you use it: respect creators&apos; rights and each site&apos;s rules (
          <a href="/swoopy/terms.html" className={linkClass}>Terms</a>). Swoopy isn&apos;t affiliated with Instagram, Pinterest or Google.
        </p>
      </Section>

      {/* Extras */}
      <Section label="What else it does" title="A full image toolkit, one right-click away">
        <div className="space-y-12">
          {features.map((f, i) => (
            <div key={f.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <f.icon size={24} className="text-foreground" aria-hidden />
                <h3 className="mt-3 text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.body}</p>
              </div>
              <div className="flex justify-center rounded-lg border border-border bg-muted px-6 pt-6">
                <Image
                  src={f.image}
                  alt={f.alt}
                  width={380}
                  height={600}
                  sizes="(min-width: 768px) 260px, 70vw"
                  className="h-auto w-full max-w-64 rounded-t-md border border-b-0 border-border"
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* What's new */}
      <Section
        label="What's new"
        title={`Version ${releases[0].version}`}
        action={<Link href="/swoopy/changelog" className={`text-sm ${linkClass}`}>Version history</Link>}
      >
        <p className="-mt-4 mb-4 text-muted-foreground">{releases[0].summary}</p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground marker:text-subtle">
          {releases[0].groups[0].items.slice(0, 5).map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
        <Link href={`/swoopy/changelog#v${releases[0].version}`} className={`mt-4 inline-block text-sm ${linkClass}`}>
          Everything in {releases[0].version}
        </Link>
      </Section>

      {/* Free, like a paid plan */}
      <Section label="Pricing" title="Built like a paid app. Free for everyone.">
        <div className="overflow-hidden rounded-lg border border-border bg-card md:grid md:grid-cols-[16rem_1fr]">
          <div className="border-b border-border bg-muted p-6 md:border-b-0 md:border-r">
            <div className="flex items-center gap-2">
              <Image src="/swoopy/icons/swoopy.svg" alt="" width={20} height={20} />
              <Label className="text-foreground">Swoopy</Label>
            </div>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tighter text-foreground">$0</span>
              <span className="text-sm text-muted-foreground">everything included</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">No account, no tracking, nothing uploaded. It all runs in your browser.</p>
            <div className="mt-5 flex flex-col gap-2">
              <InstallButton compact />
              <a
                href="/swoopy/support.html"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border-strong px-5 py-2 text-sm text-foreground transition-colors duration-fast ease-out hover:bg-card"
              >
                <Coffee size={16} aria-hidden />
                Buy me a coffee
              </a>
            </div>
          </div>
          <ul className="grid content-center gap-x-6 gap-y-3 p-6 sm:grid-cols-2">
            {included.map((item) => (
              <li key={item} className="flex items-center gap-2 whitespace-nowrap text-sm text-foreground">
                <Check size={16} weight="bold" className="shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* FAQ */}
      <Section label="FAQ" title="Questions, answered">
        <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-1">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`} className="border-0">
              <AccordionTrigger className="py-3 text-left text-base font-medium text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-base leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-10 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <a href="/swoopy/support.html" className={linkClass}>Support</a>
          <a href="/swoopy/terms.html" className={linkClass}>Terms of Service</a>
          <a href="/swoopy/privacy.html" className={linkClass}>Privacy Policy</a>
          <Link href="/swoopy/changelog" className={linkClass}>Version history</Link>
        </p>
      </Section>
    </main>
  );
}
