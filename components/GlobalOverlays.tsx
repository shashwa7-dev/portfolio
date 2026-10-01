"use client";

import dynamic from "next/dynamic";

/**
 * The command palette and the keyboard-shortcuts overlay, loaded client-only.
 *
 * They used to be `dynamic(..., { ssr: false })` straight in `app/layout.tsx`.
 * Next 15 forbids `ssr: false` in a Server Component, so the dynamic imports
 * live in this client wrapper and the layout renders it once. Neither has
 * anything to show on the server: both open on a key press.
 */
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const KeyboardShortcuts = dynamic(() => import("@/components/KeyboardShortcuts"), { ssr: false });

export default function GlobalOverlays() {
  return (
    <>
      <CommandPalette />
      <KeyboardShortcuts />
    </>
  );
}
