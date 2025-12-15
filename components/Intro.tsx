import React from "react";
import ToolsAndStack from "./ToolStack";
import Navbar from "./Navbar";

const Intro = () => {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col relative max-w-[80%]">
        <h1 className="text-3xl mb-0.5 -md:text-2xl  text-secondary-foreground font-sans">
          {"Shashwat Tripathi"}
        </h1>
        <h2 className="font-bold text-base md:text-lg w-fit text-muted-foreground mb-2">
          <span className="text-amber-500">{"Frontend Engineer"}</span>{" . Fullstack Capable"}
        </h2>
        <div className="flex items-center">
          <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground border p-0.5 px-2 rounded-xl w-fit bg-card font-bold shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Open to Work</span>
          </div>
          <ToolsAndStack />
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Intro;
