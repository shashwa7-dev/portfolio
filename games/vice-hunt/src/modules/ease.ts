// CSS-style timing for the sequences copied from the prototype: a
// cubic-bezier easing and linear keyframes, as the Web Animations API runs
// them (the easing bends the whole run; keyframes are linear between).

/** `cubic-bezier(x1, y1, x2, y2)` as a function of progress 0..1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const xAt = (u: number) => ((ax * u + bx) * u + cx) * u;
  const yAt = (u: number) => ((ay * u + by) * u + cy) * u;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let u = t;
    for (let i = 0; i < 24; i++) {
      const x = xAt(u);
      if (Math.abs(x - t) < 1e-5) break;
      if (x < t) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return yAt(u);
  };
}

/** A keyframe: `at` is its offset 0..1, the rest are numbers to blend. */
export type Key<T extends Record<string, number>> = T & { at: number };

/** Linear blend between the keyframes around progress `p`. */
export function keyframes<T extends Record<string, number>>(keys: readonly Key<T>[], p: number): T {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const k = b.at === a.at ? 1 : Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at)));
  const out = {} as Record<string, number>;
  for (const key of Object.keys(a)) if (key !== "at") out[key] = a[key] + (b[key] - a[key]) * k;
  return out as T;
}
