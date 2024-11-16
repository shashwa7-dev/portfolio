import React from "react";
import SpotifyLastListen from "./SpotifyLastListen";

const Footer = () => {
  return (
    <div className="flex justify-center items-center mt-auto p-4 border-s7-gray300/50  rounded-2xl gap-2 relative opacity-0 animate-fadeIn">
      <p>{"shashwa7.in"}</p>
      <SpotifyLastListen />
      <p className="text-sm">{`${new Date().getFullYear()}`}</p>
    </div>
  );
};

export default Footer;
