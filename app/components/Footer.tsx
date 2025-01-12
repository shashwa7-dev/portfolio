import React from "react";
import SpotifyLastListen from "./SpotifyLastListen";

const Footer = () => {
  return (
    <div className="flex justify-center items-center mt-auto p-4 border-s7-gray300/50  text-s7-gray_graphite rounded-2xl relative opacity-0 animate-fadeIn gap-1">
      <p>{"shashwa7.in"}</p>
      <p className="text-sm">{`o ${new Date().getFullYear()}`}</p>
    </div>
  );
};

export default Footer;
