"use client";

import dynamic from "next/dynamic";

/**
 * The one door from the hero to the Diwali fuse. `About.tsx` is a server
 * component, and a server component's static import of a client component
 * ships that component in the page's initial JavaScript whether or not it is
 * rendered. Importing DiwaliAvatar through `next/dynamic` here keeps it in its
 * own chunk, loaded only when the hero renders it, so with `DIWALI_ENABLED`
 * off none of the fuse reaches the visitor. SSR stays on, so with the flag on
 * the photo and fuse are still in the server-rendered hero. `ref` and the
 * tooltip trigger's props pass straight through (React 19 refs are props).
 */
const DiwaliAvatarLazy = dynamic(
  () => import("@/components/diwali/DiwaliAvatar"),
);

export default DiwaliAvatarLazy;
