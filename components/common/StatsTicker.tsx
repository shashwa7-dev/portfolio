"use client";

import { useState } from "react";
import { Pause, Play } from "@phosphor-icons/react/ssr";
import { tickerStats } from "@/lib/stats";
import { tickerControl } from "@/lib/ticker";

function Items({ copy }: { copy?: boolean }) {
  return (
    <ul
      aria-label={copy ? undefined : "Highlights"}
      aria-hidden={copy || undefined}
      data-ticker-copy={copy ? "" : undefined}
      className="flex shrink-0 items-center gap-x-8 gap-y-2 pr-8"
    >
      {tickerStats.map((s) => (
        <li key={s.n} className="flex items-center gap-8 whitespace-nowrap text-base text-muted-foreground">
          <span>
            <strong className="text-lg font-semibold tracking-tight text-foreground">{s.n}</strong> {s.c}
            {s.context && <span className="text-subtle"> · {s.context}</span>}
          </span>
          <span aria-hidden className="text-border-strong">✦</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The intro's proof points as one slow line, clipped to the reading column and
 * faded at both edges. Rendered twice so the -50% loop is seamless; the copy is
 * hidden from assistive tech and removed entirely under reduced motion, where
 * the first list wraps instead of drifting.
 *
 * Hover pauses it for a pointer; the button pauses it for touch and keyboard.
 * The button is hidden under reduced motion, where there is nothing to pause.
 */
export default function StatsTicker() {
  const [paused, setPaused] = useState(false);
  const control = tickerControl(paused);
  const Icon = control.icon === "pause" ? Pause : Play;
  return (
    <div className="flex items-center gap-3">
      <div className="ticker-mask min-w-0 flex-1" data-paused={paused || undefined}>
        <div className="ticker-track">
          <Items />
          <Items copy />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={control.label}
        aria-pressed={paused}
        className="ticker-toggle grid h-7 w-7 shrink-0 place-items-center rounded-md text-subtle transition-colors duration-fast ease-out hover:bg-muted hover:text-foreground"
      >
        <Icon aria-hidden weight="fill" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
