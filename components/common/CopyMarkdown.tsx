"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import IconSwap from "@/components/common/IconSwap";

/**
 * The end of a post, offering it as markdown for readers who want to hand the
 * whole thing to an assistant.
 *
 * At the foot rather than in the meta row under the title. Up there it sat
 * beside the date and the reading time, which are facts about the post, and it
 * asked the reader to take the article somewhere before they had read a line of
 * it. Down here it is the natural next thing, and it can afford a sentence
 * saying what it does.
 *
 * It fetches rather than receiving the body as a prop. The markdown already
 * exists at `/blogs/<slug>/markdown`, statically generated from the same MDX
 * the page renders, so passing it down would ship every article twice: once as
 * HTML and once as a string in this component's payload. A long post is around
 * 20KB, which is a lot to send every reader on the chance one of them presses
 * the button.
 *
 * Deliberately not a row of "open in ChatGPT / Claude / Perplexity" links.
 * Those pass the prompt in a query string, and a query string dies somewhere
 * around 2,000 characters, so the article cannot travel in one. The only thing
 * that fits is the page URL, which leaves the assistant to fetch it, which it
 * frequently cannot. That failure is silent and comes back looking like a
 * summary. The clipboard has no length limit and no vendor attached to it.
 */
export default function CopyMarkdown({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const href = `/blogs/${slug}/markdown`;

  const onCopy = async () => {
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error(String(res.status));
      await navigator.clipboard.writeText(await res.text());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* `navigator.clipboard` needs a secure context and can reject when the
         document is not focused, and the fetch can fail offline. Either way the
         reader wanted the markdown, so hand them the page it lives on rather
         than an error they cannot act on. */
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <aside className="mt-12 rounded-lg border border-border bg-card p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
      <div className="min-w-0">
        <p className="font-mono text-2xs uppercase tracking-label text-subtle">
          Take it with you
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The whole post as markdown, ready to paste into an assistant.
        </p>
      </div>

      <div className="mt-3.5 flex shrink-0 items-center gap-2 sm:mt-0">
        {/* No `aria-label`: a fixed one would override the text inside and
            freeze the accessible name at "Copy", so the swap to "Copied" would
            never be announced. IconSwap flips `aria-hidden` between the two,
            which leaves exactly one of them naming the button at any moment. */}
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "inline-flex h-9 items-center rounded-md px-4 text-sm font-semibold",
            "transition-[background-color,transform] duration-fast ease-out active:scale-[0.97]",
            "bg-accent text-accent-foreground hover:bg-accent-hover"
          )}
        >
          <IconSwap
            swapped={copied}
            from={
              <>
                <Copy aria-hidden className="h-3.5 w-3.5" /> Copy
              </>
            }
            to={
              <>
                <Check aria-hidden className="h-3.5 w-3.5" /> Copied
              </>
            }
          />
        </button>

        {/* The same file as a destination rather than a clipboard write, for
            anyone who would rather have a URL to paste than a buffer to hold.
            Not `download`: it is served as `text/markdown`, so the browser
            renders it and the reader can see what they are about to take. */}
        <a
          href={href}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong px-4 text-sm text-muted-foreground transition-colors duration-fast ease-out hover:bg-muted hover:text-foreground"
        >
          <FileText aria-hidden className="h-3.5 w-3.5" />
          View raw
        </a>
      </div>
    </aside>
  );
}
