"use client";

/**
 * A minimal popover primitive. There is no popover or dropdown in this repo's
 * dependency tree (only accordion, badge, button and tooltip from Radix), and
 * the one caller that needs this (the card's share menu) needs exactly three
 * items, so this is intentionally small rather than a general menu system:
 * no portal, no positioning engine, no keyboard roving-focus between items.
 *
 * What it does carry, because every caller needs it regardless of size:
 * click-outside to close, Escape to close, focus returned to the trigger on
 * close, and `aria-expanded` / `aria-haspopup` wired onto the trigger.
 *
 * Usage mirrors this file's Tooltip/Accordion neighbours:
 *   <Popover open={open} onOpenChange={setOpen}>
 *     <PopoverTrigger aria-label="...">...</PopoverTrigger>
 *     <PopoverContent align="end">...</PopoverContent>
 *   </Popover>
 *
 * `open`/`onOpenChange` are optional: omitted, the popover manages its own
 * state (a plain click on the trigger toggles it). The card's share button
 * passes both, plus its own `onClick` on the trigger, because opening it is
 * conditional there (native share wins first on a device that has it) rather
 * than a bare toggle.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string): PopoverContextValue {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error(`<${component} /> must be rendered inside <Popover>`);
  return ctx;
}

function Popover({
  open: openProp,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-flex">{children}</div>
    </PopoverContext.Provider>
  );
}

/**
 * Renders a real `<button>`. A custom `onClick` fully replaces the default
 * open-toggle rather than running alongside it, since the one caller that
 * needs this (the share trigger) has to decide open-or-native-share for
 * itself; every other prop (aria-expanded, aria-haspopup, the ref the
 * outside-click and focus-return logic below key off) is still wired
 * automatically regardless of which onClick is in play.
 */
const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, forwardedRef) => {
    const { open, setOpen, triggerRef } = usePopoverContext("PopoverTrigger");

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={onClick ?? (() => setOpen(!open))}
        {...props}
      />
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

function PopoverContent({
  className,
  align = "end",
  children,
}: {
  className?: string;
  /** Which edge the panel hangs from, under the trigger. */
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  const { open, setOpen, triggerRef } = usePopoverContext("PopoverContent");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const wasOpenRef = React.useRef(open);

  React.useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (contentRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen, triggerRef]);

  // Focus back to the trigger on every close, whatever closed it (Escape,
  // an outside click, or an item inside `children` calling setOpen(false)
  // after acting): a plain `useEffect` keyed on `open` sees every one of
  // those the same way, as a true-to-false transition, rather than needing
  // a separate handler per closing path.
  React.useEffect(() => {
    if (wasOpenRef.current && !open) triggerRef.current?.focus();
    wasOpenRef.current = open;
  }, [open, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full z-50 mt-2 min-w-[9rem] rounded-md border border-border bg-elevated p-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
