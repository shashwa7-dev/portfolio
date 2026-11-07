/**
 * The Diwali avatar is switched on until the season ends. `true` puts a fuse
 * on the hero photo in place of the fidget spinner, goggles and status ring,
 * and lighting the fuse opens the show. `false` restores the fidget spinner,
 * goggles and status ring exactly as they were. Nothing else needs touching:
 * the feature is gated on this one flag, so flip it per season rather than
 * deleting the feature.
 */
export const DIWALI_ENABLED = true;
