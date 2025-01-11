import React from "react";
import { Stack } from "./Project";

const TechStack = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium border-b">Tech Stack</p>
      <div className="grid gap-2">
        <p>Frontend</p>
        <div className="flex flex-wrap gap-2">
          <Stack name={"Typescript"} />
          <Stack name={"React"} />
          <Stack name={"Next"} />
          <Stack name={"Tailwind CSS"} />
          <Stack name={"GSAP"} />
          <Stack name={"Motion"} />
        </div>
      </div>
      <div className="grid gap-2">
        <p>Backend</p>
        <div className="flex flex-wrap gap-2">
          <Stack name={"Node JS"} />
          <Stack name={"Postgress (SQL)"} />
          <Stack name={"MongoDB (No-SQL)"} />
          <Stack name={"Firebase (No-SQL)"} />
          <Stack name={"AWS (Cloud)"} />
          <Stack name={"Docker"} />
        </div>
      </div>
    </div>
  );
};

export default TechStack;
