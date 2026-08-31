import type { Metadata } from "next";
import { headers } from "next/headers";
import Container from "@/components/layout/Container";
import CardMinter from "@/components/card/CardMinter";
import CardFan from "@/components/card/CardFan";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";
import { indefiniteArticle, issueFromParam } from "@/lib/card/issues";

const DESCRIPTION =
  "Mint yourself a souvenir card. The portrait is drawn in your browser from a random id, the issue is decided by three throws of the dice, and the card downloads as a PNG.";

const CARD_OG = ogUrl({
  title: "Mint your souvenir card",
  subtitle: "Identity is permanent, edition is fate.",
  type: "generic",
  label: "Card",
});

/**
 * The link preview names the edition someone actually pulled.
 *
 * A post saying "I pulled an Inverted card" used to carry the same generic
 * page card as every other share, so the one number worth showing off was
 * missing from the only place strangers would see it. `?issue=` selects one
 * of five images rendered from the real drawTicket by
 * `scripts/render-issue-og.ts`.
 *
 * The param is an enum, not content. `issueFromParam` resolves it against
 * the five real keys and anything else falls straight back to the generic
 * card, so the query string can name one of five committed files and nothing
 * else: no text from a URL ever reaches a renderer, because nothing renders
 * at request time.
 *
 * The canonical URL stays parameterless. Five URLs for one page is a
 * duplicate-content problem, and the param changes only what a crawler is
 * told to preview, never what the page is.
 */
export function generateMetadata({
  searchParams,
}: {
  searchParams: { issue?: string | string[] };
}): Metadata {
  const issue = issueFromParam(searchParams.issue);
  const image = issue ? `${baseUrl}og/issue-${issue.key}.png` : CARD_OG;
  const title = issue
    ? `${indefiniteArticle(issue.name) === "an" ? "An" : "A"} ${issue.name} souvenir card`
    : "Mint your souvenir card";
  const description = issue
    ? `${issue.name}, ${issue.label} per roll. ${DESCRIPTION}`
    : DESCRIPTION;

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}card` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}card`,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
/**
 * Reading headers opts this route into dynamic rendering, which is intended:
 * the origin printed on the card is per request. Both headers are absent in
 * local dev; in production that means no origin line rather than a guess.
 * In development only, a NODE_ENV-guarded stand-in fills them in below so
 * the origin line and the postmark's city can be seen without deploying.
 */
export default function CardPage() {
  const h = headers();
  let country = h.get("x-vercel-ip-country");
  let rawCity = h.get("x-vercel-ip-city");
  // Development-only stand-in: Vercel's geo headers only exist on its edge,
  // so both are always null on localhost, which makes the origin line and
  // the postmark's city invisible to the owner without deploying. Each
  // header falls back independently, and only when NODE_ENV is not
  // "production", so real headers (if ever present in a non-production
  // deploy, e.g. preview) still win. There is no fallback in production, by
  // design: this branch is structurally unreachable there.
  if (process.env.NODE_ENV !== "production") {
    if (!country) country = "IN";
    if (!rawCity) rawCity = "Bengaluru";
  }
  let city = rawCity;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  const origin = city && country ? `${city}, ${country}` : country;

  return (
    <main className="py-8 md:py-12">
      <Container width="reading">
        {/* The fan sits with the title rather than above or below it, so the
            page opens by showing what it is offering instead of only naming
            it. `items-center` on a wrapping row: at 320px the heading takes
            two lines and the fan drops beneath it rather than squeezing the
            words into three. */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <h1 className="text-3xl font-semibold tracking-tighter text-foreground">
            Mint your souvenir card
          </h1>
          <CardFan w={26} />
        </div>
        <p className="mt-3 max-w-[56ch] text-base text-muted-foreground">
          Identity is permanent, edition is fate. Your portrait comes from a
          random id kept in this browser, so it is yours and it never changes.
          We read your country to print it on the card and store nothing else.
          Which of the five issues it prints on is decided by three throws of
          the dice, and you can roll as many times as you like.
        </p>
        <CardMinter origin={origin ?? null} city={city} cardUrl={`${baseUrl}card`} />
      </Container>
    </main>
  );
}
