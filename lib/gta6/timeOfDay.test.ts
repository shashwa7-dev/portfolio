import { describe, expect, it } from "vitest";
import { timeOfDay } from "./timeOfDay";

describe("timeOfDay", () => {
  it("is morning from 6:00 up to 17:00", () => {
    expect(timeOfDay(6)).toBe("morning");
    expect(timeOfDay(12)).toBe("morning");
    expect(timeOfDay(16.99)).toBe("morning");
  });

  it("is evening from 17:00 up to 20:00", () => {
    expect(timeOfDay(17)).toBe("evening");
    expect(timeOfDay(19.99)).toBe("evening");
  });

  it("is night from 20:00 up to 6:00", () => {
    expect(timeOfDay(20)).toBe("night");
    expect(timeOfDay(23)).toBe("night");
    expect(timeOfDay(0)).toBe("night");
    expect(timeOfDay(5.99)).toBe("night");
  });
});
