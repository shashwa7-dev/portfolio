import { startHunt } from "../src/index";

const host = document.getElementById("host")!;
const muted = !new URLSearchParams(location.search).has("sound");
const log = (...args: unknown[]) => console.log("[vice-hunt]", ...args);

const hunt = startHunt(host, {
  muted,
  onKills: (kills) => log("kills", kills),
  onShot: (x, y, hit) => log("shot", Math.round(x), Math.round(y), hit),
  onExit: () => {
    hunt.destroy();
    log("exited");
  },
});
