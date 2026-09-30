import { describe, it, expect } from "vitest";
import { organizations } from "./workData";
import { currentBook, homeProjects } from "./home";
import { sideProjects } from "./projectsData";
import type { Book } from "./books";

describe("org summaries", () => {
  it("gives every org one short line for its Work row", () => {
    for (const o of organizations) {
      expect(o.summary, o.slug).toBeTruthy();
      expect(o.summary!.length, o.slug).toBeLessThanOrEqual(90);
      expect(o.summary, o.slug).not.toContain("\u2014");
    }
  });
});

const book = (slug: string, isDone: boolean): Book =>
  ({ slug, name: slug, link: "", author: "", cover: "", isDone, chapters: [] });

describe("currentBook", () => {
  it("is the first unfinished book", () => {
    expect(currentBook([book("a", true), book("b", false), book("c", false)])?.slug).toBe("b");
  });
  it("is undefined when every book is finished", () => {
    expect(currentBook([book("a", true)])).toBeUndefined();
  });
});

describe("homeProjects", () => {
  it("shows only Mehfil and Kiryoku, in that order", () => {
    expect(homeProjects(sideProjects).map((p) => p.slug)).toEqual(["mehfil", "kiryoku"]);
  });
  it("skips a listed slug that no longer exists instead of breaking", () => {
    expect(homeProjects(sideProjects.filter((p) => p.slug !== "kiryoku")).map((p) => p.slug)).toEqual(["mehfil"]);
  });
});
