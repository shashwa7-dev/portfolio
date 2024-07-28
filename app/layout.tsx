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
  description: "Your friendly go-to dev guy ;)",

  icons: {
    icon: "./fevicon.png",
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
