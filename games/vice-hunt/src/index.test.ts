import { describe, expect, it } from "vitest";
import type { GameEvent } from "./events";
import { type HuntOptions, toCallbacks } from "./index";

// Every callback the mapper can reach, recording [name, ...args] in call order.
function recorder() {
  const calls: unknown[][] = [];
  const rec =
    (name: string) =>
    (...args: unknown[]) =>
      void calls.push([name, ...args]);
  const options: HuntOptions = {
    onHit: rec("hit"),
    onKill: rec("kill"),
    onPenalty: rec("penalty"),
    onHealth: rec("health"),
    onRare: rec("rare"),
    onEscaped: rec("escaped"),
    onCallout: rec("callout"),
    onWasted: rec("wasted"),
  };
  return { calls, options };
}

// World px to host px: the layer sits 10 px in and 20 px down in its host.
const toHost = (x: number, y: number): [number, number] => [x + 10, y + 20];

describe("toCallbacks", () => {
  it("toCallbacks maps each event type to its callback with host coordinates", () => {
    const { calls, options } = recorder();
    const events: GameEvent[] = [
      { type: "hit", kind: "shark", n: 1, of: 3, x: 100, y: 200 },
      { type: "hit", kind: "ufo", n: 4, x: 1, y: 2 },
      { type: "kill", kind: "rabbit", x: 5, y: 6, streak: 2 },
      { type: "penalty", kind: "cow", points: -500, x: 7, y: 8 },
      { type: "damage", hearts: 1.5, source: "tiger", x: 9, y: 10 },
      { type: "rare", kind: "merman", event: "appeared" },
      { type: "rare", kind: "ufo", event: "met" },
      { type: "escaped", kind: "merman", x: 11, y: 12 },
      { type: "callout", text: "ANGRY!", x: 13, y: 14 },
      { type: "wasted" },
    ];
    toCallbacks(events, options, toHost);
    expect(calls).toEqual([
      ["hit", "shark", 1, 3, 110, 220],
      ["hit", "ufo", 4, undefined, 11, 22],
      ["kill", "rabbit", 15, 26, 2],
      ["penalty", "cow", -500, 17, 28],
      ["health", 1.5],
      ["rare", "merman", "appeared"],
      ["rare", "ufo", "met"],
      ["escaped", "merman", 21, 32],
      ["callout", "ANGRY!", 23, 34],
      ["wasted"],
    ]);
  });

  it("an unknown event type is a compile error", () => {
    const { calls, options } = recorder();
    // @ts-expect-error "fake" is not a GameEvent, so no host can be handed one
    toCallbacks([{ type: "fake", x: 0, y: 0 }], options, toHost);
    expect(calls).toEqual([]); // one smuggled in at run time is ignored
  });

  it("skips the callbacks a host leaves out", () => {
    const events: GameEvent[] = [{ type: "hit", kind: "cow", n: 1, of: 2, x: 0, y: 0 }, { type: "wasted" }];
    expect(() => toCallbacks(events, {}, toHost)).not.toThrow();
  });
});
