import { GithubLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { SocialLink } from "@/lib/siteLinks";

/**
 * The mark for each social account, in one place.
 *
 * Two surfaces render this list now, the hero and the footer, and a second
 * hand-kept copy of the map is how adding a fourth account ends up showing an
 * icon on one of them and a crash on the other. `Record` over
 * `SocialLink["name"]` rather than a loose object, so adding a name to
 * `socialLinks` without adding a mark here fails at the typecheck instead of at
 * render.
 *
 * `XLogo` is the brand, NOT Phosphor's `X`, which is a close glyph and what
 * autocomplete offers first. See the note in `lib/siteLinks.ts` for why the
 * label beside it still reads "Twitter".
 *
 * The `Icon` type comes from the package root rather than `/ssr`, which does
 * not re-export it. That is a type-only import, so it is erased at build and
 * pulls none of the root barrel's `"use client"` payload into the bundle; the
 * components themselves still come from `/ssr`.
 */
export const SOCIAL_ICONS: Record<SocialLink["name"], Icon> = {
  GitHub: GithubLogo,
  LinkedIn: LinkedinLogo,
  Twitter: XLogo,
};
