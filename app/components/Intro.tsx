import SpotifyLastListen from "./SpotifyLastListen";

const Intro = () => {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-300 pb-2">
      <div className="flex flex-col relative">
        <img
          src="./new-prof.png"
          alt="shashwa7.in"
          className="w-[50px] h-[50px] rounded-md absolute top-0
          right-0"
        />
        <div className="absolute -top-2 -right-2">
          <SpotifyLastListen />
        </div>
        <h1 className=" text-xl font-black text-s7-gray_graphite">
          {"Shashwat Tripathi"}
        </h1>
        <h2 className="font-bold w-fit text-gray-500">{"Web App Developer"}</h2>
      </div>
      <p className="-md:text-sm">
        I<span className="font-medium italic text-pink-500">{" love "}</span>
        to craft
        <span className="font-medium">{" user experiences "}</span>
        and
        <span className="font-medium">{" interfaces. "}</span>
      </p>
    </div>
  );
};

export default Intro;
