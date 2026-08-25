import { Caveat, Alegreya_Sans_SC, IBM_Plex_Mono } from "next/font/google";

/**
 * The card is drawn on a canvas, and canvas cannot resolve CSS custom
 * properties: `ctx.font = "20px var(--font-hand)"` fails silently and leaves
 * the previous face in place. So the font objects live here and callers use
 * `.style.fontFamily`, which is a real resolved family name.
 *
 * The names next/font returns arrive already quoted. Pass them straight into
 * ctx.font and never strip or add quotes: mangling the quoting invalidates
 * the whole shorthand and silently keeps the previous font.
 *
 * cardMono reuses the site's IBM Plex Mono declaration rather than calling
 * next/font/google a second time with identical config. next/font treats
 * each call site as a distinct font load, so a second identical call would
 * have self-hosted the same weights again under a second family name: the
 * same font shipped twice. app/layout.tsx imports cardMono from here for its
 * --font-mono variable instead of declaring its own IBM_Plex_Mono instance.
 */
export const cardHand = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-hand",
  display: "swap",
});

export const cardSticker = Alegreya_Sans_SC({
  subsets: ["latin"],
  weight: ["900"],
  style: ["italic"],
  variable: "--font-sticker",
  display: "swap",
});

export const cardMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const CARD_FONTS = {
  hand: cardHand.style.fontFamily,
  sticker: cardSticker.style.fontFamily,
  mono: cardMono.style.fontFamily,
};
