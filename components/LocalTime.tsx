"use client";

import { useEffect, useState } from "react";

/** Shashwat's timezone, not the visitor's. That is the whole point of showing it. */
const TIME_ZONE = "Asia/Kolkata";

function format() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

/**
 * The current time where Shashwat is.
 *
 * Why it earns a place in the hero: he sells remote and contract work, so "what
 * hours does this person overlap with mine" is a question a client actually has,
 * and a live clock answers it more concretely than naming a city does.
 *
 * Why it is a client component that renders nothing on the first pass: the
 * homepage is statically generated, so any time computed during render is baked
 * at build time and would be wrong forever after. Returning null until the mount
 * effect runs also avoids a hydration mismatch, which a server-rendered
 * placeholder time would guarantee.
 *
 * The interval is 30 seconds rather than one. Display precision is minutes, so a
 * per-second timer would do sixty times the work to change the same digits, and
 * the worst case is a clock that is briefly half a minute stale.
 */
export default function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(format());
    const id = setInterval(() => setTime(format()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Before mount, reserve the box instead of rendering nothing.
  //
  // Returning null meant this row went from zero height to a line of text once
  // the effect ran, and because the identity block distributes its rows with
  // `justify-between`, that reflowed everything above it. The delay is usually a
  // single frame, but it is however long hydration takes, so on a slow connection
  // it was a visible jump.
  //
  // The placeholder is the longest string this can ever produce, rendered
  // invisible. In a monospace face every glyph is the same width, so twelve
  // characters ("12:00 AM IST") is the widest case and the reserved box is exact
  // rather than estimated. It is not a pulsing skeleton on purpose: an ambient
  // loop for a one-frame gap would draw more attention than the gap does.
  //
  // Server and first client render agree on this branch, so there is no hydration
  // mismatch to suppress.
  if (!time) {
    return (
      <span
        aria-hidden
        className="invisible font-mono text-2xs uppercase tracking-label text-subtle"
      >
        12:00 AM IST
      </span>
    );
  }

  return (
    <span className="font-mono text-2xs uppercase tracking-label tabular-nums text-subtle">
      {time} IST
    </span>
  );
}
