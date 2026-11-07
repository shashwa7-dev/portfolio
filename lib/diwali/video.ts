/**
 * The Diwali Song's YouTube id. On its own (not in `show.ts`) because the
 * hero imports `show.ts` up front: anything there that the lazy player uses
 * stays in the homepage's initial JavaScript, and `check-diwali-bundle.sh`
 * forbids this id there.
 */
export const VIDEO_ID = "QirCMADtks8";
