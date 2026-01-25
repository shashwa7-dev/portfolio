import { StackName } from "@/components/common/StackIcon";

export type TSideProject = {
  id: string;
  slug: string;
  title: string;
  icon?: string;
  tagline: string;
  isRecent?: boolean;
  description: string;
  longDescription?: string;
  highlights: string[];
  thumbnail: string;
  preview?: string;
  screenshots?: string[];
  date?: string;
  links?: {
    github?: string;
    twitter?: string;
    web?: string;
    download?: string;
    producthunt?: string;
  };
  stack: { fe?: StackName[]; be?: StackName[] };
};

export const sideProjects: TSideProject[] = [
  {
    id: "paper-noise",
    slug: "paper-noise",
    title: "PaperNoise",
    isRecent: true,
    tagline: "Where pixels pretend to be paper.",
    description:
      "A small experimental tool to create vintage-style cards with real textures, classic ink palettes, and old-school typography — entirely in the browser.",
    longDescription: `PaperNoise is a small experimental tool to create vintage-style cards with real textures, classic ink palettes, and old-school typography — entirely in the browser.

  No templates. No AI fluff. Just code and texture obsession.

Built with React + Vite, this tool explores browser rendering and export edge cases.`,
    highlights: [
      "Vintage / parchment-style card editor",
      "Custom paper, ink, and texture tint",
      "High-quality PNG export",
      "Export-safe rendering using dom-to-image-more",
    ],
    stack: { fe: ["react", "typescript"] },
    links: {
      github: "https://github.com/shashwa7-dev/papernoise-offcod8",
      producthunt: "https://www.producthunt.com/products/papernoise",
      web: "https://papernoise.shashwa7.in/",
    },
    thumbnail: "/projects/papernoise-og.png",
    date: "Jan 2026",
  },
  {
    id: "kiryoku",
    slug: "kiryoku",
    title: "Kiryouku",
    tagline: "Productivity tool that blocks distracting sites",
    isRecent: true,
    description:
      "Desktop productivity tool built with ElectronJS that blocks distracting websites using an HTTP proxy.",
    longDescription: `Kiryouku is a tiny productive tool that blocks distracting sites when you need to focus. Under the hood, it uses a simple HTTP proxy that intercepts requests and blocks blacklisted domains.

I built this after seeing similar features as premium offerings in apps like stayinsession.com. The tool is simple but effective - yes, a VPN could bypass it, but the goal is to add just enough friction to keep you on track.
`,
    highlights: [
      "HTTP proxy-based site blocking",
      "Cross-platform desktop app",
      "Customizable blocklist",
      "Focus session tracking",
    ],
    stack: {
      fe: ["react", "typescript"],
      be: ["electron"],
    },
    links: {
      download: "https://github.com/shashwa7-dev/focus-pro/releases/tag/v0.1.0",
      github: "https://github.com/shashwa7-dev/focus-pro",
      twitter: "https://x.com/offcod8/status/2015526005000327662",
    },
    thumbnail: "/projects/kiryoku.webp",
    date: "Dec 2025",
  },
  {
    id: "eatri8",
    slug: "eatri8-ai",
    title: "Eatri8.ai",
    tagline: "AI-powered food health assessment",
    description:
      "Health assessment app using Google Gemini AI to analyze food products from label images.",
    longDescription: `Eatri8.ai helps users make informed dietary decisions by analyzing food product labels using AI. Simply upload a photo of a food label, and the app provides:

Built with Next.js and powered by Google Gemini Flash 1.5, the app processes images in real-time to extract and analyze nutritional information.`,
    highlights: [
      "Google Gemini Flash 1.5 AI integration",
      "Real-time image processing",
      "Nutritional analysis and scoring",
      "Personalized consumption advice",
    ],
    stack: {
      fe: ["next", "typescript", "googleGemini", "tailwind", "shadcn"],
    },
    links: {
      github: "https://github.com/shashwa7-dev/food-analyzer",
    },
    preview: "/projects/preview_eatri8.mp4",
    thumbnail: "/projects/project_eatri8.JPG",
    date: "Jul 2025",
  },
];

export const getSideProject = (slug: string) =>
  sideProjects.find((p) => p.slug === slug);

export const getAllSideProjects = () => sideProjects;
