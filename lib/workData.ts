import { StackName } from "@/components/common/StackIcon";

export type TProject = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  isActive?: boolean;
  featured?: boolean;
  description: string;
  highlights?: string[];
  thumbnail: string;
  preview?: string;
  date?: string;
  metric?: string;
  links?: {
    github?: string;
    twitter?: string;
    web?: string;
    opensea?: string;
    other?: string;
  };
  stack: { fe?: StackName[]; be?: StackName[] };
};

export type TOrganization = {
  id: string;
  slug: string;
  name: string;
  logo: string;
  role: string;
  duration: string;
  /** Engagement type — surfaced as a small pill next to the role. */
  employment?: "full-time" | "contract";
  description: string;
  highlights: string[];
  /** Single canonical link — used as the org name link if `links` isn't set. */
  link?: string;
  /** Multiple labelled outbound links (e.g. landing site, app, X profile). */
  links?: {
    web?: string;
    app?: string;
    twitter?: string;
  };
  projects: TProject[];
};

export const organizations: TOrganization[] = [
  {
    id: "shopos",
    slug: "shopos",
    name: "ShopOS",
    logo: "/images/shopos.jpeg",
    role: "Frontend Engineer",
    employment: "full-time",
    duration: "Jan 2026 - Present",
    description:
      "Frontend engineer at ShopOS, an AI-native commerce platform. Shipping merchant-facing surfaces across AI agents, workflow authoring, and chat for create, manage, market, and sell flows.",
    links: {
      web: "https://shopos.ai/",
      app: "https://app.shopos.ai/",
    },
    highlights: [
      "Migrated the Enterprise dashboard from a separate iframe-hosted repo into the main app.",
      "Built Canvas Builder for visual workflow authoring and the content-rich tiptap chat input.",
      "Shipped the media carousel for AI asset review and the Skills Library across two apps.",
    ],
    projects: [],
  },
  {
    id: "dehidden",
    slug: "dehidden",
    name: "Dehidden",
    logo: "/images/dehidden_logo.jpeg",
    role: "Frontend Developer (Web3)",
    employment: "contract",
    duration: "Jan 2022 - Dec 2025",
    description:
      "Building AI × Web3 products including DeFi platforms, NFT minting solutions, and blockchain integrations.",
    link: "https://x.com/playAInetwork",
    highlights: [
      "Led frontend development for 9+ production Web3 applications",
      "Built real-time AI chat streaming with DeFi workflow integrations",
      "Engineered NFT platform handling 1M+ users, 100K mints day one",
      "Partnered with Coinbase, Polygon & Sentient on high-profile launches",
      "Created gamified onboarding engaging 2,000+ conference attendees",
    ],
    projects: [
      {
        id: "0x1",
        slug: "playai-hub",
        title: "PlayAI Hub",
        shortTitle: "PlayAI Hub",
        featured: true,
        description:
          "AI × DeFi platform unifying real-time chat streaming with workflow-driven interactions. Built core UI, chat streaming, workflow-preset sessions, and mission/reward flows for x402-powered agent-ready apps.",
        highlights: [
          "Real-time AI chat streaming with WebSocket integration",
          "Workflow-preset chat sessions for automated DeFi actions",
          "Interactive mission/reward system with gamification",
          "x402-powered agent-ready architecture",
        ],
        stack: {
          fe: [
            "react",
            "typescript",
            "tailwind",
            "shadcn",
            "reactQuery",
            "wagmi",
          ],
        },
        links: {
          twitter: "https://x.com/playAInetwork/status/1979186759020757025",
          web: "https://hub.playai.network/",
        },
        isActive: true,
        preview: "/projects/playhub_preview.mp4",
        thumbnail: "/projects/project_playhub.JPG",
        date: "Jan 2026",
      },
      {
        id: "0x2",
        slug: "madrims",
        title: "MadRims by PlayAI",
        shortTitle: "MadRims",
        description:
          "AI-powered glasses product landing page and e-commerce ordering flow. Voice-command enabled hardware on PlayAI Network.",
        highlights: [
          "Product landing page with 3D visuals",
          "E-commerce ordering flow integration",
          "Responsive design optimized for conversions",
        ],
        stack: {
          fe: [
            "react",
            "typescript",
            "tailwind",
            "shadcn",
            "motion",
            "reactQuery",
          ],
        },
        preview: "/projects/madrims_preview.mp4",
        links: {
          web: "https://madrims.playai.network/learn-more",
        },
        isActive: true,
        thumbnail: "/projects/project_madrims.JPG",
        date: "Sep 2025",
      },
      {
        id: "0x4",
        slug: "coinbase-polygon-nft",
        title: "Coinbase × Polygon NFT",
        shortTitle: "CB × Polygon NFT",
        featured: true,
        metric: "100K mints · day one",
        description:
          "High-scale NFT minting platform for user onboarding to Web3. Collaboration with Coinbase, Polygon, and partners achieving 100K mints on day one.",
        highlights: [
          "Engineered platform handling 1M+ users",
          "100K NFTs minted in first 24 hours",
          "50% increase in user retention during minting",
          "Partnership with Coinbase and Polygon teams",
        ],
        stack: {
          fe: ["react", "styledComponents", "wagmi"],
        },
        links: {
          web: "https://x.com/baseapp/status/1542327195174965248/photo/1",
          opensea:
            "https://opensea.io/item/polygon/0x61c594b34341e2f3f0db05e0d6bd30980c94df7b/1",
        },
        thumbnail: "/projects/CoinbaseNFT.jpeg",
        date: "Jun 2022",
      },
      {
        id: "0xPolygonCopilot",
        slug: "polygon-copilot",
        title: "Polygon Copilot",
        shortTitle: "Polygon Copilot",
        featured: true,
        metric: "Featured by Polygon",
        description:
          "AI chatbot for Web3 developers using OpenAI GPT models, delivering blockchain insights within the zkEVM ecosystem.",
        highlights: [
          "GPT-powered conversational AI for developers",
          "Multi-persona sessions (Beginner/Advanced)",
          "Rich minting call-to-action components",
          "zkEVM ecosystem integration",
        ],
        stack: {
          fe: [
            "react",
            "typescript",
            "styledComponents",
            "reactQuery",
            "zustand",
            "wagmi",
          ],
        },
        links: {
          web: "https://polygon.technology/blog/introducing-copilot-your-ai-powered-guide-to-polygon-and-web3",
          other: "https://x.com/0xPolygon/status/1671504505764970498",
        },
        thumbnail: "/projects/polygon_copilot.webp",
        date: "Jun 2023",
      },
      {
        id: "0xNFTWrapped",
        slug: "nft-wrapped",
        title: "NFT Wrapped 2022",
        shortTitle: "NFT Wrapped",
        metric: "250+ wraps in 24h",
        description:
          "Personalized, gamified NFT experience inspired by Spotify Wrapped. Concept to launch in 3 weeks with quests, leaderboards, and user personas.",
        highlights: [
          "250+ wraps generated within 24 hours",
          "100+ NFT mints on launch day",
          "Gamified quests and leaderboards",
          "Personalized user persona system",
        ],
        stack: {
          fe: ["react", "styledComponents", "wagmi", "motion"],
        },
        links: {
          web: "https://www.producthunt.com/products/nft-wrapped",
          opensea:
            "https://opensea.io/item/polygon/0x5be60c156c48d1ca8f141ed429080212c781bdb3/3",
        },
        thumbnail: "/projects/nft_wrapped.webp",
        date: "Dec 2022",
      },
      {
        id: "0x6",
        slug: "playai-network",
        title: "PlayAI.network",
        shortTitle: "PlayAI Landing",
        description:
          "Marketing landing page for PlayAI, an AI-driven gaming enhancement platform with real-time assistance and personalized coaching.",
        highlights: [
          "GSAP + Framer Motion animations",
          "Interactive feature showcases",
          "Optimized for conversion",
        ],
        stack: {
          fe: ["react", "typescript", "styledComponents", "gsap", "motion"],
        },
        thumbnail: "/projects/project_playai.JPG",
        preview: "/projects/preview_playai.mp4",
        links: {
          twitter: "https://x.com/playAInetwork",
          web: "https://playai.network/",
        },
        date: "Jun 2024",
      },
      {
        id: "0x3",
        slug: "agent-experience",
        title: "Agent Experience",
        shortTitle: "0xRogueAgent",
        featured: true,
        description:
          "AI-driven agent project on Solana with $ROGUE token for mission-based experiences and governance participation.",
        highlights: [
          "Solana blockchain integration",
          "Token-gated features and governance",
          "Mission-based gamification",
        ],
        stack: {
          fe: [
            "react",
            "typescript",
            "tailwind",
            "shadcn",
            "reactQuery",
            "solana",
          ],
        },
        links: {
          web: "https://agentexperience.live/",
          other:
            "https://dexscreener.com/solana/bgzm2era3ifpkcmb4w49of3cj9ruverxzhe2pzbbp8tv",
        },
        thumbnail: "/projects/project_agent_exp.JPG",
        date: "Mar 2025",
      },
      {
        id: "0x5",
        slug: "node-explorer",
        title: "Node Explorer",
        shortTitle: "Node Explorer",
        featured: true,
        description:
          "Node management platform for delegating PlayAI Oasis Nodes, enabling task execution and PlayAI Coin earnings.",
        highlights: [
          "Real-time node delegation dashboard",
          "Earnings tracking and analytics",
          "Off-chain computation management",
        ],
        stack: {
          fe: ["react", "typescript", "reactQuery", "wagmi", "chakraui"],
        },
        links: {
          twitter: "https://x.com/playAInetwork",
          web: "https://nodeexplorer.playai.network/",
        },
        thumbnail: "/projects/node_explorer.jpeg",
        date: "Sep 2024",
      },
      {
        id: "0xDehiddenQuest",
        slug: "dehidden-quest",
        title: "Dehidden Quest × Web3Conf",
        shortTitle: "Web3Conf Quest",
        metric: "2,000+ attendees",
        description:
          "Gamified Web3 onboarding at Web3Conf India 2022. Interactive booth challenges with on-chain tasks and reward redemption.",
        highlights: [
          "2,000+ conference attendees engaged",
          "Social wallet login integration",
          "Soulbound ERC-721 NFT rewards",
          "Real-world goodies redemption system",
        ],
        stack: {
          fe: ["react", "reactQuery", "wagmi", "styledComponents", "motion"],
        },
        preview: "/projects/project_quest_preview.mp4",
        thumbnail: "/projects/project_quest.png",
        date: "Aug 2022",
      },
    ],
  },
  {
    id: "copestudio",
    slug: "copestudio",
    name: "Cope.Studio",
    logo: "/images/copestudio.jpeg",
    role: "Frontend Dev (internship)",
    duration: "Jan 2022 - Mar 2022",
    description: "Frontend development for Cope.Studio.",
    highlights: [
      "Contributing to client-facing frontend features and bug fixes",
      "Learning and applying React and modern web tooling",
      "Collaborating with senior developers on component architecture",
      "Supporting UI updates and responsive layout improvements",
    ],
    projects: [],
  },
];

export const getOrganization = (slug: string) =>
  organizations.find((org) => org.slug === slug);

export const getProjectFromOrg = (orgSlug: string, projectSlug: string) => {
  const org = getOrganization(orgSlug);
  return org?.projects.find((p) => p.slug === projectSlug);
};

export const getAllWorkProjects = () =>
  organizations.flatMap((org) => org.projects);
