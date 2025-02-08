import React from "react";

const Footer = () => {
  return (
    <div className="grid place-items-center relative  overflow-hidden p-4 pb-0 rounded-t  opacity-0 animate-fadeIn">
      <div className="grid place-items-center h-[150px] -md:h-[100px] overflow-hidden rounded-t-md opacity-70">
        <img
          src="./images/chill.jpg"
          alt="ducky"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex justify-center items-center p-1 text-secondary-foreground rounded-md  px-2 gap-1 absolute -bottom-[10px] pb-2 bg-background">
        <p>{"shashwa7.in"}</p>
        <p className="text-sm">{`o ${new Date().getFullYear()}`}</p>
      </div>
    </div>
  );
};

export default Footer;
