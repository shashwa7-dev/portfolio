import { StackName } from "@/components/common/StackIcon";

export type TSideProject = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  isActive?: boolean;
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
    producthunt?: string;
  };
  stack: { fe?: StackName[]; be?: StackName[] };
};

export const sideProjects: TSideProject[] = [
  {
    id: "focus-pro",
    slug: "focus-pro",
    title: "f0cusPro",
    tagline: "Productivity tool that blocks distracting sites",
    isActive: true,
    description:
      "Desktop productivity tool built with ElectronJS that blocks distracting websites using an HTTP proxy.",
    longDescription: `f0cusPro is a tiny productive tool that blocks distracting sites when you need to focus. Under the hood, it uses a simple HTTP proxy that intercepts requests and blocks blacklisted domains.

I built this after seeing similar features as premium offerings in apps like stayinsession.com. The tool is simple but effective - yes, a VPN could bypass it, but the goal is to add just enough friction to keep you on track.

Key technical decisions:
- ElectronJS for cross-platform desktop support
- HTTP proxy for transparent request interception
- React frontend for the configuration UI
- TypeScript for type safety`,
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
      github: "https://github.com/shashwa7-dev/focus-pro",
      twitter: "https://x.com/offcod8/status/1998007706041659638",
    },
    thumbnail: "/projects/project_focus_pro.JPG",
  },
  {
    id: "eatri8",
    slug: "eatri8-ai",
    title: "Eatri8.ai",
    tagline: "AI-powered food health assessment",
    description:
      "Health assessment app using Google Gemini AI to analyze food products from label images.",
    longDescription: `Eatri8.ai helps users make informed dietary decisions by analyzing food product labels using AI. Simply upload a photo of a food label, and the app provides:

- Health score based on nutritional content
- Recommended portion sizes
- Consumption advice and warnings
- Ingredient analysis

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
    date: "Sep 2025",
  },
];

export const getSideProject = (slug: string) =>
  sideProjects.find((p) => p.slug === slug);

export const getAllSideProjects = () => sideProjects;
