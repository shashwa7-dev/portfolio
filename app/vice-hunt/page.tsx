import type { Metadata } from "next";
import { baseUrl } from "@/app/sitemap";
import ViceHuntRoute from "@/components/gta6/ViceHuntRoute";

export const metadata: Metadata = {
  title: "Vice Hunt",
  description: "A small shooting gallery on a Vice City beach.",
  alternates: { canonical: `${baseUrl}vice-hunt` },
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
