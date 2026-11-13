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
