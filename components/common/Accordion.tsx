"use client";

import { useState, useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Animated disclosure. Grid-rows 0fr→1fr so height animates on GPU-friendly
    terms without measuring; padding lives on the inner div so the closed
    track collapses fully. */
export default function Accordion({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-foreground transition-colors hover:bg-card"
      >
        <span>{summary}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] ease-[--ease-out] ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-[var(--duration-med)] ease-[--ease-out]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 text-base leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
