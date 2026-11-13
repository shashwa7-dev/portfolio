import { Barlow_Condensed, Sedgwick_Ave_Display } from "next/font/google";

/**
 * The Rooftop Madness lettering, for the starter pack card only: Sedgwick Ave
 * Display for the marker title, Barlow Condensed italic for every label (both
 * SIL OFL). Imported only from the card's dynamic chunk and never preloaded,
 * so they cannot compete with the hero's fonts for LCP.
 */
export const spMarker = Sedgwick_Ave_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--sp-marker",
  display: "swap",
  preload: false,
});

export const spLabel = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["800", "900"],
  style: ["normal", "italic"],
  variable: "--sp-label",
  display: "swap",
  preload: false,
});
