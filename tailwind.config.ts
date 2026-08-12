import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      animation: {
        blink: "blink 1s step-end infinite",
        "marquee-left": "marquee-left var(--duration, 40s) linear infinite",
        "marquee-up": "marquee-up var(--duration, 40s) linear infinite",
        "loading-bar": "loading-bar 1.2s ease-in-out infinite",
        "tooltip-in": "tooltip-in var(--duration-fast) var(--ease-out)",
        "tooltip-out": "tooltip-out var(--duration-fast) var(--ease-out)",
        // Timing retokenized from shadcn's hardcoded "0.2s ease-out" so the
        // accordion matches the rest of the motion system. Keep the KEYFRAMES
        // as generated: Radix Presence needs a real animationName to time the
        // unmount, so this cannot become a CSS transition.
        "accordion-down": "accordion-down var(--duration-med) var(--ease-out)",
        "accordion-up": "accordion-up var(--duration-med) var(--ease-out)",
      },
      keyframes: {
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
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
        "tooltip-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "tooltip-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.96)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      container: {
        center: true,
        screens: {
          "2xl": "920px",
        },
      },
      screens: {
        "-2xl": { max: "1535px" },
        "-xl": { max: "1279px" },
        "-lg": { max: "1023px" },
        "-md": { max: "767px" },
        "-sm": { max: "639px" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '1.4' }],   // 10px, mono labels
        xs:    ['0.6875rem', { lineHeight: '1.45' }],  // 11px
        sm:    ['0.8125rem', { lineHeight: '1.55' }],  // 13px
        base:  ['0.9375rem', { lineHeight: '1.65' }],  // 15px
        lg:    ['1.0625rem', { lineHeight: '1.5' }],   // 17px
        xl:    ['1.25rem',   { lineHeight: '1.4' }],   // 20px
        '2xl': ['1.5rem',    { lineHeight: '1.25' }],  // 24px
        '3xl': ['1.875rem',  { lineHeight: '1.15' }],  // 30px
        '4xl': ['2.25rem',   { lineHeight: '1.08' }],  // 36px
      },
      letterSpacing: {
        label:   '0.1em',
        normal:  '0',
        tight:   '-0.02em',
        tighter: '-0.03em',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
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
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        elevated: "hsl(var(--elevated))",
        subtle: "hsl(var(--subtle))",
        "border-strong": "hsl(var(--border-strong))",
        "accent-hover": "hsl(var(--accent-hover))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
