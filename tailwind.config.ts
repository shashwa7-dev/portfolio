import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 1s ease-in-out forwards",
        float: "float 1s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
        "marquee-left": "marquee-left var(--duration, 40s) linear infinite",
        "marquee-up": "marquee-up var(--duration, 40s) linear infinite",
      },
      keyframes: {
        "marquee-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-up": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },

      float: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-5px)" },
      },
      container: {
        center: true,
        screens: {
          "2xl": "920px",
        },
      },
      screens: {
        "-2xl": {
          max: "1535px",
        },
        "-xl": {
          max: "1279px",
        },
        "-lg": {
          max: "1023px",
        },
        "-md": {
          max: "767px",
        },
        "-sm": {
          max: "639px",
        },
      },

      fontFamily: {
        mono: ["var(--font-spaceGrotesk)", ...fontFamily.mono],
        sans: ["var(--font-stoke)", ...fontFamily.sans],
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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        /* Text hierarchy */
        subtitle: "hsl(var(--subtitle))",
        "subtitle-muted": "hsl(var(--subtitle-muted))",

        /* Form + layout */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* Buttons */
        button: {
          secondary: {
            DEFAULT: "hsl(var(--button-secondary))",
            foreground: "hsl(var(--button-secondary-foreground))",
            hover: "hsl(var(--button-secondary-hover))",
          },
          danger: {
            DEFAULT: "hsl(var(--button-danger))",
            hover: "hsl(var(--button-danger-hover))",
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }: any) {
      const newUtilities = {
        ".ws-tighter": {
          wordSpacing: "-0.1rem",
        },
        ".ws-tight": {
          wordSpacing: "0.1rem",
        },
        ".ws-normal": {
          wordSpacing: "0.25rem",
        },
        ".ws-wide": {
          wordSpacing: "0.5rem",
        },
      };

      addUtilities(newUtilities, ["responsive"]);
    }),
  ],
};
export default config;
