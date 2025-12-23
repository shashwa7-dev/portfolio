import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { baseUrl } from "./sitemap";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import Image from "next/image";

const stoke = localFont({
  src: "../public/fonts/Somatic-Rounded.otf",
  variable: "--font-stoke",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-spaceGrotesk",
});

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
        url: `${baseUrl}og-image.png?v=2.0`,
        width: 1600,
        height: 900,
        alt: "Shashwat Tripathi — Frontend Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "S7.dev",
    description:
      "Frontend Engineer | Crafting sleek, responsive interfaces with great design and seamless UX.",
    images: [`${baseUrl}og-image.png?v=2.0`],
  },
  icons: {
    icon: [{ url: "/favicon.svg", sizes: "32x32", type: "image/svg" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/favicon.svg" }],
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
    <html lang="en">
      <body
        className={`bg-background text-foreground border-border ${spaceGrotesk.variable} ${stoke.variable} font-mono dark`}
      >
        {children} <Analytics />
        <div className="fixed top-0 left-0 z-[-1] opacity-5 w-full h-full">
          <Image
            src="/stardew_2.png"
            alt=""
            fill
            placeholder="blur"
            blurDataURL="/stardew_2.png"
            className="object-cover"
          />
        </div>
      </body>
    </html>
  );
}
