import { describe, it, expect } from "vitest";
import { organizations } from "./workData";
import { readingNow, homeProjects, latestPosts } from "./home";
import { books } from "./books";
import { sideProjects } from "./projectsData";
import type { Book } from "./books";

describe("org tags", () => {
  it("gives every org a designation, an employment type and a work mode", () => {
    const tags = Object.fromEntries(organizations.map((o) => [o.slug, [o.employment, o.workMode]]));
    expect(tags).toEqual({
      shopos: ["full-time", "onsite"],
      dehidden: ["contract", "remote"],
      copestudio: ["internship", "remote"],
    });
    for (const o of organizations) expect(o.role, o.slug).toBeTruthy();
  });
  it("keeps summaries free of 'end to end'", () => {
    for (const o of organizations) expect(o.summary ?? "", o.slug).not.toMatch(/end to end/i);
  });
});

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

describe("readingNow", () => {
  it("lists Advanced React and Can't Hurt Me, in that order", () => {
    expect(readingNow(books).map((b) => b.slug)).toEqual(["advanced-react", "cant-hurt-me"]);
  });
  it("is empty when none of the listed books exist, so the row is left out", () => {
    expect(readingNow([book("a", false)])).toEqual([]);
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

describe("latestPosts", () => {
  const post = (slug: string, publishedAt: string) => ({ slug, metadata: { publishedAt } });
  it("returns the newest posts first, capped at the limit", () => {
    const posts = [post("a", "2026-01-01"), post("b", "2026-08-22"), post("c", "2026-05-10"), post("d", "2025-12-01")];
    expect(latestPosts(posts, 3).map((p) => p.slug)).toEqual(["b", "c", "a"]);
  });
  it("does not reorder the list it was given", () => {
    const posts = [post("a", "2026-01-01"), post("b", "2026-08-22")];
    latestPosts(posts, 3);
    expect(posts.map((p) => p.slug)).toEqual(["a", "b"]);
  });
});
