import { describe, expect, it } from "vitest";
import { mulberry32 } from "../rng";
import { RING_LIFE, emit, splash, stepParticles, type Particle, type Ring } from "./particles";

describe("particles", () => {
  it("emit pushes a particle with defaults", () => {
    const list: Particle[] = [];
    emit(list, { x: 1, y: 2, vx: 3, vy: 4, life: 1, size: 5, color: "#fff", kind: "dot" });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ x: 1, y: 2, age: 0, delay: 0, drag: 0, g: 0, grow: 1, alpha: 1 });
  });

  it("stepParticles moves by velocity, adds gravity and drops expired ones in place", () => {
    const list: Particle[] = [];
    emit(list, { x: 0, y: 0, vx: 10, vy: 0, life: 0.5, size: 1, color: "#fff", kind: "dot" });
    emit(list, { x: 0, y: 0, vx: 0, vy: 0, life: 2, size: 1, color: "#fff", kind: "smoke" });
    const same = list;
    stepParticles(list, 0.1, 100);
    expect(list[0].x).toBeCloseTo(1);
    expect(list[0].vy).toBeCloseTo(10);
    for (let i = 0; i < 5; i++) stepParticles(list, 0.1, 100);
    expect(list).toBe(same);
    expect(list).toHaveLength(1);
    expect(list[0].kind).toBe("smoke");
  });

  it("a delayed particle waits before it moves or ages", () => {
    const list: Particle[] = [];
    emit(list, { x: 0, y: 0, vx: 10, vy: 0, life: 0.2, size: 1, color: "#fff", kind: "dot", delay: 0.3 });
    stepParticles(list, 0.2, 0);
    expect(list[0]).toMatchObject({ x: 0, age: 0 });
    stepParticles(list, 0.2, 0);
    stepParticles(list, 0.1, 0);
    expect(list[0].age).toBeGreaterThan(0);
    expect(list[0].x).toBeGreaterThan(0);
  });

  it("splash logs a ring at the given point and throws up droplets", () => {
    const parts: Particle[] = [];
    const rings: Ring[] = [];
    splash(parts, rings, 100, 300, true, mulberry32(3));
    expect(rings).toEqual([{ x: 100, y: 300, big: true, age: 0 }]);
    expect(parts.length).toBe(9);
    expect(parts.every((p) => p.vy < 0)).toBe(true);
    expect(RING_LIFE).toBeCloseTo(0.9);
  });
});
