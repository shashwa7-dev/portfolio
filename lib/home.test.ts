import { describe, it, expect } from "vitest";
import { organizations } from "./workData";
import { orgSubtitle } from "./home";

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
