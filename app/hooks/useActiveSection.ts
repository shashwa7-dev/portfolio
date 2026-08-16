"use client";

import { useEffect, useRef, useState } from "react";

export type TocSection = { id: string; label: string };

/**
 * Which section is currently being read.
 *
 * One observer shared by every presentation of a table of contents. Two
 * observers with two copies of the `rootMargin` below would eventually disagree
 * about the current section, and the version on screen would depend on the
 * viewport width, which is not a thing anyone would think to test.
 */
export function useActiveSection(sections: TocSection[]) {
  const [active, setActive] = useState<string | null>(null);
  /** Changes on every scroll frame and nothing renders from it directly, so it
   *  is a ref rather than state. */
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (sections.length === 0) return;

    // Copied in rather than read through the ref at teardown, where the ref
    // could already point at a different Set.
    const seen = visible.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id);
          else seen.delete(entry.target.id);
        }
        // First in document order, not first reported: entries arrive in
        // whatever order the observer batched them, and trusting that makes the
        // highlight flicker between neighbours on a fast scroll.
        const current = sections.find((s) => seen.has(s.id));
        if (current) setActive(current.id);
      },
      {
        /* A band near the top of the viewport rather than all of it. The top
           inset clears the sticky header; the bottom one stops a heading
           counting as current while it is still down by the fold. */
        rootMargin: "-88px 0px -55% 0px",
        threshold: 0,
      }
    );

    const observed = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    observed.forEach((el) => observer.observe(el));

    /* The band can be empty: between two short sections, and at the very bottom
       where the last heading has already scrolled above it. Falling back to the
       last heading passed stops the marker sticking on whatever was current
       several screens ago. */
    /* Coalesced to one pass per frame. The early return only fires while a
       heading is inside the band, and the band is narrow, so on a long article
       this runs for most of the scroll: unthrottled it meant a layout read per
       heading per scroll event. */
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (seen.size > 0) return;
      const passed = observed.filter((el) => el.getBoundingClientRect().top <= 88);
      const last = passed[passed.length - 1];
      setActive(last ? last.id : null);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      seen.clear();
    };
  }, [sections]);

  return active;
}

/**
 * Scroll to a section and take the keyboard caret with it, so the next Tab
 * continues from the section rather than from the link that was just used.
 */
export function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  /* Headings are not focusable, so one is added for the jump and taken away
     again on blur. Left in place, every heading the reader has ever jumped to
     stays in the tab order, and the document's focus order ends up depending
     on which links they happened to click. */
  el.setAttribute("tabindex", "-1");
  el.addEventListener("blur", () => el.removeAttribute("tabindex"), {
    once: true,
  });
  // `preventScroll` because the line above owns the scrolling, and focusing
  // would otherwise jump straight there and cancel the animation.
  el.focus({ preventScroll: true });
  history.replaceState(null, "", `#${id}`);
  return true;
}
