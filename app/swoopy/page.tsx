import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ClockCounterClockwise,
  Coffee,
  PaintBrushBroad,
  Palette,
  X,
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
import { faqLd, ogUrl } from "@/lib/seo";

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
const STORE_URL: string | null = null;

const DESCRIPTION =
  "Swoopy is a free Chrome extension that saves the images Chrome won't: Instagram posts, Pinterest pins, CSS backgrounds, SVG icons and charts. Copy them as PNG or pull their colors as design tokens.";

export const metadata: Metadata = {
  title: "Swoopy: save the images Chrome won't",
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}swoopy` },
  openGraph: {
    title: "Swoopy: save the images Chrome won't",
    description: DESCRIPTION,
    url: `${baseUrl}swoopy`,
    images: [
      {
        url: ogUrl({
          title: "Swoopy",
          subtitle: "Save the images Chrome won't. A free Chrome extension.",
          type: "generic",
          label: "Chrome extension",
          meta: "Free",
        }),
      },
    ],
  },
};

const comparison = [
  { when: "An Instagram post", why: "A clear layer sits over the photo, so there's no \"Save image as\".", chrome: false, swoopy: "Saves the photo" },
  { when: "A Pinterest pin, shop gallery or hero banner", why: "Shown as a page background, which Chrome doesn't treat as an image.", chrome: false, swoopy: "Saves it" },
  { when: "An icon or logo", why: "Drawn in code (SVG), with nothing to save.", chrome: false, swoopy: ".svg, PNG or React" },
  { when: "A chart, drawing or editor canvas", why: "Painted on a canvas, not an image file.", chrome: false, swoopy: "Saves as PNG" },
  { when: "A small or blurry preview", why: "Chrome saves the size you see.", chrome: "Small copy", swoopy: "Sharpest version" },
  { when: "Pasting it into Figma, Slack or Docs", why: "Only where Chrome offers \"Copy image\".", chrome: "Sometimes", swoopy: "Any image" },
] as const;

const scenarios = [
  {
    tag: "Instagram",
    title: "The 1 a.m. outfit find",
    body: (
      <>
        You&apos;re scrolling and spot the perfect reference. Right-click: no &ldquo;Save image as&rdquo;. With Swoopy it&apos;s{" "}
        <strong className="font-semibold text-foreground">Download Image</strong>, at full resolution. No screenshot, no cropped status bar.
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
    icon: Palette,
    title: "Every image is a color palette",
    body: "See which colors make an image work, how much of each, and which text reads on top. Export them to CSS, JSON, Tailwind or SCSS in one click.",
    image: "/swoopy/screens/palette.webp",
    alt: "Swoopy's side panel showing a photo's palette, color roles, size and file details",
  },
  {
    icon: PaintBrushBroad,
    title: "Make any icon yours",
    body: "Recolor an SVG to your brand in seconds, try a palette, tweak the code, then export SVG, PNG, React or React Native.",
    image: "/swoopy/screens/svg-editor.webp",
    alt: "Swoopy's SVG editor recoloring a logo with the Ocean palette",
  },
  {
    icon: ClockCounterClockwise,
    title: "Never lose a find",
    body: "Your last 100 images, grouped by day and one click from downloading again. Kept only on your device.",
    image: "/swoopy/screens/history.webp",
    alt: "Swoopy's History tab, a gallery of saved images grouped by day",
  },
];

const faqs = [
  { q: "Can it download videos?", a: "Not yet. Swoopy handles anything image-like: photos, backgrounds, SVGs, canvases, video thumbnails and lazy-loaded images." },
  { q: "Is it allowed to save images like this?", a: "Swoopy only saves what is already loaded on your screen, much like a screenshot but sharper. What you do with an image is up to you: respect the creator's rights and each site's rules. The Terms of Service has the details." },
  { q: "Does it send my data anywhere?", a: "No. Everything runs in your browser. There is no account, no analytics and no tracking, and your history never leaves your device." },
  { q: "Why does Chrome say it can \"read and change data\" on websites?", a: "Chrome shows that warning for any extension that works on every site. Swoopy uses it only to look at the spot you right-click and find the image there." },
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
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const linkClass = "text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast ease-out hover:decoration-foreground";

function InstallButton() {
  const base = "inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground";
  if (!STORE_URL) {
    return (
      <span className={`${base} cursor-default`} aria-disabled="true">
        Coming soon to the Chrome Web Store
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
          That Instagram post. That Pinterest pin. That logo hiding in the code. If it&apos;s on your screen, right-click and Swoopy brings it back: saved, copied, or broken down into colors you can use.
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
          alt="Right-clicking a photo shows Swoopy's menu: Download Image, Copy Image and Inspect Colors and Details, with the side panel open"
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
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Three columns from md up; on phones each row stacks, with the verdicts on one line below. */}
          <div className="hidden grid-cols-[1fr_auto_auto] gap-x-8 border-b border-border bg-muted px-4 py-2 md:grid">
            <Label>When you right-click</Label>
            <Label className="w-20 text-center">Chrome</Label>
            <Label className="w-36 text-center">Swoopy</Label>
          </div>
          {comparison.map((row) => (
            <div key={row.when} className="border-b border-border px-4 py-3 last:border-b-0 md:grid md:grid-cols-[1fr_auto_auto] md:items-start md:gap-x-8">
              <div>
                <p className="text-sm font-medium text-foreground">{row.when}</p>
                <p className="text-sm text-muted-foreground">{row.why}</p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-subtle md:mt-0 md:w-20 md:justify-center md:pt-0.5">
                <Label className="md:hidden">Chrome</Label>
                {row.chrome === false ? <X size={18} aria-label="No" /> : row.chrome}
              </div>
              <div className="mt-1 flex items-start gap-2 text-sm font-medium text-foreground md:mt-0 md:w-36 md:justify-center md:gap-1.5 md:pt-0.5 md:text-center">
                <Label className="md:hidden">Swoopy</Label>
                <Check size={18} weight="bold" className="mt-0.5 shrink-0" aria-hidden />
                <span>{row.swoopy}</span>
              </div>
            </div>
          ))}
        </div>
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
      <Section label="What else it does" title="And it's more than a download button">
        <div className="space-y-12">
          {features.map((f, i) => (
            <div key={f.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <f.icon size={24} className="text-foreground" aria-hidden />
                <h3 className="mt-3 text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.body}</p>
              </div>
              <Image
                src={f.image}
                alt={f.alt}
                width={1280}
                height={800}
                sizes="(min-width: 768px) 340px, 100vw"
                className="rounded-lg border border-border"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Free and private */}
      <Section>
        <div className="rounded-lg bg-muted p-6">
          <p className="text-base font-semibold text-foreground">Free, private, and a very good boy.</p>
          <p className="mt-1 text-muted-foreground">
            Everything runs in your browser: no account, no tracking, nothing uploaded. If Swoopy saves your day, you can{" "}
            <a href="/swoopy/support.html" className={linkClass}>buy me a coffee</a>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <InstallButton />
            <a
              href="/swoopy/support.html"
              className="inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-2 text-sm text-foreground transition-colors duration-fast ease-out hover:bg-card"
            >
              <Coffee size={16} aria-hidden />
              Support Swoopy
            </a>
          </div>
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
        </p>
      </Section>
    </main>
  );
}
