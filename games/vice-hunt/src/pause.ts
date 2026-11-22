// The hunt's frame clock and its pause rules, kept pure so they can be
// tested without a page. A clock steps by 0 on its first tick, on every tick
// while paused and on the first tick after a resume, so a long pause (or a
// hidden tab) never turns into one huge step.

export type Clock = {
  /** Seconds since the previous tick, or 0 (see above). `now` is in ms. */
  tick(now: number): number;
  pause(): void;
  resume(): void;
  readonly paused: boolean;
};

export function createClock(): Clock {
  let last: number | null = null;
  let paused = false;
  return {
    tick(now) {
      if (paused) return 0;
      const dt = last === null ? 0 : (now - last) / 1000;
      last = now;
      return dt;
    },
    pause() {
      paused = true;
      last = null;
    },
    resume() {
      paused = false;
      last = null;
    },
    get paused() {
      return paused;
    },
  };
}

/** What Esc (or a right click) does: pause a round in play; nothing while
 *  already paused (the host's menu has Esc then) or during WASTED. */
export function escapeAction(s: { paused: boolean; wasted: boolean }): "pause" | "none" {
  return s.paused || s.wasted ? "none" : "pause";
}
