import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatTicketDate, starterPack } from "./config";
import { bloopFrequency } from "./bloop";

describe("starter pack config", () => {
  it("links the ticket to the exact video", () => {
    expect(starterPack.ticket.url).toBe(
      "https://www.youtube.com/watch?v=YlbvZ542Ijo&list=RDYlbvZ542Ijo&start_radio=1",
    );
  });

  it("points at assets that exist", () => {
    const srcs = [
      starterPack.mascot.src,
      starterPack.ticket.qr,
      ...starterPack.bubbles.map((b) => b.src),
      ...starterPack.pods.map((p) => p.art),
    ];
    for (const src of srcs) expect(existsSync(join("public", src)), src).toBe(true);
  });

  it("has unique bubble ids", () => {
    const ids = starterPack.bubbles.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no em-dash in any copy", () => {
    expect(JSON.stringify(starterPack)).not.toContain("—");
  });

  it("formats the ticket date as DD MM YY", () => {
    expect(formatTicketDate(new Date(2026, 10, 13))).toBe("13 11 26");
    expect(formatTicketDate(new Date(2027, 0, 5))).toBe("05 01 27");
  });
});

describe("bloop pitch", () => {
  it("is lower for bigger bubbles", () => {
    expect(bloopFrequency(30)).toBe(380);
    expect(bloopFrequency(14)).toBeGreaterThan(bloopFrequency(30));
  });
});
