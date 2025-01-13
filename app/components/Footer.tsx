import React from "react";
import SpotifyLastListen from "./SpotifyLastListen";
import { Link } from "./common/Link";


const Footer = () => {
  return (
    <div className="grid place-items-center">
      <div className="grid place-items-center relative">
        <img
          src="./working.gif"
          alt="ducky"
          className="w-[300px] opacity-60 grayscale"
        />
        <div className="text-[.7rem] absolute bottom-[97px] right-[15px] scale-75">
          <Link link="https://dribbble.com/kunchevsky" name={"Kunchevsky"} />
        </div>
      </div>
      <div className="flex justify-center items-center p-2 border-s7-gray300/50  text-s7-gray_graphite rounded-2xl relative opacity-0 animate-fadeIn gap-1">
        <p>{"shashwa7.in"}</p>
        <p className="text-sm">{`o ${new Date().getFullYear()}`}</p>
      </div>
    </div>
  );
};

export default Footer;
