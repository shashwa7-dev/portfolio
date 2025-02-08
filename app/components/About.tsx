import React from "react";
import { Link } from "./common/Link";

const About = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium border-b text-secondary-foreground font-sans">
        About
      </p>
      <p>
        Hey there! I’m Shashwat—a curious builder and problem solver who loves
        turning ideas into elegant digital solutions. With a knack for crafting
        sleek interfaces and seamless user experiences, I’m always on the
        lookout for new challenges. Lately, I’ve been diving deep into the
        fascinating world of AI and machine learning, exploring how they can
        shape the future of technology.
      </p>
      <p>
        Feel free to reach out
        <a
          href="mailto:contact@shashwa7.in"
          className="px-1 text-xs border font-medium text-secondary-foreground rounded-md border-b-[2.5px]  mx-1 lowercase inline-block"
        >
          {" contact@shashwa7.in "}
        </a>
        whether you have questions, ideas to share, or just want to chat!
      </p>
    </div>
  );
};

export default About;
