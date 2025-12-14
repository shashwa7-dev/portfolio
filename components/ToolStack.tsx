import React from "react";
import { Marquee } from "./common/Marquee";
import StackIcon, { StackName } from "./common/StackIcon";

const tools: StackName[] = [
  "html",
  "css",
  "javascript",
  "typescript",
  "react",
  "next",
  "github",
  "git",
  "zustand",
  "tailwind",
  "shadcn",
  "chakraui",
  "styledComponents",
  "motion",
  "gsap",
  "wagmi",
  "solana",
  "electron",
  "node",
  "express",
  "mongodb",
  "supabase",
  "firebase",
  "postgres",
  "bun",
  "cloudflare",
  "vercel",
  "aws",
];
const ToolsAndStack = () => {
  return (
    <div className="max-w-sm -md:max-w-[60dvw] -sm:max-w-[50dvw]">
      <Marquee fade>
        {tools?.map((tool) => (
          <StackIcon key={tool} name={tool} showLabel={false} size={20} />
        ))}
      </Marquee>
    </div>
  );
};

export default ToolsAndStack;
