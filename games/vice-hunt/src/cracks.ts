import type { Rng } from "./rng";

const SPOKES: [number, number] = [7, 11];
const SPOKE_LEN: [number, number] = [28, 74];
const RINGS = [0.35, 0.65];
const RING_SKIP = 0.35;

const f = (n: number) => n.toFixed(1);

// Bullet-hole cracks as one SVG path: jagged spokes out from the hole, then
// partial fracture rings bridging neighbouring spokes (the approved prototype,
// made deterministic). Every point stays within SPOKE_LEN[1] of the centre.
export function crackPath(cx: number, cy: number, rng: Rng): string {
  const n = SPOKES[0] + Math.floor(rng() * (SPOKES[1] - SPOKES[0] + 1));
  const spokes: { a: number; len: number }[] = [];
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.5;
    const len = SPOKE_LEN[0] + rng() * (SPOKE_LEN[1] - SPOKE_LEN[0]);
    d += `${d ? " " : ""}M${cx} ${cy}`;
    let r = 0;
    while (r < len) {
      r = Math.min(len, r + 6 + rng() * 9);
      const j = (rng() - 0.5) * 0.35;
      d += ` L${f(cx + Math.cos(a + j) * r)} ${f(cy + Math.sin(a + j) * r)}`;
    }
    spokes.push({ a, len });
  }
  for (const frac of RINGS) {
    for (let i = 0; i < n; i++) {
      if (rng() < RING_SKIP) continue;
      const s1 = spokes[i];
      const s2 = spokes[(i + 1) % n];
      const r1 = Math.min(s1.len, s2.len) * frac * (0.85 + rng() * 0.3);
      const r2 = r1 * (0.9 + rng() * 0.2);
      d += ` M${f(cx + Math.cos(s1.a) * r1)} ${f(cy + Math.sin(s1.a) * r1)}`;
      d += ` L${f(cx + Math.cos(s2.a) * r2)} ${f(cy + Math.sin(s2.a) * r2)}`;
    }
  }
  return d;
}
