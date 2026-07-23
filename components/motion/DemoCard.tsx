"use client";

import { useRef, useState, type ReactNode } from "react";
import { useInView } from "motion/react";
import { RotateCcw } from "lucide-react";

/** Bento cell for a motion demo: title, engine tag, token list, replay.
    Renders children only once scrolled into view so enter animations are seen. */
export default function DemoCard({
  title,
  engine,
  tokens,
  children,
  replayable = true,
}: {
  title: string;
  engine: "motion/react" | "CSS";
  tokens: string[];
  children: ReactNode;
  replayable?: boolean;
}) {
  const [runId, setRunId] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="flex flex-col gap-4 bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-foreground">{title}</h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{engine}</p>
        </div>
        {replayable && (
          <button
            type="button"
            aria-label={`Replay ${title}`}
            onClick={() => setRunId((n) => n + 1)}
            className="rounded-full border border-border-strong p-2 text-muted-foreground transition-[color,background-color,transform] duration-150 ease-[--ease-out] hover:bg-muted hover:text-foreground active:scale-[0.94]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div key={runId} className="flex min-h-[120px] flex-1 items-center justify-center">
        {inView ? children : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((t) => (
          <span key={t} className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] text-accent">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
