"use client";

import { useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { RotateCcw } from "lucide-react";

/**
 * Bento cell for a motion demo: header (title + engine), a recessed stage, and
 * a footer (token chips + hint).
 *
 * Three interaction modes, chosen per demo:
 * - `replayable` (default): the whole stage is a click-to-replay target and the
 *   corner button replays too. For mount-triggered animations.
 * - `replayable={false}` + `hint`: the demo owns its interaction (a toggle, tabs,
 *   a like button). The stage is passive; the hint says what to do.
 * - `loop`: the demo animates continuously as a living reference. No replay.
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
  const stageHint = hint ?? (canReplay ? "click to replay" : loop ? "loops" : undefined);
  const stage = (
    <div key={runId} className="flex w-full items-center justify-center">
      {inView ? children : null}
    </div>
  );
  const stageClass =
    "relative flex min-h-[168px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/50 px-6 py-8";

  return (
    <div ref={ref} className="group/demo flex min-h-[300px] flex-col bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="font-serif text-base leading-none text-foreground">{title}</h3>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            <span
              className={`h-1.5 w-1.5 rounded-full ${engine === "CSS" ? "bg-muted-foreground" : "bg-accent"}`}
            />
            {engine}
          </span>
        </div>
        {canReplay && (
          <button
            type="button"
            aria-label={`Replay ${title}`}
            onClick={replay}
            className="rounded-full border border-border-strong p-2 text-muted-foreground transition-[color,background-color,transform] duration-150 ease-[--ease-out] hover:bg-muted hover:text-foreground active:scale-[0.94]"
          >
            <RotateCcw className="h-3.5 w-3.5 transition-transform duration-300 ease-[--ease-out] group-hover/demo:-rotate-90" />
          </button>
        )}
      </div>

      {canReplay ? (
        <button
          type="button"
          onClick={replay}
          aria-label={`Replay ${title}`}
          className={`${stageClass} cursor-pointer transition-colors duration-150 ease-[--ease-out] hover:border-border-strong hover:bg-background/70`}
        >
          {stage}
        </button>
      ) : (
        <div className={stageClass}>{stage}</div>
      )}

      <div className="mt-4 flex items-end justify-between gap-3">
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
        {stageHint && <span className="shrink-0 font-mono text-[10px] text-subtle">{stageHint}</span>}
      </div>
    </div>
  );
}
