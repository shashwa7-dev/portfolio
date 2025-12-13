import React from "react";
import ToolsAndStack from "./ToolStack";
import Navbar from "./Navbar";

const Intro = () => {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col relative">
        <h1 className="text-3xl  leading-none -md:text-2xl  text-secondary-foreground font-sans">
          {"Shashwat Tripathi"}
        </h1>
        <h2 className="font-bold w-fit text-muted-foreground mb-2">
          {"Frontend Focused . Fullstack Developer"}
        </h2>
        <ToolsAndStack />
      </div>
      <Navbar />
    </div>
  );
};

export default Intro;
