import type { useWebHaptics } from "web-haptics/react";
import type { HapticInput } from "web-haptics";

type Trigger = ReturnType<typeof useWebHaptics>["trigger"];

/**
 * The card feature's haptic vocabulary, in one place.
 *
 * It was four `trigger(...)` calls with preset names typed at their call
 * sites, which is how the weights got out of order: the press used
 * `selection`, the lightest thing the library ships, and read as nothing at
 * all on a device that had just been asked for permission to buzz.
 *
 * Named by what happens rather than by how hard it hits, so a call site
 * says `HAPTICS.reveal` and this file decides what a reveal feels like.
 *
 * The weights are a deliberate ladder, and the order is the point:
 *
 * - `press` is firm. It is the visitor's own action on the largest control
 *   on the page, and a button that answers a deliberate press with 8ms at
 *   0.3 intensity feels broken rather than subtle.
 * - `dieLanding` is light, twice. These are two small objects hitting a
 *   surface, and they fire in quick succession, so anything heavier turns a
 *   throw into one long buzz.
 * - `setComplete` is the library's `success`: two taps, the second at full
 *   intensity. The third die landing is the moment the set closes.
 * - `reveal` is the heaviest thing here and the only custom pattern,
 *   because nothing shipped matches what it is: a stamp being struck. A
 *   45ms hit at full intensity, then a lighter 28ms tail after the press
 *   lifts. `success` was the closest preset and reads as a notification,
 *   which is the wrong idea for the moment the card prints.
 */
export const HAPTICS = {
  press: "medium",
  dieLanding: "light",
  setComplete: "success",
  reveal: [
    { duration: 45, intensity: 1 },
    { delay: 70, duration: 28, intensity: 0.65 },
  ],
} as const satisfies Record<string, HapticInput>;

/**
 * Wraps a `web-haptics` trigger the way the old hand-rolled `buzz()` wrapped
 * `navigator.vibrate`: a missing implementation, a thrown error, or a
 * declined permission must never interrupt what the visitor was doing.
 *
 * Both failure shapes are covered. `trigger` can throw synchronously when
 * there is no implementation at all, and can return a promise that rejects
 * when there is one but it refuses, so the synchronous `try` and the
 * `.catch` are each load-bearing and neither covers the other.
 */
export function safeHaptic(trigger: Trigger, input: HapticInput) {
  try {
    trigger(input)?.catch(() => {
      /* unsupported, or declined */
    });
  } catch {
    /* unsupported */
  }
}
