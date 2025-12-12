import React from "react";
import Intro from "./Intro";

const About = () => {
  return (
    <div className="text-sm grid gap-3 relative">
      <Intro />
      <p>
        Hey there! I’m Shashwat, a curious builder and problem solver who loves
        turning ideas into elegant digital solutions. With a knack for crafting
        sleek interfaces and seamless user experiences, I’m always on the
        lookout for new challenges.
      </p>
      <p>
        Feel free to reach out
        <a
          href="mailto:contact@shashwa7.in"
          className="px-1  border font-medium text-secondary-foreground rounded-md border-b-[2.5px]  mx-1 lowercase inline-block font-sans text-md"
        >
          {" contact@shashwa7.in "}
        </a>
        whether you have questions, ideas to share, or just want to chat!
      </p>
    </div>
  );
};

export default About;
