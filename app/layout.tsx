import type { Metadata } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const offBit = localFont({
  src: [
    {
      path: "../public/fonts/offBit/ob_reg.ttf",
      weight: "400",
    },
    {
      path: "../public/fonts/offBit/ob_bold.ttf",
      weight: "700",
    },
    {
      path: "../public/fonts/offBit/ob_dot_bold.ttf",
      weight: "900",
    },
  ],
  variable: "--font-offBit",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-vt323",
});
const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jbMono",
});
export const metadata: Metadata = {
  title: "S7.dev",
  description: "Frontend Engineer | Expert in Crafting Quality Interfaces",
  authors: [{ name: "Shashwat Tripathi" }],
  openGraph: {
    title: "S7.dev",
    description: "Frontend Engineer | Expert in Crafting Quality Interfaces",
  },
  twitter: {
    card: "summary",
    site: "https://shashwa7.vercel.app/",
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
  other: {
    copyright: "S7.dev@2024",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${offBit.variable} ${vt323.variable}`}>
      <body className={jbMono.className}>{children}</body>
    </html>
  );
}
