"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, X } from "@phosphor-icons/react/ssr";

const STORAGE_KEY = "nudge:mehfil:v1";
const APPEAR_AFTER_MS = 2500;
const HREF = "https://mehfil.shashwa7.in/";

/**
 * A small corner nudge pointing at the latest shipped project. Homepage only,
 * mounted from `app/page.tsx` rather than the layout, so it never appears on a
 * blog post or a case study.
 *
 * Four decisions worth recording:
 *
 * 1. **Bottom left, not bottom right.** The chat FAB already owns bottom right
 *    (`fixed bottom-4 right-4`) and its label sits at `bottom-[60px] right-4`.
 *    Unlike the no-JS notice, which never coexists with the FAB because that is a
 *    `dynamic` import with `ssr: false`, this nudge runs with scripts on and would
 *    collide. `z-40` keeps it under the FAB's `z-50` as a second guard.
 * 2. **Two ways out.** Clicking the card opens Mehfil and dismisses it; the
 *    small close mark on its corner dismisses it without leaving. The close
 *    mark is a sibling of the link, not inside it (a button cannot nest in an
 *    `<a>`), so the fixed positioning and the entrance live on a wrapper. It
 *    was click-only at first, which was fine over desktop margin and not fine
 *    on a phone, where the card sits over content.
 * 3. **Dismissal is remembered.** Clicking writes to `localStorage`, so someone
 *    who has already visited Mehfil is not asked again on every reload. Without
 *    that, "it goes away" would only be true until the next page load, which is
 *    not really going away. The key is versioned so a future nudge starts fresh
 *    rather than inheriting this one's dismissal.
 * 4. **Two-state entrance instead of a keyframe.** The element mounts first and
 *    transitions on the next animation frame, which is the `data-mounted` pattern
 *    for entry without a keyframe. Transitions can be interrupted and retargeted;
 *    keyframes restart from zero. It also means `prefers-reduced-motion` handles
 *    this correctly for free, since the reduced-motion rule in `globals.css`
 *    restricts transitions to opacity and colour, so the fade survives and the
 *    slide does not.
 *
 * Enter is slower than exit on purpose: arriving is a moment worth noticing,
 * leaving should get out of the way.
 *
 * The card carries the project's own thumbnail as a background, anchored to the
 * top right and masked so it dissolves toward the bottom left where the copy
 * sits. Two notes on that: the mask runs `to bottom left`, so the corner the
 * image is anchored to is the opaque end and the text end is the transparent one,
 * which is what keeps the copy legible without a scrim. And the source is a
 * 2940px screenshot, so `sizes` is pinned to the card's real width; without it
 * Next would serve a far larger file than a 264px card can use.
 */
export default function LaunchNudge() {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  // Hold off until the page has settled, and never show it to someone who has
  // already acted on it.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Private browsing or blocked storage. Showing the nudge is the safe
      // fallback: worst case someone sees it twice.
    }
    if (dismissed) return;

    const timer = setTimeout(() => setMounted(true), APPEAR_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  // Transition in on the frame after mount, so there is a previous painted state
  // for the transition to interpolate from.
  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  if (!mounted) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage unavailable. The nudge still closes for this session.
    }
    setShown(false);
    setTimeout(() => setMounted(false), 150);
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-48 transition-[opacity,transform] ease-out motion-reduce:translate-y-0 sm:max-w-66 ${
        shown
          ? "translate-y-0 opacity-100 duration-med"
          : "translate-y-2 opacity-0 duration-fast"
      }`}
    >
      <a
        href={HREF}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        className="group relative block overflow-hidden rounded-lg border border-border-strong bg-card/95 px-3.5 py-3 shadow-lg backdrop-blur-sm transition-[border-color,transform] duration-base ease-out hover:border-foreground/25 active:scale-[0.98] sticker candy:rounded-tile candy:border-white hover:candy:border-white"
      >
        {/* Thumbnail, anchored top right and faded out toward the copy. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
        >
          <Image
            src="/projects/project_mehfil.jpg"
            alt=""
            fill
            sizes="264px"
            quality={70}
            className="object-cover object-top-right opacity-[0.22] grayscale candy:grayscale-0 candy:opacity-[0.3] dark:opacity-[0.28]"
            style={{
              maskImage: "linear-gradient(to bottom left, black 0%, transparent 62%)",
              WebkitMaskImage:
                "linear-gradient(to bottom left, black 0%, transparent 62%)",
            }}
          />
        </span>

        <p className="relative font-mono text-2xs uppercase tracking-label text-subtle candy:inline-flex candy:items-center candy:rounded-tag candy:bg-candy-pink candy:px-2 candy:py-0.5 candy:font-semibold candy:text-foreground">
          Just shipped
        </p>
        <p className="relative mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground candy:font-display candy:text-base">
          Mehfil
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-subtle transition-[transform,color] duration-base ease-out group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:group-hover:translate-x-0" />
        </p>
        <p className="relative mt-1 hidden text-2xs leading-relaxed sm:block text-muted-foreground candy:text-foreground/80">
          Golden-era Hindi film music, 3,916 songs across 66 stations.
        </p>
      </a>
      {/* Close. Small and on the corner so it does not compete with the card,
          with an invisible `after` that grows the tap target to 40px. */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss the Mehfil nudge"
        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-border-strong bg-card text-muted-foreground shadow-md transition-[color,transform] duration-fast ease-out after:absolute after:-inset-2 hover:text-foreground active:scale-[0.92]"
      >
        <X aria-hidden weight="bold" className="h-3 w-3" />
      </button>
    </div>
  );
}
