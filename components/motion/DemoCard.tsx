"use client";

import { useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { RotateCcw } from "lucide-react";

/**
 * Bento cell for a motion demo. A fixed-height canvas stage on top (the demo
 * lives here, vertically centered) with clean meta below. Every card is the
 * same height so a grid of them reads as one system.
 *
 * Interaction modes:
 * - `replayable` (default): the stage is a click-to-replay target; a small
 *   replay button floats in the corner. For mount-triggered animations.
 * - `replayable={false}` + `hint`: the demo owns its interaction. Stage is
 *   passive; the hint says what to do.
 * - `loop`: the demo runs continuously as a living reference. No replay.
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
  hint,
}: {
  title: string;
  engine: "motion/react" | "CSS";
  tokens: string[];
  children: ReactNode;
  replayable?: boolean;
  loop?: boolean;
  hint?: string;
}) {
  const [runId, setRunId] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const replay = () => setRunId((n) => n + 1);

  const canReplay = replayable && !loop;
  const stageHint = hint ?? (loop ? "loops" : canReplay ? "click to replay" : undefined);
  const inner = (
    <div key={runId} className="flex w-full items-center justify-center px-6">
      {inView ? children : null}
    </div>
  );
  const stageBase = "flex h-56 w-full items-center justify-center bg-background/40";

  return (
    <div ref={ref} className="flex flex-col bg-card">
      <div className="relative border-b border-border">
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
            className={`${stageBase} cursor-pointer transition-colors duration-150 ease-[--ease-out] hover:bg-background/70`}
          >
            {inner}
          </button>
        ) : (
          <div className={stageBase}>{inner}</div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-base leading-none text-foreground">{title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            <span
              className={`h-1.5 w-1.5 rounded-full ${engine === "CSS" ? "bg-muted-foreground" : "bg-accent"}`}
            />
            {engine}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((t) => (
              <span
                key={t}
                className="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent"
              >
                {t}
              </span>
            ))}
          </div>
          {stageHint && (
            <span className="shrink-0 font-mono text-[10px] text-subtle">{stageHint}</span>
          )}
        </div>
      </div>
    </div>
  );
}
