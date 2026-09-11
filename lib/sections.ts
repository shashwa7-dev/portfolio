/**
 * How many numbered sections the homepage renders.
 *
 * Each section component owns its own number, because its position is a fact
 * about that component and moving one means editing it anyway. The total is
 * different: it is a fact about the page, and it was written out six times,
 * once per component, so adding a seventh section left six of them claiming
 * there were six.
 *
 * `/shelf` derives its own total instead of importing this, and should keep
 * doing so: two of its parts are conditional, so its count is only knowable at
 * render time. This constant is for the homepage, where the sequence is fixed.
 */
export const HOMEPAGE_SECTION_TOTAL = "06";
