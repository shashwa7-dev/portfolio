// The revolver's six-round cylinder, as pure state. After the sixth shot it
// reloads on its own; startReload (R) reloads early. No round fires while a
// reload runs.
export const ROUNDS = 6;
export const RELOAD_TIME = 1; // seconds

export type Ammo = { rounds: number; reloading: boolean; reloadLeft: number };

export const createAmmo = (): Ammo => ({ rounds: ROUNDS, reloading: false, reloadLeft: 0 });

// Spends a round if one can fire; returns whether it did.
export function fire(ammo: Ammo): boolean {
  if (ammo.reloading || ammo.rounds <= 0) return false;
  ammo.rounds -= 1;
  if (ammo.rounds === 0) startReload(ammo);
  return true;
}

// Returns whether a reload started (not when full or already reloading).
export function startReload(ammo: Ammo): boolean {
  if (ammo.reloading || ammo.rounds >= ROUNDS) return false;
  ammo.reloading = true;
  ammo.reloadLeft = RELOAD_TIME;
  return true;
}

// Advances a running reload; returns true on the tick it completes.
export function tick(ammo: Ammo, dt: number): boolean {
  if (!ammo.reloading) return false;
  ammo.reloadLeft -= Math.max(0, dt);
  if (ammo.reloadLeft > 0) return false;
  ammo.rounds = ROUNDS;
  ammo.reloading = false;
  ammo.reloadLeft = 0;
  return true;
}
