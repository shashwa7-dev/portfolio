import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { baseUrl } from "./sitemap";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import Brand from "@/components/Brand";
import Footer from "@/components/Footer";

const BottomFadeMask = dynamic(
  () =>
    import("@/components/BottomFadeMask").then((m) => ({
      default: m.BottomFadeMask,
    })),
  { ssr: false }
);

const AnimatedBackground = dynamic(
  () =>
    import("@/components/AnimatedBackground").then((m) => ({
      default: m.AnimatedBackground,
    })),
  { ssr: false }
);

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
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
        className={`bg-background text-foreground border-border ${plusJakarta.variable} font-sans dark`}
      >
        <AnimatedBackground />
        <div className="relative z-10">
          <TooltipProvider>
            {children}
            <BottomFadeMask />
            <Analytics />
          </TooltipProvider>
        </div>
        <Footer />
      </body>
    </html>
  );
}
