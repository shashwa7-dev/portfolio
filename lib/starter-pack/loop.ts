/**
 * Fixed-timestep accumulator shared by the lanyard and the bubbles.
 *
 * Physics steps at 120 Hz whatever the display rate. After a long pause (a
 * hidden tab, a slow frame) at most `MAX_STEPS` steps run, so the card never
 * jumps or explodes when the page comes back.
 */
export const STEP = 1 / 120;
export const MAX_STEPS = 6;

export function advance(acc: number, elapsedMs: number): { steps: number; acc: number } {
  let next = acc + Math.min(Math.max(0, elapsedMs) / 1000, MAX_STEPS * STEP);
  let steps = 0;
  // A small epsilon so a frame of exactly 1/120 s counts as one step.
  while (next >= STEP - 1e-9 && steps < MAX_STEPS) {
    next -= STEP;
    steps++;
  }
  return { steps, acc: Math.max(0, next) };
}

/**
 * Turns rAF timestamps into physics steps. `tick` carries the leftover time
 * from frame to frame, so the simulation runs in real time at any display
 * rate. Call `wake` only when the loop starts again after sleeping, so the
 * time spent asleep is not replayed.
 */
export function createFrameClock() {
  let last = 0;
  let acc = 0;
  return {
    wake(now: number) {
      last = now;
      acc = 0;
    },
    tick(now: number): number {
      const r = advance(acc, now - last);
      last = now;
      acc = r.acc;
      return r.steps;
    },
  };
}
