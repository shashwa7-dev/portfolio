import React from "react";

const Footer = () => {
  return (
    <div className="flex justify-center align-middle mt-auto py-4 border-t gap-0 relative">
      {" "}
      <p className="text-sm font-s7_mono pt-1">{"Copyright - "}</p>{" "}
      <div className="w-[20px]">
        <img
          src={"./images/pixel.png"}
          alt="shashwat tripathi"
          className="opacity-50"
        />
      </div>{" "}
      <p className="text-sm font-s7_mono pt-1">{" / S7.dev - 2024"}</p>{" "}
    </div>
  );
};

export default Footer;
