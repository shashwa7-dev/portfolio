"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

/**
 * Renders streaming assistant content as Markdown using the portfolio's
 * design tokens. GitHub-flavored markdown is enabled (tables, strikethrough,
 * autolinks, task lists). Code blocks use the dedicated CodeBlock component.
 */
const components: Components = {
  // Block-level elements
  p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed marker:text-accent/60">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-accent/60 pl-3 italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  // Headings — kept smaller than page headings since these live inside a chat bubble.
  h1: ({ children }) => (
    <h1 className="mt-3 mb-1 font-serif text-[15px] font-semibold tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-1 font-serif text-[14px] font-semibold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 mb-1 font-serif text-[13.5px] font-semibold tracking-tight">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-2 mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
      {children}
    </h4>
  ),

  // Inline elements
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="underline decoration-accent/50 underline-offset-2 transition-colors hover:decoration-accent hover:text-accent"
    >
      {children}
    </a>
  ),

  // Inline code vs. fenced code block. react-markdown v9 passes a className
  // like "language-tsx" only on fenced blocks; inline code has no className.
  // Accept non-word chars in the language id so c++, c#, objective-c survive.
  code: ({ className, children, ...props }) => {
    const match = /language-([\w+#-]+)/.exec(className || "");
    if (match) {
      return <CodeBlock code={String(children ?? "")} language={match[1]} />;
    }
    return (
      <code
        className="rounded bg-elevated px-1 py-0.5 font-mono text-[12px] text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },

  // GFM extras
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-2 py-1 text-left font-medium text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/60 px-2 py-1 align-top text-muted-foreground">
      {children}
    </td>
  ),
  hr: () => <hr className="my-3 border-border" />,
};

/**
 * Memoized so the streaming chat doesn't reparse the entire markdown body on
 * every token tick — only re-renders when `content` actually changes.
 */
function MarkdownMessageImpl({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}

const MarkdownMessage = memo(MarkdownMessageImpl);
export default MarkdownMessage;
