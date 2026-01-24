import React from "react";
import Intro from "./Intro";

const About = () => {
  return (
    <div className="space-y-6">
      <Intro />
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Hey there! I'm Shashwat, a frontend developer who also works across the
          full stack. I build clean, functional, and user-friendly web
          applications with a focus on great design and seamless user experiences.
        </p>
        <p>
          Feel free to reach out at{" "}
          <a
            href="mailto:contact@shashwa7.in"
            className="text-foreground underline underline-offset-4 decoration-accent hover:decoration-2 transition-all"
          >
            contact@shashwa7.in
          </a>{" "}
          — whether you have questions, ideas to share, or just want to chat!
        </p>
      </div>
    </div>
  );
};

export default About;
