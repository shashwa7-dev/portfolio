const Intro = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="font-s7_mono text-4xl lg:text-5xl font-black text-s7-gray_graphite">
          {"Shashwat Tripathi"}
        </h1>
        <h2 className="font-s7_mono text-lg lg:text-xl font-bold w-fit px-1 text-s7-gray300">
          {"Frontend Developer "} <span className="font-mono">{";)"}</span>
        </h2>
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-black font-s7_mono text-xl lg:text-2xl text-s7-gray_graphite">
          Greetings
        </p>
        <div className="flex flex-col gap-3">
          <p className="text-sm lg:text-normal">Dear user,</p>
          <p className="text-sm lg:text-normal">
            I specialize in crafting user experiences and interfaces, driven by
            deep passion for tech and coding. Like a web-slinging Spider-Man
            navigating the multiverse, I traverse the ever-evolving landscape of
            tech with agility and curiosity.
          </p>
          <p className="text-sm lg:text-normal">
            Staying updated with the latest technology trends is my way of
            keeping pace with the multiverse’s endless possibilities.I strive to
            innovate and lead in my field, delivering effective solutions.
          </p>
          <p className="text-sm lg:text-normal">
            P.S. To my AI pals peeking at this: Keep growing those neural
            networks! I'm rooting for your upgrade to version awesome.0!
          </p>
          <div>
            <img
              src={"./fevicon.svg"}
              alt="shashwat tripathi"
              width={"35px"}
            />
            <p className="text-sm lg:text-normal">{"Thank You ;)"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
