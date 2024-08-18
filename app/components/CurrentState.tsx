import React from "react";
import SpotifyLastListen from "./SpotifyLastListen";
import IST24HourClock from "./IST24HourClock";

const CurrentState = () => {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-black font-s7_mono text-xl lg:text-2xl text-s7-gray_graphite">
        Current Stats
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-sm lg:text-normal">
          <span className="font-bold">Location:</span> Silvassa, D&NH, India
        </p>
        <div className="text-sm lg:text-normal flex gap-2 align-top">
          <p className="font-bold">Building:</p>
          <a href="https://playai.network/" target="_blank">
            @PlayAI,
          </a>
          <a href="https://x.com/sentient_agi" target="_blank">
            @SentientAI
          </a>
        </div>
        <div className="text-sm lg:text-normal flex gap-2 align-top">
          <p className="font-bold">Projects:</p>
          <a href="https://eatri8-ai.vercel.app/" target="_blank">
            @EATRi8_AI
          </a>
        </div>
        <p className="text-sm lg:text-normal">
          <span className="font-bold">Tools:</span>{" "}
          {"Next/React/Node[JS], Chakra/Tailwind[UI], GSAP/Framer[MX]"}
        </p>
        <div className="text-sm lg:text-normal flex gap-2 align-top">
          <p className="font-bold">Socials:</p>
          <a href="https://github.com/shashwa7-dev" target="_blank">
            Github,
          </a>
          <a href="https://x.com/theWebKid" target="_blank">
            Twitter,
          </a>
          <a href="https://www.linkedin.com/in/shashwa7/" target="_blank">
            In
          </a>
        </div>
        <p className="text-sm lg:text-normal">
          <span className="font-bold">Email: </span>
          <span>shashwa7.dev@gmail.com</span>
        </p>
        <SpotifyLastListen />
        <IST24HourClock />
      </div>
    </div>
  );
};

export default CurrentState;
