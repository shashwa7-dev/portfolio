import { describe, expect, it } from "vitest";
import { LAUNCH_AT, POSES, RIG, SQUAT_AT, blend, finishPose, ik, throwArm, walkPose, copy } from "./rig";

describe("Bigfoot's rig", () => {
  it("ik keeps the ankle at the target when reachable", () => {
    const hip: [number, number] = [80, 140];
    const target: [number, number] = [74, 194];
    const { knee, ankle } = ik(hip, target, RIG.THIGH, RIG.SHIN);
    expect(Math.hypot(ankle[0] - target[0], ankle[1] - target[1])).toBeLessThan(0.01);
    expect(Math.hypot(knee[0] - hip[0], knee[1] - hip[1])).toBeCloseTo(RIG.THIGH, 5);
    expect(Math.hypot(ankle[0] - knee[0], ankle[1] - knee[1])).toBeCloseTo(RIG.SHIN, 5);
  });

  it("ik stretches toward a target out of reach", () => {
    const { ankle } = ik([0, 0], [0, 200], RIG.THIGH, RIG.SHIN);
    expect(ankle[1]).toBeCloseTo(RIG.THIGH + RIG.SHIN - 0.01, 5);
  });

  it("ik bends the knee forward (knee.x > hip.x) for a lowered hip", () => {
    const p = POSES.squat;
    const hip: [number, number] = [p.rx + 14, p.ry - 2];
    const { knee } = ik(hip, [p.fN[0], p.fN[1]], RIG.THIGH, RIG.SHIN);
    expect(knee[0]).toBeGreaterThan(hip[0]);
  });

  it("blend at 0 and 1 returns the endpoints", () => {
    expect(blend(POSES.stand, POSES.squat, 0)).toEqual(copy(POSES.stand));
    expect(blend(POSES.stand, POSES.squat, 1)).toEqual(copy(POSES.squat));
    expect(blend(POSES.stand, POSES.squat, 0.5).ry).toBeCloseTo((POSES.stand.ry + POSES.squat.ry) / 2);
  });

  it("walkPose feet alternate", () => {
    // A quarter of the step phase in: one foot forward, the other back.
    const p = walkPose(Math.PI / 2 / 4.2, 0);
    expect(p.fF[0] - 72).toBeCloseTo(14);
    expect(p.fN[0] - 104).toBeCloseTo(-14);
    // Half a cycle later they have swapped.
    const q = walkPose((Math.PI / 2 + Math.PI) / 4.2, 0);
    expect(q.fF[0] - 72).toBeCloseTo(-14);
    expect(q.fN[0] - 104).toBeCloseTo(14);
    // The swinging foot is lifted, the planted one is down.
    const r = walkPose(0, 0);
    expect(r.fF[1]).toBeLessThan(194);
    expect(r.fN[1]).toBe(194);
  });

  it("walkPose does not change the pose table", () => {
    walkPose(1.3, 1);
    expect(POSES.stand.fF).toEqual([72, 194]);
  });

  it("throwArm winds back, then releases forward", () => {
    const wound = throwArm(walkPose(0, 0), 0.6);
    expect(wound.uN).toBeCloseTo(-75);
    expect(wound.fNo).toBeCloseTo(-125);
    const thrown = throwArm(walkPose(0, 0), 1);
    expect(thrown.uN).toBeCloseTo(115);
    expect(thrown.fNo).toBeCloseTo(95);
  });

  it("finishPose runs stand, squat (strain face), then the jet pose", () => {
    expect(finishPose(0.14).ry).toBeCloseTo(POSES.stand.ry);
    expect(finishPose(SQUAT_AT + 0.16).ry).toBeCloseTo(POSES.squat.ry);
    expect(finishPose(1.2).face).toBe("strain");
    const end = finishPose(LAUNCH_AT);
    expect(end.ry).toBeCloseTo(POSES.jet.ry);
    expect(end.uF).toBeCloseTo(POSES.jet.uF);
    expect(end.face).toBe("relief");
  });
});
