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
    stack: { fe: ["react/ts", "tailwind/shadcn", "@tanstack/react-query"] },
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
      fe: [
        "react/ts",
        "framer/motion",
        "tailwind/shadcn",
        "@tanstack/react-query",
      ],
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
    id: "0x3",
    isWork: true,
    title: "Agent Experience",
    description:
      "0xRogueAgent is an AI-driven agent project powered by its native $ROGUE token on the Solana blockchain. It combines decentralized technology with advanced AI to deliver innovative, mission-based experiences. The $ROGUE token plays a central role in the ecosystem, enabling users to engage with the AI agent, unlock features, and participate in governance.",
    stack: { fe: ["react/ts", "solana-adapter", "tailwind/shadcn"] },
    links: {
      web: "https://agentexperience.live/",
      other:
        "https://dexscreener.com/solana/bgzm2era3ifpkcmb4w49of3cj9ruverxzhe2pzbbp8tv",
    },
    thumbnail: "/projects/project_agent_exp.JPG",
    date: "3/25",
  },
  {
    id: "0x4",
    isWork: true,
    title: "$ROGUE Token SOL Tracker",
    description: `The Solana Token Transfer Tracker is a Node.js-based REST API service that monitors and analyzes token transfer transactions on the Solana blockchain. The service specifically tracks transfers for a designated token contract, providing detailed transaction history and wallet analytics.`,
    stack: {
      be: ["node/js", "express", "solana/web3.js"],
    },
    links: {
      github: "https://github.com/shashwa7-dev/rouge-token-tracker",
    },
    thumbnail: "/projects/project_sol_tracker.jpg",
    date: "3/25",
  },
  {
    id: "0x5",
    isWork: true,
    title: "Node Explorer",
    description:
      "Node Explorer is a node management platform enabling users to delegate and manage PlayAI Oasis Nodes for task execution, earning PlayAI Coins while ensuring efficient off-chain computation and AI model integrity.",
    stack: {
      fe: [
        "react/ts",
        "react-query",
        "wagmi (contract)",
        "reown-appkit (wallet)",
        "chakra",
        "recharts",
      ],
    },
    links: {
      twitter: "https://x.com/playAInetwork",
      web: "https://nodeexplorer.playai.network/",
    },
    thumbnail: "/projects/project_node_exp.JPG",
    date: "9/24",
  },
  {
    id: "0x6",
    isWork: true,
    title: "PlayAI.network",
    description:
      "I have build the landing page for PlayAI, an innovative AI-driven platform designed to enhance the gaming experience. PlayAI leverages advanced machine learning models to provide real-time assistance, strategic insights, and personalized coaching for gamers across various genres.",
    stack: { fe: ["react/ts", "styled-components", "gsap", "motion"] },
    thumbnail: "/projects/project_playai.JPG",
    preview: "/projects/preview_playai.mp4",
    links: {
      twitter: "https://x.com/playAInetwork",
      web: "https://playai.network/",
    },
    date: "6/24",
  },
];
const Work = () => {
  return (
    <div className="text-sm grid gap-3">
      <SectionTitle
        title="Work & Experience"
        icon={<Briefcase className={"w-4 h-4"} />}
      />

      <div className="grid gap-4">
        <div className="flex justify-between">
          <div className="grid">
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
            <span className="text-secondary-foreground">Web3 Frontend Consultant</span>
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
