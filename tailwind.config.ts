import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 1s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      container: {
        center: true,
        screens: {
          "2xl": "920px",
        },
      },
      fontFamily: {
        mono: ["var(--font-vt323)", ...fontFamily.mono],
        s7_mono: ["var(--font-offBit)", ...fontFamily.mono],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      transitionDuration: {
        "2000": "2000ms",
        "4000": "4000ms",
      },
      colors: {
        s7: {
          gray100: "#EAEAEA",
          gray200: "#D0D0D0",
          gray300: "#A0A0A0",
          gray_graphite: "#4D5362",
          rich_black: "#020202",
        },
      },
    },
  },
  plugins: [],
};
export default config;
