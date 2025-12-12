import React from "react";
import { TProject } from "./Project";
import ProjectCard from "./PorjectCard";
import { Coffee } from "feather-icons-react";
import SectionTitle from "./common/SectionTitle";
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
      // web: "https://eatri8-ai.shashwa7.in/",
    },
    preview: "/projects/preview_eatri8.mp4",
    thumbnail: "/projects/project_eatri8.JPG",
  },
];
const Projects = () => {
  return (
    <div className="text-sm grid gap-3">
      <SectionTitle
        title="Side Quests"
        icon={<Coffee className={"w-4 h-4"} />}
      />
      <div className="grid gap-4">
        <div className="flex justify-between">
          <div className="grid">
            <a
              className="flex items-center gap-1 font-sans text-[1rem]"
              href="https://x.com/offcod8"
              target="_blank"
            >
              <img
                src="./images/offcod8.webp"
                alt="offcod8"
                className="w-[20px] h-[20px] rounded-md border"
              />
              <span>offcod8</span>
            </a>
            <span className="text-secondary-foreground">Lab of Codes</span>
          </div>
          <p className="text-muted-foreground">Jan, 2021 - Present</p>
        </div>
        <div className="grid grid-cols-2 gap-6 -sm:grid-cols-1 place-items-center">
          {projects?.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
