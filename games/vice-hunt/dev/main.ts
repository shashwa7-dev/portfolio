import { startHunt } from "../src/index";
import { KINDS, type Kind } from "../src/creatures";

const host = document.getElementById("host")!;
const muted = !new URLSearchParams(location.search).has("sound");
const log = (...args: unknown[]) => console.log("[vice-hunt]", ...args);

const kinds = (param: string): Kind[] =>
  (new URLSearchParams(location.search).get(param) ?? "")
    .split(",")
    .filter((k): k is Kind => (KINDS as readonly string[]).includes(k));
const hunt = startHunt(host, {
  muted,
  spawn: kinds("spawn"),
  finish: kinds("shoot"), // ?shoot=ufo lands the hits that finish it
  onKills: (kills) => log("kills", kills),
  onShot: (x, y, hit) => log("shot", Math.round(x), Math.round(y), hit),
  onExit: () => {
    hunt.destroy();
    log("exited");
  },
});
