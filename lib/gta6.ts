/**
 * The GTA 6 mode is a flag-gated easter egg. `true` makes the mode available
 * to visitors; `false` removes every trace of it, and the site is exactly as
 * it was. Nothing else needs touching: the feature is gated on this one flag.
 * It must never be on together with `DIWALI_ENABLED` (verify check C25).
 */
export const GTA6_ENABLED = false;

/**
 * Vice Hunt is the GTA 6 mode's mini-game. `true` turns it on inside the mode;
 * `false` leaves the mode without it. Only meaningful while `GTA6_ENABLED` is
 * true.
 */
export const VICE_HUNT_ENABLED = false;
