"use client";

import dynamic from "next/dynamic";

/**
 * The doors from the server-rendered hero and footer to the GTA 6 mode.
 * `About.tsx` and `Footer.tsx` are server components, and a server
 * component's static import of a client component ships that component in
 * the page's initial JavaScript whether or not it renders (see
 * DiwaliAvatarLazy). Going through `next/dynamic` keeps both in chunks of
 * their own. Both are tiny; the mode itself (art, music, styles) is a further
 * dynamic import inside `GtaModeMount`, fetched only when the mode turns on.
 *
 * Client only (`ssr: false`), unlike the Diwali door. A reload always starts
 * with the mode off, so the server would render nothing for the mount and
 * only an inert icon for the palm. And server-rendering these two had the
 * build preload chunk files it never wrote (two 404s on every homepage
 * load), while the client loads the real chunks fine.
 */
export const GtaModeMount = dynamic(() => import("@/components/gta6/GtaModeMount"), {
  ssr: false,
});

export const FooterPalm = dynamic(() => import("@/components/gta6/FooterPalm"), {
  ssr: false,
});
