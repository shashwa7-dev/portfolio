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
    thumbnail: "/projects/project_agent_exp.JPG",
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
    thumbnail: "/projects/project_node_exp.JPG",
  },
  {
    id: "3",
    title: "PlayAI.network",
    description:
      "I have build the landing page for PlayAI, an innovative AI-driven platform designed to enhance the gaming experience. PlayAI leverages advanced machine learning models to provide real-time assistance, strategic insights, and personalized coaching for gamers across various genres.",
    stack: ["react/ts", "styled-components", "gsap", "motion"],
    thumbnail: "/projects/project_playai.JPG",
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
      <div className="flex justify-between border-b pb-1">
        <p className="text-lg font-medium text-s7-gray_graphite">
          Work & Experience
        </p>
      </div>
      <div className="grid gap-2">
        <div className="flex justify-between mb-1">
          <div className="grid">
            <span>Frontend Engineer</span>
            <a
              className="flex items-center gap-1"
              href="https://x.com/playAInetwork"
              target="_blank"
            >
              <img
                src="./images/dehidden_logo.jpeg"
                alt="dehidden.com"
                className="w-[10px] h-[10px] rounded-sm"
              />
              <span>Dehidden</span>
            </a>
          </div>
          <p className="text-gray-500">Jan, 2022 - Present</p>
        </div>
        {projects?.map((project) => (
          <Project project={project} key={project.id} />
        ))}
      </div>
    </div>
  );
};

export default Work;
