/**
 * Where focus goes once the mode has ended (Exit, the palm, Back to site
 * when the mode then turns off): the hero photo's spin button, the trigger
 * that started it, or the footer palm when the photo is not in view (or
 * not on this page). `scrollingHome` says the page is on its way to the
 * top, so the photo counts as in view whatever the scroll is now.
 */
export function focusAfterMode(scrollingHome = false): void {
  const avatar = document.querySelector<HTMLElement>("[data-spin-avatar]");
  const palm = document.querySelector<HTMLElement>("[data-gta-palm]");
  const r = avatar?.getBoundingClientRect();
  const inView = !!r && r.width > 0 && (scrollingHome || (r.bottom > 0 && r.top < window.innerHeight));
  (inView ? avatar : palm)?.focus({ preventScroll: true });
}
