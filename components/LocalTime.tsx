"use client";

import { useEffect, useState } from "react";
import IndiaFlag from "@/components/common/IndiaFlag";

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
 * Why the clock is a client component that renders nothing on the first pass: the
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

  // The place is static and the time is not, so only the time waits for mount.
  //
  // Before, the whole row returned null until the effect ran, which took it from
  // zero height to a line of text; because the identity block distributes its
  // rows with `justify-between`, that reflowed everything above it. Now the flag
  // and the city paint on the server and only the clock holds a reserved box.
  //
  // That box is the longest string the clock can produce, rendered invisible. In
  // a monospace face every glyph is the same width, so eight characters
  // ("12:00 AM") is the widest case and the reservation is exact rather than
  // estimated. `visibility: hidden` also keeps the placeholder out of the
  // accessibility tree, so nothing announces a time that is not real. It is not
  // a pulsing skeleton on purpose: an ambient loop for a one-frame gap would
  // draw more attention than the gap does.
  //
  // Server and first client render agree, so there is no hydration mismatch to
  // suppress.
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-subtle">
      {/* Decorative: the city beside it already carries the meaning, and a
          screen reader announcing "flag" before it would only be noise. */}
      <IndiaFlag aria-hidden className="h-2.5 w-[0.9375rem] shrink-0" />
      <span>
        {/* "BLR" is an airport code. It reads instantly to anyone who would use
            it and as three letters to everyone else, so the full name goes to
            assistive tech rather than being spelled out on screen. */}
        <span className="sr-only">Bengaluru, India. </span>
        <span aria-hidden>BLR</span>
      </span>
      <span aria-hidden>·</span>
      <span className={`tabular-nums ${time ? "" : "invisible"}`}>
        {time ?? "12:00 AM"} IST
      </span>
    </span>
  );
}
