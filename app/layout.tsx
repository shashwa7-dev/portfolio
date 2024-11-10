import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { baseUrl } from "./sitemap";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-spaceGrotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "S7.dev",
  description: "Frontend Engineer | Expert in Crafting Quality Interfaces",
  authors: [{ name: "Shashwat Tripathi" }],
  twitter: {
    card: "summary",
    site: baseUrl,
    description:
      "Frontend Engineer | Crafting sleek, responsive interfaces | Turning ideas into reality | Getting the job done right",
    images: [
      "https://github.com/shashwa7-dev/portfolio/blob/assets/brand.png?raw=true",
    ],
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
  openGraph: {
    url: baseUrl,
    type: "website",
    title: "S7.dev",
    description: "Frontend Engineer | Expert in Crafting Quality Interfaces",
    images: [
      "https://github.com/shashwa7-dev/portfolio/blob/assets/brand.png?raw=true",
    ],
    siteName: "S7.dev",
    locale: "en_US",
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
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}
