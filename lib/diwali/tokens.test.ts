import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { duration } from "@/lib/motionVariants";

const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8");

const kebab = (key: string) =>
  key.replace(/^diwali/, "diwali-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

describe("diwali motion tokens", () => {
  it("every diwali duration is mirrored in globals.css", () => {
    const keys = Object.keys(duration).filter((k) => k.startsWith("diwali"));
    expect(keys.length).toBeGreaterThanOrEqual(20);
    for (const key of keys) {
      const value = duration[key as keyof typeof duration];
      const ms = Math.round(value * 1000);
      expect(css, `${key} -> --duration-${kebab(key)}`).toContain(
        `--duration-${kebab(key)}: ${ms}ms;`,
      );
    }
  });
});
