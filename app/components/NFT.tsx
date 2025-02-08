"use client";

import { useState } from "react";

const NFT = ({
  name,
  preview,
  url,
}: {
  name: string;
  preview: string;
  url: string;
}) => {
  const [showNftName, setShowNftName] = useState(false);
  const handleMouseEnter = () => {
    setShowNftName(true);
  };

  const handleMouseLeave = () => {
    setShowNftName(false);
  };

  return (
    <div
      onClick={() => {
        window.open(url, "_blank");
      }}
    >
      <div
        className="w-[30px] h-[30px] rounded-md relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          src={preview}
          autoPlay
          poster="/s7dev.png"
          loop
          muted
          playsInline
          className="rounded-md"
        />
        {showNftName && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-1 bg-s7-gray100 font-bold text-secondary-foreground text-[0.5rem] rounded whitespace-nowrap">
            {name}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFT;
