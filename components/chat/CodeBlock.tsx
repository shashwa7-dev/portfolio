"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlight } from "sugar-high";
import { cn } from "@/lib/utils";

type Props = {
  /** Raw source code (no surrounding fences). */
  code: string;
  /** Language hint from the ```lang fence, if any. */
  language?: string;
};

/**
 * Multi-line code block for chat messages. Renders with sugar-high coloring,
 * shows the language label and a copy button in the top-right corner.
 */
export default function CodeBlock({ code, language }: Props) {
  const [copied, setCopied] = useState(false);
  const html = highlight(code.replace(/\n$/, ""));

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard denied — silently ignore
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-elevated px-2.5 py-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide transition-colors",
            copied
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 text-[12.5px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
