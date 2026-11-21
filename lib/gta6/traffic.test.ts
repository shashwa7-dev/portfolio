import { describe, expect, it } from "vitest";
import { CAR_COLOURS, planCar } from "./traffic";

const fixed = (v: number) => () => v;

describe("planCar", () => {
  it("takes the first colour, left to right, the fastest crossing and the shortest gap at 0", () => {
    expect(planCar(fixed(0))).toEqual({ colour: CAR_COLOURS[0], ltr: true, seconds: 7, gapMs: 700 });
  });

  it("takes the last colour, right to left, the slowest crossing and the longest gap near 1", () => {
    const car = planCar(fixed(0.9999));
    expect(car.colour).toBe(CAR_COLOURS[CAR_COLOURS.length - 1]);
    expect(car.ltr).toBe(false);
    expect(car.seconds).toBeCloseTo(13, 2);
    expect(car.gapMs).toBeCloseTo(2900, 0);
  });

  it("switches direction at one half", () => {
    expect(planCar(fixed(0.49)).ltr).toBe(true);
    expect(planCar(fixed(0.5)).ltr).toBe(false);
  });
});
