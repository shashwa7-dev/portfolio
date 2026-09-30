import { describe, it, expect } from "vitest";
import { organizations } from "./workData";
import { orgSubtitle, currentBook, homeProjects } from "./home";
import { sideProjects } from "./projectsData";
import type { Book } from "./books";

const org = (slug: string) => organizations.find((o) => o.slug === slug)!;

describe("orgSubtitle", () => {
  it("lists a company's products when it has them", () => {
    expect(orgSubtitle(org("shopos"))).toBe("Sloosh · Spacelab · ShopOS");
  });
  it("falls back to the brands worked with", () => {
    expect(orgSubtitle(org("dehidden"))).toBe("Coinbase · Polygon · Play AI");
  });
  it("is empty when there is neither, with no stray separator", () => {
    expect(orgSubtitle(org("copestudio"))).toBe("");
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
