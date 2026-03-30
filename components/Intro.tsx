import React from "react";
import ToolsAndStack from "./ToolStack";

const Intro = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 overflow-hidden rounded-full ring-2 ring-border">
          <img
            src="./apple-touch-icon.png"
            className="w-full h-full object-cover"
            alt="Shashwat Tripathi"
          />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Shashwat Tripathi
          </h1>
          <p className="text-muted-foreground">
            <span className="text-accent font-medium">Frontend Engineer</span>
            <span>{" [ Fullstack Capable ]"}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="mailto:contact@shashwa7.in"
          className="inline-flex items-center gap-2 border text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-[background-color,transform] duration-150 active:scale-[0.97]"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-medium">Open to Work</span>
        </a>
        <ToolsAndStack />
      </div>
    </div>
  );
};

export default Intro;
