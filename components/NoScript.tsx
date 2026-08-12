import { Info } from "lucide-react";

/**
 * A compact notice for visitors with JavaScript disabled.
 *
 * Three deliberate choices:
 *
 * 1. **The tone is reassuring, not blocking.** The previous version said this
 *    portfolio "requires JavaScript to function properly" and asked people to
 *    enable it "to continue", which was simply untrue: the pages are server
 *    rendered and read perfectly without it. Overstating the requirement tells a
 *    visitor to leave when they did not need to.
 * 2. **It names what actually breaks** rather than hedging with "some features".
 *    Everything that needs JavaScript here is a client component: the command
 *    palette, the chat assistant and the project filters. The theme toggle also
 *    stops working, because the class is applied by the blocking script in
 *    `app/layout.tsx`, so with scripts off the site stays in light mode.
 * 3. **Bottom right, and small.** There is no way to dismiss this, since
 *    dismissing it would take the JavaScript that is missing, so it has to stay
 *    out of the way permanently rather than sit centred over the content. The
 *    corner is free in this specific case: the chat button is a `dynamic` import
 *    with `ssr: false`, so it never renders when scripts are off and cannot
 *    collide with this.
 *
 * The previous version also carried roughly forty lines of SMIL animation on its
 * icon. That is a lot of markup for a notice almost nobody sees, and an animated
 * icon draws attention that a passive note does not need, so it is now a static
 * glyph.
 */
export default function NoScript() {
  return (
    <noscript>
      <div className="fixed bottom-4 right-4 z-50 max-w-[16rem] rounded-lg border border-border-strong bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur">
        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 text-subtle" />
          JavaScript is off
        </p>
        <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
          Reading works fine. Search, chat and the theme toggle need it.
        </p>
      </div>
    </noscript>
  );
}
