import { describe, expect, it } from "vitest";
import { displayName, dotSeparated, headerFacts } from "./cv";

describe("displayName", () => {
  it("title-cases the all-caps name the PDF header uses", () => {
    expect(displayName("SHASHWAT TRIPATHI")).toBe("Shashwat Tripathi");
  });
  it("leaves an already mixed-case name alone", () => {
    expect(displayName("Shashwat Tripathi")).toBe("Shashwat Tripathi");
  });
});

describe("dotSeparated", () => {
  it("swaps the PDF's pipes for middle dots", () => {
    expect(dotSeparated("Bengaluru, India | contact@shashwa7.in")).toBe("Bengaluru, India · contact@shashwa7.in");
  });
  it("leaves a line without pipes unchanged", () => {
    expect(dotSeparated("shashwa7.in")).toBe("shashwa7.in");
  });
});

describe("headerFacts", () => {
  it("splits a pipe-separated header line into trimmed facts", () => {
    expect(headerFacts("Bengaluru, India | +91 96941 74289 | contact@shashwa7.in")).toEqual([
      "Bengaluru, India",
      "+91 96941 74289",
      "contact@shashwa7.in",
    ]);
  });
  it("drops empty pieces", () => {
    expect(headerFacts("a ||  b |")).toEqual(["a", "b"]);
  });
});
