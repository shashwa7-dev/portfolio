import { describe, it, expect } from "vitest";
import { tickerControl } from "./ticker";

describe("tickerControl", () => {
  it("offers to pause while the ticker is moving", () => {
    expect(tickerControl(false)).toEqual({ label: "Pause highlights", icon: "pause" });
  });
  it("offers to play once it is paused", () => {
    expect(tickerControl(true)).toEqual({ label: "Play highlights", icon: "play" });
  });
});
