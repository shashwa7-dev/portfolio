import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { baseUrl } from "./sitemap";
import { ogUrl, personLd, websiteLd } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UmamiAnalytics from "@/components/Umami";
import NoScript from "@/components/NoScript";
import { cardHand, cardSticker, cardMono } from "@/lib/card/fonts";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), {
  ssr: false,
});
const KeyboardShortcuts = dynamic(
  () => import("@/components/KeyboardShortcuts"),
  { ssr: false }
);

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

/**
 * The mono face is declared once, in lib/card/fonts.ts, and reused here as
 * cardMono so the visitor-card canvas and the rest of the site share a
 * single self-hosted IBM Plex Mono rather than shipping it twice. See that
 * file for the full reasoning.
 */
const plexMono = cardMono;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Whats Good?",
    template: "%s | offcod8",
  },
  description: "Frontend Engineer | Expert in Crafting Quality Interfaces",
  authors: [{ name: "Shashwat Tripathi" }],
  openGraph: {
    title: "S7.dev",
    description: "Frontend Engineer | Expert in Crafting Quality Interfaces",
    url: baseUrl,
    siteName: "S7.dev",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogUrl({ title: "Shashwat Tripathi", subtitle: "Frontend Engineer · Crafting quality interfaces", type: "home" }),
        width: 1200,
        height: 630,
        alt: "Shashwat Tripathi, Frontend Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "S7.dev",
    description:
      "Frontend Engineer | Crafting sleek, responsive interfaces with great design and seamless UX.",
    images: [ogUrl({ title: "Shashwat Tripathi", subtitle: "Frontend Engineer · Crafting quality interfaces", type: "home" })],
  },
  icons: {
    /**
     * Raster only, and no SVG at all.
     *
     * The generator's favicon.svg is a 128KB PNG in an SVG wrapper rather than
     * real vector, so it is a bitmap either way. Declaring it as a fallback did
     * not make it a fallback: Firefox prefers an SVG icon whenever one is
     * offered, regardless of the sizes on the other candidates, so the 128KB
     * file was what a tab actually fetched and the PNGs were the thing going
     * unused. The file is deleted rather than left undeclared, since nothing
     * else references it.
     *
     * `mask-icon` is gone for the same underlying reason. Safari's pinned-tab
     * icon must be a single-colour vector with a real path, and it renders a
     * wrapped raster as a solid black square. Both entries come back the day
     * there is a genuine vector of the mark to point them at.
     */
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var dark=t==="dark"||(t===null&&d);document.documentElement.classList.toggle("dark",dark);})();`,
          }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify([personLd(), websiteLd()]) }}
        />
      </head>
      <body
        className={`bg-background text-foreground border-border ${dmSans.variable} ${plexMono.variable} ${cardHand.variable} ${cardSticker.variable} font-sans`}
      >
        <NoScript />
        <MotionConfig reducedMotion="user">
          <div className="relative z-10">
            <TooltipProvider delayDuration={150} skipDelayDuration={0}>
              <Navbar />
              {children}
              <CommandPalette />
              <KeyboardShortcuts />
            </TooltipProvider>
            <Analytics />
            <UmamiAnalytics />
          </div>
          <Footer />
        </MotionConfig>
      </body>
    </html>
  );
}
