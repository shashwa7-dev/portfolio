/**
 * The ticker's pause control: what the button says and shows. The control
 * exists because hover is the only other way to stop the drift, and touch and
 * keyboard users have no hover (WCAG 2.2.2: moving content must be pausable).
 */
export function tickerControl(paused: boolean): { label: string; icon: "pause" | "play" } {
  return paused ? { label: "Play highlights", icon: "play" } : { label: "Pause highlights", icon: "pause" };
}
