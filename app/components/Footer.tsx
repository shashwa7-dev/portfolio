import React from "react";
import SpotifyLastListen from "./SpotifyLastListen";

const Footer = () => {
  return (
    <div className="flex justify-center items-center mt-auto p-2 border-t gap-2 relative">
      <p>{"shashwa7.in"}</p>
      <SpotifyLastListen />
      <p className="text-sm">{`${new Date().getFullYear()}`}</p>
    </div>
  );
};

export default Footer;
