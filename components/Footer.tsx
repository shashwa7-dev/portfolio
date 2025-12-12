import React from "react";

const Footer = () => {
  return (
    <div className="grid place-items-center relative  overflow-hidden p-2 pb-0 rounded-t  opacity-0 animate-fadeIn">
      <div className="grid place-items-center w-full h-[120px] -md:h-[70px] overflow-hidden rounded-t-md opacity-10 grayscale">
        <img
          src="./images/bg.gif"
          alt="footer-image"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex justify-center items-center p-1 text-secondary-foreground rounded-md  px-2 gap-1 absolute -bottom-[10px] pb-3 bg-background">
        <p>{"shashwa7.in"}</p>
        <p className="text-sm">{`o ${new Date().getFullYear()}`}</p>
      </div>
    </div>
  );
};

export default Footer;
