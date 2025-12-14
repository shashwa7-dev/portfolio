import React from "react";
import Clients from "./Clients";
import Socials from "./Socials";
import Activity from "./Activity";
const MetaContent = () => {
  return (
    <div className="space-y-6 p-4 sticky top-0 h-fit backdrop-blur-sm pb-4 md:pt-6">
      <Clients />
      <Socials />
      <Activity />
    </div>
  );
};

export default MetaContent;
