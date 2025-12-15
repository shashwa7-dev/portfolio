import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { baseUrl } from "./sitemap";
import localFont from "next/font/local";

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
  title: "Hey, what's good?",
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
        url: `${baseUrl}/og-image.png?v=2.0`,
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
    images: [`${baseUrl}/og-image.png?v=2.0`],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg" }],
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
        {children}
      </body>
    </html>
  );
}
