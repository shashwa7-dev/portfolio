import { startHunt } from "../src/index";
import { KINDS, type Kind } from "../src/creatures";

const host = document.getElementById("host")!;
const muted = !new URLSearchParams(location.search).has("sound");
const log = (...args: unknown[]) => console.log("[vice-hunt]", ...args);

const wanted = (new URLSearchParams(location.search).get("spawn") ?? "").split(",");
const hunt = startHunt(host, {
  muted,
  spawn: wanted.filter((k): k is Kind => (KINDS as readonly string[]).includes(k)),
  onKills: (kills) => log("kills", kills),
  onShot: (x, y, hit) => log("shot", Math.round(x), Math.round(y), hit),
  onExit: () => {
    hunt.destroy();
    log("exited");
  },
});
