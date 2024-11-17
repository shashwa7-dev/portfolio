import NFT from "./NFT";

const CurrentState = () => {
  return (
    <div className="grid grid-cols-2 gap-4 -md:grid-cols-1 -md:gap-2 text-sm">
      <div>
        <p className="font-bold">Building</p>
        <div className="flex gap-1">
          <a href="https://playai.network/" target="_blank">
            {"PlayAI,"}
          </a>
          <a href="https://nodeexplorer.playai.network/" target="_blank">
            {"Node Explorer"}
          </a>
        </div>
      </div>
      <div>
        <p className="font-bold">Projects</p>
        <a href="https://eatri8-ai.shashwa7.in/" target="_blank">
          EATRi8_AI
        </a>
      </div>
      <div>
        <p className="font-bold">Stack</p>
        <p>
          <span className="font-bold">{"App: "}</span> React JS, Node JS,
          Typescript
        </p>
        <p>
          <span className="font-bold">{"Ui: "}</span>Tailwind, Chakra, GSAP,
          Framer
        </p>
        <p>
          <span className="font-bold">{"Vc: "}</span>Github
        </p>
      </div>
      <div>
        <p className="font-bold">Connect</p>
        <div>
          <span className="font-bold">Email: </span>
          <span>contact@shashwa7.in</span>
        </div>
        <div>
          <span className="font-bold">Social: </span>
          <a href="http://github.shashwa7.in/" target="_blank">
            {"Github, "}
          </a>
          <a href="https://x.com/shashwa7-dev" target="_blank">
            {"Twitter, "}
          </a>
          <a href="https://www.linkedin.com/in/shashwa7/" target="_blank">
            In
          </a>
        </div>
      </div>
      <div>
        <p className="font-bold">NFTs</p>
        <div className="flex justify-start items-center gap-2">
          <NFT
            name="Val-Zod, Superman"
            preview="https://assets.candy.io/DC_VIDEO/c59b532f-fde1-4206-bf0e-f0547c0c7680/CD_VFX_V13_SM.mp4"
            url="https://www.candy.io/dc/editions/6752f03a-5c2c-4661-9947-de97b14b7541"
          />
          <NFT
            name="Celio X Emiway"
            preview="https://raw.seadn.io/files/b6c56f2fa5b3178119b34319599218a1.mp4"
            url="https://assets.candy.io/DC_VIDEO/c59b532f-fde1-4206-bf0e-f0547c0c7680/CD_VFX_V13_SM.mp4"
          />
          <NFT
            name="S7.DEV(Testnet)"
            preview=""
            url="https://testnets.opensea.io/assets/mumbai/0x1bc8d22c08620ac528e5a4ca359b4ec106958a18/0"
          />
        </div>
      </div>
      <div>
        <p className="font-bold">Location</p>
        <p>Silvassa, D&NH, India</p>
      </div>
    </div>
  );
};

export default CurrentState;
