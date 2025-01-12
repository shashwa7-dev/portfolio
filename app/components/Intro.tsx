const Intro = () => {
  return (
    <div className="mt-2">
      <div className="grid grid-cols-[1fr_auto]">
        <div className="flex flex-col relative">
          <h1 className=" text-2xl font-black text-s7-gray_graphite">
            {"Shashwat Tripathi"}
          </h1>
          <h2 className="font-bold w-fit text-gray-500">
            {"Frontend Focused . Fullstack Developer"}
          </h2>
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
