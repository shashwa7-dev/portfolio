/** The bubble press sound's pitch in Hz: lower for bigger bubbles. */
export function bloopFrequency(r: number): number {
  return 240 + 4200 / r;
}
