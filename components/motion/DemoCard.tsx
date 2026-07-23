"use client";

import { useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { RotateCcw } from "lucide-react";

/**
 * Bento cell for a motion demo: title, engine tag, token chips, and a stage.
 *
 * Three interaction modes, chosen per demo:
 * - `replayable` (default): the whole stage is a click-to-replay target with a
 *   visible hint, and the corner button replays too. For mount-triggered
 *   animations (reveals, draws, the principle demos).
 * - `replayable={false}` + `hint`: the demo owns its own interaction (a spring
 *   toggle, tabs, a like button). The stage is passive; the hint tells the user
 *   what to do ("click to toggle").
 * - `loop`: the demo animates continuously as a living reference (easing,
 *   duration scales). No replay affordance, it never goes static.
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

  // A looping demo drives itself; only mount-triggered demos expose replay.
  const canReplay = replayable && !loop;
  const stageHint = hint ?? (canReplay ? "click to replay" : loop ? "loops continuously" : undefined);
  const stage = (
    <div key={runId} className="flex w-full items-center justify-center px-2">
      {inView ? children : null}
    </div>
  );

  return (
    <div ref={ref} className="group/demo flex flex-col gap-4 bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-foreground">{title}</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{engine}</p>
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
          className="flex min-h-[140px] flex-1 cursor-pointer items-center justify-center rounded-xl border border-transparent transition-colors duration-150 ease-[--ease-out] hover:border-border hover:bg-elevated/40"
        >
          {stage}
        </button>
      ) : (
        <div className="flex min-h-[140px] flex-1 items-center justify-center">{stage}</div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t) => (
            <span key={t} className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] text-accent">
              {t}
            </span>
          ))}
        </div>
        {stageHint && (
          <span className="shrink-0 font-mono text-[10px] text-subtle">{stageHint}</span>
        )}
      </div>
    </div>
  );
}
