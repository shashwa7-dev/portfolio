import { headers } from "next/headers";
import Container from "@/components/layout/Container";
import CardMinter from "@/components/card/CardMinter";
import CardFan from "@/components/card/CardFan";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";

const DESCRIPTION =
  "Mint yourself a stamp card. The portrait is drawn in your browser from a random id, the issue is decided by three throws of the dice, and the card downloads as a PNG.";

const CARD_OG = ogUrl({
  title: "Mint a visitor card",
  subtitle: "Identity is permanent, edition is fate.",
  type: "generic",
  label: "Card",
});

export const metadata = {
  title: "Mint a visitor card",
  description: DESCRIPTION,
  alternates: { canonical: `${baseUrl}card` },
  openGraph: {
    title: "Mint a visitor card",
    description: DESCRIPTION,
    url: `${baseUrl}card`,
    images: [{ url: CARD_OG }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mint a visitor card",
    description: DESCRIPTION,
    images: [CARD_OG],
  },
};

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
            Mint a visitor card
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
