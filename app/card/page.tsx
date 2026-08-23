import { headers } from "next/headers";
import Container from "@/components/layout/Container";
import CardMinter from "@/components/card/CardMinter";
import IssueGallery from "@/components/card/IssueGallery";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";

const DESCRIPTION =
  "Mint yourself a stamp card. The portrait is drawn in your browser from a random id, and the card downloads as a PNG.";

const CARD_OG = ogUrl({
  title: "Mint a visitor card",
  subtitle: "A stamp drawn in your browser, at one of five rarities.",
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
 * local dev, so the fallback is no origin line rather than a guess.
 */
export default function CardPage() {
  const h = headers();
  const country = h.get("x-vercel-ip-country");
  const rawCity = h.get("x-vercel-ip-city");
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
        <h1 className="text-3xl font-semibold tracking-tighter text-foreground">
          Mint a visitor card
        </h1>
        <p className="mt-3 max-w-[56ch] text-base text-muted-foreground">
          Every visitor gets a stamp drawn for them. The portrait comes from a
          random id kept in this browser, so it is yours and it does not change.
          Five issues exist. Most people get a Definitive.
        </p>
        <CardMinter origin={origin ?? null} city={city} />
        <IssueGallery />
      </Container>
    </main>
  );
}
