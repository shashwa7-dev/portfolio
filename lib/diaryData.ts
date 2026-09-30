import { StackName } from "@/components/common/StackIcon";

/**
 * A snapshot or screen recording attached to a diary entry. Leave `src` unset
 * to reserve the slot: the capture is planned but not made yet. Empty slots
 * render as a labelled placeholder in development and are skipped in
 * production, so the live page never shows a "coming soon" box.
 */
export type TDiaryMedia = {
  kind: "image" | "video";
  /** Path under /public, e.g. "/work/shopos/spacelab-run.mp4". */
  src?: string;
  /** Doubles as the caption and, for images, the alt text. */
  alt: string;
  /** Still frame shown before a video loads. */
  poster?: string;
};

export type TDiaryEntry = {
  id: string;
  title: string;
  summary: string;
  date: string;
  /** Product mark shown beside the title. */
  logo?: string;
  context?: string;
  contributions: string[];
  impact?: string;
  stack?: StackName[];
  media?: TDiaryMedia[];
};

export type TOrgDiary = {
  org: string;
  overview?: string;
  featured: TDiaryEntry[];
  other?: { title: string; summary: string; date?: string }[];
};

export const diaries: TOrgDiary[] = [
  {
    org: "shopos",
    overview:
      "I build ShopOS's AI products end to end, from the UI down to the integrations: Sloosh for creators, the ShopOS app for brands, and Spacelab, the node canvas both of them run on.",
    featured: [
      {
        id: "sloosh",
        title: "Sloosh",
        logo: "/images/sloosh.png",
        summary:
          "The creator app from ShopOS. Pick a space, fill in the inputs, get the outcome.",
        date: "Sep 2026",
        context:
          "Creators want the result, not the pipeline. Sloosh takes Spacelab workflows and ships them as one-click tools for UGC ads, product shots and short video.",
        contributions: [
          "Space gallery: browse and explore spaces, with tagged templates and agents attached to each one.",
          "Viral Visuals: trend-led template categories, so creators start from what is working now.",
          "Models hub: every image and video model in the app, from Nano Banana and GPT Image to Veo, Seedance and Kling, each with ready templates.",
          "Studio: generate and edit, keep a personal library, and build your own spaces on a lightweight canvas.",
          "Plans, credits and upgrades: features gated by plan in the UI, the server's refusal mapped to the matching upgrade dialog, credit banners and an upgrade celebration.",
          "Sloosh MCP: run your spaces from Claude or ChatGPT, with short share links and one login shared with ShopOS.",
        ],
        impact:
          "A second product shipped on the same packages as ShopOS, without a fork: Sloosh-only behaviour sits behind optional hooks, and ShopOS runs unchanged.",
        stack: ["next", "react", "typescript", "tailwind", "reactQuery", "zustand"],
      },
      {
        id: "spacelab",
        title: "Spacelab",
        logo: "/images/spacelab.svg",
        summary:
          "A node canvas for AI content pipelines. Wire inputs, models and tools into a graph, run it on one product or a whole catalog, and publish it as a one-click Space.",
        date: "Since Jan 2026",
        context:
          "A brand launch needs hundreds of on-brand images and videos, and each one used to be a separate prompt in a separate tool. Spacelab turns that into a pipeline you build once and run as often as you like. It is the shared engine under both ShopOS and Sloosh.",
        contributions: [
          "Node canvas editor: drag, connect, group and run nodes, with keyboard shortcuts, a live run view and outputs on every node.",
          "Frontier models: 30+, one node each. Video: Veo 3.1, Seedance 2.5, Kling 3.0, MiniMax H3, Grok Imagine. Image: Nano Banana Pro, GPT Image 2.5, Seedream 5, Flux 2 Pro, Qwen Image. Text: Claude, GPT-5.6, Gemini, DeepSeek. Audio: Lyria 3, ElevenLabs.",
          "Brand nodes: Brand Memory and Moodboard feed the brand's own characters, scenes, poses and palette into any generation, so the output stays on-brand.",
          "Catalog nodes: Image Iterator, Image Pool and Randomizer fan a pipeline out over a whole folder or catalog, and Garment Classifier routes each shot into named buckets.",
          "Vision nodes: Auto Mask selects whatever you name and returns a mask and a cut-out (SAM 3), Video Analyzer breaks down a reference ad with Gemini, and Pinterest Scraper pulls references by keyword.",
          "Video finishing nodes: lipsync, text to speech, Lyria music, generated sound and styled burned-in subtitles, so a UGC ad comes out finished instead of silent.",
          "Ask AI and Goal Mode: Ask AI builds or edits the graph from a sentence, with undo. Goal Mode takes a goal and quality criteria, then keeps revising and re-running the workflow until the output passes.",
          "Publish as a Space: any canvas becomes a simple form that others can run, share and remix, with version history. An MCP server lets outside agents build and run canvases too.",
        ],
        impact:
          "A pipeline built once runs across an entire catalog. The same engine powers enterprise catalog runs in ShopOS and every one-click tool in Sloosh.",
        stack: ["next", "react", "typescript", "zustand", "reactQuery", "claude", "googleGemini", "openai"],
      },
      {
        id: "shopos",
        title: "ShopOS",
        logo: "/images/shopos.jpeg",
        summary:
          "An AI workspace where e-commerce brands create, market and sell, with a team of agents working alongside the tools they already use.",
        date: "Since Jan 2026",
        context:
          "Brands juggle ad managers, storefront builders, creative tools and spreadsheets. ShopOS puts one workspace over all of it, with agents that read the data, make the content and ship the changes.",
        contributions: [
          "Performance Marketing agent: reads Meta, Google and GA4. Creative Pulse maps every ad by spend and score, catalog overlays brand a whole Meta product catalog, and reports share as a live link.",
          "Creative Director agent: images, video, briefs and storyboards generated from the brand's own memory, with a Creative Studio for editing.",
          "Store Manager agent: builds Shopify themes, landing pages and advertorials that you edit by chatting with it.",
          "GEO Optimizer agent: tracks how the brand and its competitors show up in AI answer engines, writes content to close the gap, and publishes it on the brand's own domain.",
          "Agent chat: streaming replies and a rich composer (slash commands, skill mentions) that stays in sync across tabs.",
          "Workspace: Brand Memory, a shared asset Library, Routines for scheduled agent work, and Skills, Connectors and MCP to extend what the agents can do.",
          "Enterprise catalog review: bulk SKU generation, side-by-side review, annotations and shareable recap reports, moved in-app from a separate iframe-hosted dashboard.",
        ],
        impact:
          "The enterprise review surface is used by 8 accounts, including Celio, Bear House and Holy Drip. Built on Next.js 16 and React 19, with a design system on Base UI and Tailwind v4.",
        stack: ["next", "react", "typescript", "tailwind", "reactQuery", "zustand"],
      },
    ],
    // No "Also shipped": featured entries above are the bar; smaller work
    // doesn't earn its own surface here.
  },
  {
    org: "dehidden",
    overview:
      "Four years building AI and Web3 products at Dehidden: the PlayAI product line, NFT launches with Coinbase and Polygon, a developer copilot, and gamified onboarding.",
    // Built from the facts on the project entries in lib/workData.ts. Each
    // entry wears its partner's mark; Dehidden's own launches wear Dehidden's.
    featured: [
      {
        id: "playai",
        title: "PlayAI",
        logo: "/clients/client_playai.jpg",
        summary:
          "Five products for an AI network spanning agents, DeFi, node infrastructure and hardware.",
        date: "Jun 2024 to Jan 2026",
        context:
          "PlayAI grew from a gaming assistant into a network of AI products. Each launch needed its own frontend, from the first landing page to the agent-ready Hub.",
        contributions: [
          "PlayAI Hub: AI × DeFi platform with real-time chat streaming over WebSocket, workflow-preset sessions for automated DeFi actions, and mission and reward flows on an x402 agent-ready architecture.",
          "Node Explorer: a dashboard for delegating PlayAI Oasis Nodes, with earnings tracking and off-chain computation management.",
          "Agent Experience: an AI agent on Solana with the $ROGUE token, token-gated features, governance and mission-based play.",
          "MadRims: landing page with 3D visuals and the ordering flow for voice-command AI glasses.",
          "PlayAI.network: the marketing site, with GSAP and Framer Motion animation and interactive feature showcases.",
        ],
        impact:
          "Five shipped products across AI chat, DeFi, node infrastructure, tokens and hardware, from the 2024 landing page to the 2026 Hub.",
        stack: ["react", "typescript", "tailwind", "shadcn", "reactQuery", "wagmi", "solana"],
      },
      {
        id: "coinbase-polygon-nft",
        title: "Coinbase × Polygon NFT",
        logo: "/clients/client_coinbase.png",
        summary:
          "A high-scale NFT minting platform that onboarded users to Web3, built with Coinbase, Polygon and partners.",
        date: "Jun 2022",
        context:
          "A launch with Coinbase and Polygon meant a first Web3 experience for a very large audience, all arriving at once on launch day.",
        contributions: [
          "Minting platform: the end-to-end mint flow, engineered to handle 1M+ users.",
          "Retention: a minting experience that lifted user retention by 50%.",
          "Partnership: shipped alongside the Coinbase and Polygon teams.",
        ],
        impact: "1M+ users reached and 100K NFTs minted in the first 24 hours.",
        stack: ["react", "styledComponents", "wagmi"],
      },
      {
        id: "polygon-copilot",
        title: "Polygon Copilot",
        logo: "/clients/client_polygon.jpg",
        summary:
          "An AI chatbot for Web3 developers, delivering blockchain insights within the zkEVM ecosystem.",
        date: "Jun 2023",
        context:
          "Developers new to Polygon needed answers in context. Copilot put a GPT-powered guide to Polygon and Web3 directly in front of them.",
        contributions: [
          "Conversational AI: GPT-powered chat tuned for developer questions.",
          "Personas: separate Beginner and Advanced sessions.",
          "Mint prompts: rich call-to-action components inside the conversation.",
          "zkEVM: integration with the Polygon zkEVM ecosystem.",
        ],
        impact: "Launched by Polygon as its AI-powered guide to Polygon and Web3.",
        stack: ["react", "typescript", "styledComponents", "reactQuery", "zustand", "wagmi"],
      },
      {
        id: "nft-wrapped",
        title: "NFT Wrapped 2022",
        logo: "/images/dehidden_logo.jpeg",
        summary:
          "A personalised, gamified year in NFTs, inspired by Spotify Wrapped.",
        date: "Dec 2022",
        context:
          "An end-of-year moment with a hard deadline: it had to go from concept to launch in three weeks.",
        contributions: [
          "Personas: a persona system that turns each wallet's year into a character.",
          "Quests and leaderboards: gamified loops that kept people sharing.",
          "Minting: a mint on launch day for the finished wrap.",
        ],
        impact: "250+ wraps generated and 100+ NFTs minted within 24 hours of launch.",
        stack: ["react", "styledComponents", "wagmi", "motion"],
      },
      {
        id: "dehidden-quest",
        title: "Dehidden Quest × Web3Conf",
        logo: "/images/dehidden_logo.jpeg",
        summary:
          "Gamified Web3 onboarding at Web3Conf India 2022, with booth challenges and on-chain tasks.",
        date: "Aug 2022",
        context:
          "Conference attendees had a few minutes at a booth. Onboarding had to work on the spot, without a wallet set up in advance.",
        contributions: [
          "Social login: wallet creation through social sign-in.",
          "Soulbound rewards: ERC-721 NFTs issued for completed challenges.",
          "Redemption: real-world goodies claimed against on-chain progress.",
        ],
        impact: "2,000+ conference attendees engaged.",
        stack: ["react", "reactQuery", "wagmi", "styledComponents", "motion"],
      },
    ],
  },
  {
    org: "copestudio",
    overview: "A three-month frontend internship at Cope.Studio.",
    featured: [
      {
        id: "internship",
        title: "Frontend internship",
        summary: "Client-facing frontend work, learning React on production code.",
        date: "Jan 2022 to Mar 2022",
        contributions: [
          "Client features: frontend features and bug fixes for client-facing work.",
          "React: learning and applying React and modern web tooling.",
          "Component architecture: working with senior developers on how components are structured.",
          "Responsive UI: UI updates and responsive layout improvements.",
        ],
        stack: ["react", "styledComponents", "chakraui", "sass"],
      },
    ],
  },
];

export function getDiary(slug: string): TOrgDiary | undefined {
  return diaries.find((d) => d.org === slug);
}
