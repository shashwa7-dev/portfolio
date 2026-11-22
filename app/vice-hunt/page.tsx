import type { Metadata } from "next";
import { baseUrl } from "@/app/sitemap";
import ViceHuntRoute from "@/components/gta6/ViceHuntRoute";

export const metadata: Metadata = {
  title: "Vice Hunt",
  description: "A small shooting gallery on a Vice City beach.",
  alternates: { canonical: `${baseUrl}vice-hunt` },
  /** Its own preview card (`scripts/og/vice-hunt.html` renders it): a page's
   *  openGraph replaces the site's whole, so every field is set here. */
  openGraph: {
    title: "Vice Hunt",
    description: "A GTA VI tribute mini-game. Play now.",
    url: `${baseUrl}vice-hunt`,
    siteName: "S7.dev",
    type: "website",
    images: [{ url: "/og/vice-hunt.jpg", width: 1200, height: 630, alt: "Vice Hunt, a GTA VI tribute mini-game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vice Hunt",
    description: "A GTA VI tribute mini-game. Play now.",
    images: ["/og/vice-hunt.jpg"],
  },
  /** Unlisted: a direct way into the game, not in the nav or the sitemap. */
  robots: { index: false, follow: false },
};

/**
 * Vice Hunt on its own URL. The same full-screen game mode the revolver in
 * GTA mode opens (entry, play, results), loaded straight away; Back to site
 * goes to the homepage.
 */
export default function ViceHuntPage() {
  return <ViceHuntRoute />;
}
