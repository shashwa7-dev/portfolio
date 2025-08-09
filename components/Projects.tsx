import React from "react";
import { TProject } from "./Project";
import ProjectCard from "./PorjectCard";
const projects: TProject[] = [
  {
    id: "1",
    title: "Eatri8.ai",
    isActive: true,
    description:
      "Built a health assessment app that uses Google Gemini Flash 1.5 AI to analyze food products. Users upload food labels to get a health score, recommended portion sizes, and consumption advice.",
    stack: {
      fe: [
        "next/ts",
        "@google/generative-ai",
        "gemini-flash(1.5)",
        "tailwind/shadcn",
      ],
    },
    links: {
      github: "https://github.com/shashwa7-dev/food-analyzer",
      web: "https://eatri8-ai.shashwa7.in/",
    },
    preview: "/projects/preview_eatri8.mp4",
    thumbnail: "/projects/project_eatri8.JPG",
  },
];
const Projects = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium border-b text-secondary-foreground font-sans">
        {"Side Quests"}
      </p>
      <div className="grid gap-2 -md:place-items-center">
        {projects?.map((project) => (
          <ProjectCard project={project} key={project.id} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
