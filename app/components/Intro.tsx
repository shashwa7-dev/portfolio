const Intro = () => {
  return (
    <div className="mt-2">
      <div className="grid grid-cols-[1fr_auto]">
        <div className="flex flex-col relative">
          <h1 className=" text-2xl font-black text-s7-gray_graphite">
            {"Shashwat Tripathi"}
          </h1>
          <h2 className="font-bold w-fit text-gray-500">
            {"Full-Stack Web Developer"}
          </h2>
          <div className="text-sm w-fit border-t mt-1 pt-1">
            <div className="flex gap-1 items-center">
              <span>Frontend dev at</span>
              <a
                className="flex items-center gap-1"
                href="https://x.com/playAInetwork"
                target="_blank"
              >
                <img
                  src="./images/dehidden_logo.jpeg"
                  alt="dehidden.com"
                  className="w-[10px] h-[10px] rounded-sm"
                />
                <span>Dehidden</span>
              </a>
            </div>
            <p className="text-gray-500 text-xs">Jan, 2022 - Present</p>
          </div>
        </div>
        <img
          src="./new-prof.png"
          alt="shashwa7.in"
          className="w-[60px] h-[60px] rounded-md"
        />
      </div>
    </div>
  );
};

export default Intro;
