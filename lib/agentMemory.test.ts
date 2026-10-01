import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Truffy's system prompt must not describe homepage elements that no longer
 * exist, or the assistant points visitors at things they cannot find. Add a
 * phrase here whenever a homepage element it used to mention is removed.
 */
const memory = readFileSync(resolve(__dirname, "../data/agent-memory.md"), "utf8");

describe("agent memory", () => {
  it("does not describe removed homepage elements", () => {
    for (const gone of ["stat band", "contact section repeats", "Toolkit section"]) {
      expect(memory).not.toContain(gone);
    }
  });
});
