import React from "react";
import Project, { TProject } from "./Project";
const projects: TProject[] = [
  {
    id: "1",
    title: "Agent Experience",
    description:
      "0xRogueAgent is an AI-driven agent project powered by its native $ROGUE token on the Solana blockchain. It combines decentralized technology with advanced AI to deliver innovative, mission-based experiences. The $ROGUE token plays a central role in the ecosystem, enabling users to engage with the AI agent, unlock features, and participate in governance.",
    stack: ["react/ts", "solana-adapter", "tailwind/shadcn"],
    links: {
      twitter: "https://x.com/0xRogueAgent",
      twitch: "https://www.twitch.tv/theagentexperience",
      web: "https://agentexperience.live/",
      other: "https://www.cookie.fun/en/agent/agent-rogue",
    },
    thumbnail: "/projects/project_agent_exp.jpg",
  },
  {
    id: "2",
    title: "Node Explorer",
    description:
      "Node Explorer is a node management platform enabling users to delegate and manage PlayAI Oasis Nodes for task execution, earning PlayAI Coins while ensuring efficient off-chain computation and AI model integrity.",
    stack: [
      "react/ts",
      "react-query",
      "wagmi (contract)",
      "reown-appkit (wallet)",
      "chakra",
      "recharts",
    ],
    links: {
      twitter: "https://x.com/playAInetwork",
      web: "https://nodeexplorer.playai.network/",
    },
    thumbnail: "/projects/project_node_exp.jpg",
  },
  {
    id: "3",
    title: "PlayAI.network",
    description:
      "I have build the landing page for PlayAI, an innovative AI-driven platform designed to enhance the gaming experience. PlayAI leverages advanced machine learning models to provide real-time assistance, strategic insights, and personalized coaching for gamers across various genres.",
    stack: ["react/ts", "styled-components", "gsap", "motion"],
    thumbnail: "/projects/project_playai.jpg",
    preview: "/projects/preview_playai.mp4",
    links: {
      twitter: "https://x.com/playAInetwork",
      web: "https://playai.network/",
    },
  },
];
const Work = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium border-b">My Work</p>
      <div className="grid gap-2">
        {projects?.map((project) => (
          <Project project={project} key={project.id} />
        ))}
      </div>
    </div>
  );
};

export default Work;
