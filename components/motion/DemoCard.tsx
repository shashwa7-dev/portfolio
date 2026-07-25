"use client";

import { useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { RotateCcw } from "lucide-react";

/**
 * Bento cell for a motion demo. The stage grows to fill the card and centers
 * the demo, so cards of different content still read as one system (the demo
 * sits in the optical middle, with symmetric padding, never top-pinned with a
 * dead gap below). A compact meta strip is pinned to the bottom.
 *
 * - `replayable` (default): stage is a click-to-replay target; a replay button
 *   floats in the corner. For mount-triggered animations.
 * - `replayable={false}`: the demo owns its interaction (a visible button/toggle).
 * - `loop`: the demo runs continuously. No replay.
 *
 * Children mount only once scrolled into view so enter animations are seen.
 */
export default function DemoCard({
  title,
  engine,
  tokens,
  children,
  replayable = true,
  loop = false,
}: {
  title: string;
  engine: "motion/react" | "CSS";
  tokens: string[];
  children: ReactNode;
  replayable?: boolean;
  loop?: boolean;
  /** accepted for API compatibility; interactivity is shown by the demo's own controls */
  hint?: string;
}) {
  const [runId, setRunId] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const replay = () => setRunId((n) => n + 1);
  const canReplay = replayable && !loop;

  const inner = (
    <div key={runId} className="flex w-full items-center justify-center">
      {inView ? children : null}
    </div>
  );
  const stageBase = "flex flex-1 items-center justify-center px-8 py-12";

  return (
    <div ref={ref} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative flex flex-1 flex-col">
        {canReplay && (
          <button
            type="button"
            aria-label={`Replay ${title}`}
            onClick={replay}
            className="absolute right-3 top-3 z-10 rounded-full border border-border-strong bg-card/70 p-1.5 text-subtle backdrop-blur transition-[color,background-color,transform] duration-150 ease-[--ease-out] hover:bg-muted hover:text-foreground active:scale-[0.94]"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
        {canReplay ? (
          <button
            type="button"
            aria-label={`Replay ${title}`}
            onClick={replay}
            className={`${stageBase} w-full cursor-pointer transition-colors duration-150 ease-[--ease-out] hover:bg-muted/20`}
          >
            {inner}
          </button>
        ) : (
          <div className={stageBase}>{inner}</div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border p-5">
        <div className="min-w-0">
          <h3 className="font-serif text-[15px] leading-tight text-foreground">{title}</h3>
          <p className="mt-1 truncate font-mono text-[10px] text-subtle">{tokens.join("  ·  ")}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          <span
            className={`h-1.5 w-1.5 rounded-full ${engine === "CSS" ? "bg-muted-foreground" : "bg-accent"}`}
          />
          {engine}
        </span>
      </div>
    </div>
  );
}
