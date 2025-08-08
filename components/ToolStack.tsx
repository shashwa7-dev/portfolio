import React from "react";
import { Marquee } from "./common/Marquee";

const tools = [
  { name: "aws", img: "/tools/tool_aws.svg" },
  { name: "cloudflare", img: "/tools/tool_cloudflare.svg" },
  { name: "docker", img: "/tools/tool_docker.svg" },
  { name: "figma", img: "/tools/tool_figma.svg" },
  { name: "firebase", img: "/tools/tool_firebase.svg" },
  { name: "git", img: "/tools/tool_git.svg" },
  { name: "github", img: "/tools/tool_github.svg" },
  { name: "graphql", img: "/tools/tool_graphql.svg" },
  { name: "gsap", img: "/tools/tool_gsap.svg" },
  { name: "js", img: "/tools/tool_js.svg" },
  { name: "mongodb", img: "/tools/tool_mongodb.svg" },
  { name: "nextjs2", img: "/tools/tool_nextjs2.svg" },
  { name: "nodejs", img: "/tools/tool_nodejs.svg" },
  { name: "notion", img: "/tools/tool_notion.png" },
  { name: "postgresql", img: "/tools/tool_postgresql.svg" },
  { name: "postman", img: "/tools/tool_postman.svg" },
  { name: "pwa", img: "/tools/tool_pwa.svg" },
  { name: "react", img: "/tools/tool_react.svg" },
  { name: "tailwind", img: "/tools/tool_tailwindcss.svg" },
  { name: "supabase", img: "/tools/tool_supabase.svg" },
  { name: "ts", img: "/tools/tool_typescript.svg" },
  { name: "vscode", img: "/tools/tool_vscode.svg" },
  { name: "reactquery", img: "/tools/tool_reactquery.svg" },
  { name: "shadcnui", img: "/tools/tool_shadcnui.png" },
];
const ToolsAndStack = () => {
  return (
    <div className="max-w-sm -md:max-w-[80dvw] -sm:max-w-[60dvw]">
      <Marquee fade>
        {tools?.map((tool) => (
          <div
            key={tool.name}
            className="items-center text-xs gap-1 cursor-pointer hover:scale-95 transition-all"
          >
            <img src={tool.img} className="w-[20px]" />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default ToolsAndStack;
