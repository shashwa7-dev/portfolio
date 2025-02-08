import React from "react";
import { Social } from "./Project";

const Socials = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium border-b text-secondary-foreground font-sans">
        Socials
      </p>
      <div className="flex flex-wrap gap-2">
        <Social type="github" link="https://github.com/shashwa7-dev" />
        <Social type="linked" link="https://www.linkedin.com/in/shashwa7/" />
        <Social type="twitter" link="https://x.com/shashwa7_" />
      </div>
    </div>
  );
};

export default Socials;
