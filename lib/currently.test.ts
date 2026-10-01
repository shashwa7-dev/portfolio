import { describe, expect, it } from "vitest";
import { currently } from "./currently";
import { stackLabel } from "@/components/common/stackLabels";

describe("currently.stack", () => {
  const groups = Object.entries(currently.stack);

  it("has a core, backend and testing group, none empty", () => {
    expect(groups.map(([k]) => k)).toEqual(["core", "backend", "testing"]);
    for (const [, names] of groups) expect(names.length).toBeGreaterThan(0);
  });

  it("lists every tool once, across all groups", () => {
    const all = groups.flatMap(([, names]) => names);
    expect(new Set(all).size).toBe(all.length);
  });

  it("names the backend and testing tools", () => {
    expect(currently.stack.backend).toEqual(
      expect.arrayContaining(["node", "express", "postgres", "mongodb", "redis", "docker"]),
    );
    expect(currently.stack.testing).toEqual(["vitest", "playwright", "jest", "testingLibrary"]);
  });

  it("has a label for every tool", () => {
    for (const [, names] of groups) for (const n of names) expect(stackLabel(n)).toBeTruthy();
  });
});
