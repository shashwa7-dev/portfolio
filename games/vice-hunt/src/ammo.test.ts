import { describe, expect, it } from "vitest";
import { RELOAD_TIME, ROUNDS, createAmmo, fire, startReload, tick } from "./ammo";

describe("ammo", () => {
  it("starts with six rounds, not reloading", () => {
    expect(ROUNDS).toBe(6);
    expect(createAmmo()).toEqual({ rounds: 6, reloading: false, reloadLeft: 0 });
  });

  it("six shots, then it reloads on its own", () => {
    const a = createAmmo();
    for (let i = 0; i < 5; i++) {
      expect(fire(a)).toBe(true);
      expect(a.reloading).toBe(false);
    }
    expect(a.rounds).toBe(1);
    expect(fire(a)).toBe(true);
    expect(a).toEqual({ rounds: 0, reloading: true, reloadLeft: RELOAD_TIME });
  });

  it("no round fires while reloading", () => {
    const a = createAmmo();
    for (let i = 0; i < 6; i++) fire(a);
    expect(fire(a)).toBe(false);
    tick(a, RELOAD_TIME / 2);
    expect(fire(a)).toBe(false);
    expect(a.rounds).toBe(0);
  });

  it("the reload takes about a second and refills all six", () => {
    expect(RELOAD_TIME).toBe(1);
    const a = createAmmo();
    for (let i = 0; i < 6; i++) fire(a);
    expect(tick(a, 0.999)).toBe(false);
    expect(a.reloading).toBe(true);
    expect(tick(a, 0.002)).toBe(true);
    expect(a).toEqual({ rounds: 6, reloading: false, reloadLeft: 0 });
    expect(fire(a)).toBe(true);
  });

  it("R reloads early, from any count below six", () => {
    const a = createAmmo();
    fire(a);
    fire(a);
    expect(startReload(a)).toBe(true);
    expect(a).toEqual({ rounds: 4, reloading: true, reloadLeft: RELOAD_TIME });
    expect(fire(a)).toBe(false);
    tick(a, RELOAD_TIME);
    expect(a.rounds).toBe(6);
  });

  it("R does nothing when full or already reloading", () => {
    const a = createAmmo();
    expect(startReload(a)).toBe(false);
    fire(a);
    startReload(a);
    tick(a, 0.5);
    expect(startReload(a)).toBe(false);
    expect(a.reloadLeft).toBeCloseTo(0.5);
  });

  it("tick is a no-op when not reloading", () => {
    const a = createAmmo();
    fire(a);
    expect(tick(a, 5)).toBe(false);
    expect(a).toEqual({ rounds: 5, reloading: false, reloadLeft: 0 });
  });
});
