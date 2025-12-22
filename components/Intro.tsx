import React from "react";
import ToolsAndStack from "./ToolStack";
import Navbar from "./Navbar";
import { buttonClasses } from "./common/Button/button.styles";

const Intro = () => {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col relative max-w-[80%]">
        <div className="flex relative w-fit">
          <h1 className="text-3xl mb-0.5 -md:text-2xl  text-secondary-foreground font-sans">
            {"Shashwat Tripathi"}
          </h1>
        </div>
        <h2 className="font-bold text-base md:text-lg w-fit text-muted-foreground mb-2">
          <span className="text-amber-500">{"Frontend Engineer"}</span>
          {" . Fullstack Capable"}
        </h2>
        <div className="flex items-center">
          <div
            className={buttonClasses({
              size: "sm",
              variant: "primary",
              className: "!flex-shrink-0",
            })}
          >
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
