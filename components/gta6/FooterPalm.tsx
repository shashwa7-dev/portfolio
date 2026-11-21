"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TreePalm } from "@phosphor-icons/react/ssr";
import { gtaMode } from "@/lib/gta6/store";
import { useGtaMode } from "@/components/gta6/useGtaMode";
import { useGtaDesktop } from "@/components/gta6/useDesktop";
import { focusAfterMode } from "@/components/gta6/focusAfterMode";
import s from "@/components/gta6/FooterPalm.module.css";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function toTop() {
  window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
}

/** The pop's length, `--duration-gta-palm-pop`. */
function popMs(el: HTMLElement): number {
  const d = getComputedStyle(el).getPropertyValue("--duration-gta-palm-pop").trim();
  return d.endsWith("ms") ? parseFloat(d) : (parseFloat(d) || 0) * 1000;
}

/**
 * The quiet way into Vice City mode, in the footer of every route (spec,
 * revision 3), desktop only like the rest of the mode.
 *
 * A click always lands on the homepage at the top with the mode on: from
 * another route it navigates to `/` and turns the mode on once the homepage
 * (and its hero) has rendered; on the homepage it scrolls up and turns it on.
 * With the mode already on, it turns it off and scrolls up. The click first
 * plays a short pop, then acts. It also keeps the mode tied to the homepage:
 * leaving `/` turns the mode off.
 *
 * Off, the palm is muted ink and sways on hover; on, it is filled in the
 * accent pink with a dot under it and sways slowly. The click is a user
 * gesture, so the YouTube API starts loading inside it.
 */
export default function FooterPalm() {
  const on = useGtaMode();
  const desktop = useGtaDesktop();
  const pathname = usePathname();
  const router = useRouter();
  const button = useRef<HTMLButtonElement>(null);
  const [pop, setPop] = useState(0);
  // Set when a click from another route is on its way to the homepage.
  const goingHome = useRef(false);
  const timer = useRef(0);

  useEffect(() => {
    if (pathname !== "/") {
      gtaMode.set(false);
      return;
    }
    if (!goingHome.current) return;
    goingHome.current = false;
    window.scrollTo({ top: 0 });
    gtaMode.set(true);
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!desktop) return null;

  const act = () => {
    if (gtaMode.get()) {
      gtaMode.set(false);
      toTop();
      focusAfterMode(true);
    } else if (pathname === "/") {
      toTop();
      gtaMode.set(true);
    } else {
      goingHome.current = true;
      router.push("/");
    }
  };

  return (
    <button
      ref={button}
      type="button"
      data-gta-palm=""
      aria-label={on ? "Exit Vice City mode" : "Vice City mode"}
      title={on ? "Exit Vice City mode" : "Vice City mode"}
      aria-pressed={on}
      data-pop={pop || undefined}
      onAnimationEnd={(e) => e.target === e.currentTarget && setPop(0)}
      onClick={() => {
        if (!gtaMode.get()) {
          void import("@/components/common/youtube").then((m) => m.primeYouTube());
        }
        window.clearTimeout(timer.current);
        setPop((n) => n + 1);
        const el = button.current;
        // The pop runs first; reduced motion has none, so it acts at once.
        const wait = el && !reducedMotion() ? popMs(el) : 0;
        timer.current = window.setTimeout(act, wait);
      }}
      className={s.palm}
    >
      <TreePalm aria-hidden weight={on ? "fill" : "regular"} className={s.icon} />
    </button>
  );
}
