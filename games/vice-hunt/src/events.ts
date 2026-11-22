import type { Kind } from "./creatures";

// Everything the world reports to its host, pushed onto `world.events` and
// taken each frame with `drain(world)`. Positions are CSS px in the world.
export type GameEvent =
  | { type: "hit"; kind: Kind; n: number; of?: number; x: number; y: number } // `of` is left out for UFO and Bigfoot
  | { type: "kill"; kind: Kind; x: number; y: number; streak: number }
  | { type: "penalty"; kind: Kind; points: number; x: number; y: number }
  | { type: "damage"; hearts: number; source: Kind; x: number; y: number } // `hearts`: what is left after the hit
  | { type: "rare"; kind: Kind; event: "appeared" | "met" }
  | { type: "escaped"; kind: Kind; x: number; y: number } // the merman's window lapsed ("TOO SLOW")
  | { type: "callout"; text: "PFFT!" | "SPLAT!" | "HSSSS!" | "ANGRY!"; x: number; y: number } // the app pops the words
  | { type: "wasted" };
