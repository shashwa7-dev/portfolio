import React from "react";
import Intro from "./Intro";

const About = () => {
  return (
    <div className="text-sm grid gap-3 relative">
      <Intro />
      <p>
        Hey there! I’m Shashwat, a frontend developer who also works across the
        full stack. I build clean, functional, and user-friendly web
        applications with a focus on great design and seamless user experiences.
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
