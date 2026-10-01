/**
 * Handwritten notes in the homepage margin, keyed by the id of the row they
 * comment on (an org slug or a side-project slug). Four at most: past that
 * they stop reading as a voice and start reading as decoration.
 * `rotate` is fixed per note, in degrees, so the page never reflows between
 * renders.
 */
export const marginNotes: Record<string, { text: string; rotate: number }> = {
  shopos: { text: "three apps, one canvas", rotate: -4 },
  dehidden: { text: "1M users on launch day!", rotate: 3 },
  mehfil: { text: "Carvaan, but in your browser", rotate: -3 },
  kiryoku: { text: "a tiny proxy that says no", rotate: 2 },
};
