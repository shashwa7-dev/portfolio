import { Rozha_One, Tiro_Devanagari_Hindi } from "next/font/google";

/**
 * The finale's two faces, declared only here so they load with the lazy show
 * chunk and never with the homepage. `preload: false` keeps their files out
 * of the homepage's `<link rel="preload">` tags as well: nothing heavy loads
 * before the visitor shows interest in the photo.
 *
 * Rozha One sets the title, signature and prasad button
 * (`--font-diwali-display`); Tiro Devanagari Hindi sets the blessing, the
 * English line and the hint (`--font-diwali-text`).
 */
export const rozha = Rozha_One({
  weight: "400",
  subsets: ["devanagari", "latin"],
  variable: "--font-diwali-display",
  display: "swap",
  preload: false,
});

export const tiro = Tiro_Devanagari_Hindi({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["devanagari", "latin"],
  variable: "--font-diwali-text",
  display: "swap",
  preload: false,
});
