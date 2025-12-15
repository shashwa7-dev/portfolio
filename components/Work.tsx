import React from "react";
import { TProject } from "./Project";
import ProjectCard from "./PorjectCard";
import SectionTitle from "./common/SectionTitle";
import { Briefcase } from "feather-icons-react";
const projects: TProject[] = [
  {
    id: "0x1",
    isWork: true,
    title: "PlayAI Hub",
    description:
      "PlayAI Hub is a unified platform for real-time AI chat streaming, multi-chain protocol swaps (MCPs), and secure cross-chain bridging—bringing seamless AI and DeFi interactions together.",
    stack: {
      fe: ["react", "typescript", "tailwind", "shadcn", "reactQuery", "wagmi"],
    },
    links: {
      twitter: "https://x.com/aura_playai",
      web: "https://hub.playai.network/",
    },
    isActive: true,
    thumbnail: "/projects/project_playhub.JPG",
  },
  {
    id: "0x2",
    isWork: true,
    title: "MadRims by PlayAI",
    description:
      "Mad Rims are AI-powered glasses built on top of the PlayAI Network. With them, your tasks are just an ask away.They come packed with a 12MP camera with EIS, dual open-ear speakers, snap-on shades, a hi-tech mic to activate your personal assistant, and more",
    stack: {
      fe: ["react", "typescript", "tailwind", "shadcn", "motion", "reactQuery"],
    },
    preview: "/projects/madrims_preview.mp4",
    links: {
      web: "https://madrims.playai.network/learn-more",
    },
    isActive: true,
    thumbnail: "/projects/project_madrims.JPG",
    date: "9/25",
  },
  {
    id: "0x4",
    isWork: true,
    title: "Coinbase X Polygon NFT (100K+)",
    description: `Collaborated with Coinbase, Polygon, and partners to onboard users to Web3 via a high-scale
 special-edition NFT minting platform.Engineered a robust & scalable platform handling over 1 Million users for NFT onboarding.With
100K NFTs minted in the first day and a 50% increase in user retention during the minting
process.`,
    stack: {
      fe: ["react", "styledComponents", "wagmi"],
    },
    links: {
      web: "https://x.com/baseapp/status/1542327195174965248/photo/1",
      opensea:
        "https://opensea.io/item/polygon/0x61c594b34341e2f3f0db05e0d6bd30980c94df7b/1",
    },
    thumbnail: "/projects/CoinbaseNFT.jpeg",
    date: "06/22",
  },
  {
    id: "0xPolygonCopilot",
    isWork: true,
    title: "Polygon Copilot",
    description:
      "Partnered with Polygon to build an AI chatbot for Web3 developers using OpenAI’s GPT models, delivering blockchain insights within the zkEVM ecosystem. Designed rich frontend components like minting call-to-action and multi-persona sessions (Beginner/Advanced) to enhance engagement.",
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
      web: "https://polygon.technology/blog/introducing-copilot-your-ai-powered-guide-to-polygon-and-web3?utm_source=twitter&utm_medium=social&utm_content=copilot-blog",
      other: "https://x.com/0xPolygon/status/1671504505764970498",
    },
    thumbnail: "/projects/polygon_copilot.webp",
    date: "06/23",
  },
  {
    id: "0xNFTWrapped",
    isWork: true,
    title: "NFT Wrapped 2022",
    description: `Built a personalized, gamified NFT experience inspired by Spotify Wrapped, from concept to launch in just 3 weeks. Integrated quests, leaderboards, and user personas to boost engagement, achieving 250+ wraps and 100+ mints within 24 hours of launch.`,
    stack: {
      fe: ["react", "styledComponents", "wagmi", "motion"],
    },
    links: {
      web: "https://www.producthunt.com/products/nft-wrapped?launch=nft-wrapped",
      opensea:
        "https://opensea.io/item/polygon/0x5be60c156c48d1ca8f141ed429080212c781bdb3/3",
    },
    thumbnail: "/projects/nft_wrapped_project.JPG",
    date: "12/22",
  },
  {
    id: "0x6",
    isWork: true,
    title: "PlayAI.network",
    description:
      "I have build the landing page for PlayAI, an innovative AI-driven platform designed to enhance the gaming experience. PlayAI leverages advanced machine learning models to provide real-time assistance, strategic insights, and personalized coaching for gamers across various genres.",
    stack: {
      fe: ["react", "typescript", "styledComponents", "gsap", "motion"],
    },
    thumbnail: "/projects/project_playai.JPG",
    preview: "/projects/preview_playai.mp4",
    links: {
      twitter: "https://x.com/playAInetwork",
      web: "https://playai.network/",
    },
    date: "06/24",
  },
  {
    id: "0x3",
    isWork: true,
    title: "Agent Experience",
    description:
      "0xRogueAgent is an AI-driven agent project powered by its native $ROGUE token on the Solana blockchain. It combines decentralized technology with advanced AI to deliver innovative, mission-based experiences. The $ROGUE token plays a central role in the ecosystem, enabling users to engage with the AI agent, unlock features, and participate in governance.",
    stack: {
      fe: ["react", "typescript", "tailwind", "shadcn", "reactQuery", "solana"],
    },
    links: {
      web: "https://agentexperience.live/",
      other:
        "https://dexscreener.com/solana/bgzm2era3ifpkcmb4w49of3cj9ruverxzhe2pzbbp8tv",
    },
    thumbnail: "/projects/project_agent_exp.JPG",
    date: "03/25",
  },
  {
    id: "0x5",
    isWork: true,
    title: "Node Explorer",
    description:
      "Node Explorer is a node management platform enabling users to delegate and manage PlayAI Oasis Nodes for task execution, earning PlayAI Coins while ensuring efficient off-chain computation and AI model integrity.",
    stack: {
      fe: [
        "react",
        "typescript",
        "reactQuery",
        "wagmi",
        "chakraui",
        // "recharts",
      ],
    },
    links: {
      twitter: "https://x.com/playAInetwork",
      web: "https://nodeexplorer.playai.network/",
    },
    thumbnail: "/projects/project_node_exp.JPG",
    date: "09/24",
  },
];
const Work = () => {
  return (
    <div className="text-sm grid gap-3" id="work">
      <SectionTitle
        title="Work & Experience"
        icon={<Briefcase className={"w-4 h-4"} />}
      />

      <div className="grid gap-3">
        <div className="flex justify-between">
          <div className="grid gap-1">
            <a
              className="flex items-center gap-1 font-sans text-[1rem]"
              href="https://x.com/playAInetwork"
              target="_blank"
            >
              <img
                src="./images/dehidden_logo.jpeg"
                alt="dehidden.com"
                className="w-[20px] h-[20px] rounded-md"
              />
              <span>Dehidden</span>
            </a>
            <span className="text-secondary-foreground">
              {"Frontend Developer (Web3)"}
            </span>
          </div>
          <p className="text-muted-foreground">Jan, 2022 - Present</p>
        </div>
        <div className="grid grid-cols-2 gap-4 -sm:grid-cols-1 place-items-center">
          {projects?.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}{" "}
        </div>
      </div>
    </div>
  );
};

export default Work;
