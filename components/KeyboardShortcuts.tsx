"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { backdropFadeVariants, dialogPopVariants } from "@/lib/motionVariants";
import { useDarkMode } from "@/app/hooks/useDarkMode";
import { goToShortcuts, shortcutGroups } from "@/lib/shortcutsData";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export default function KeyboardShortcuts() {
  const router = useRouter();
  const { toggleDarkMode } = useDarkMode();
  const [helpOpen, setHelpOpen] = useState(false);

  // `g`-prefix state lives in refs so the listener stays stable.
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Esc closes the overlay and cancels any pending sequence.
      if (e.key === "Escape") {
        setHelpOpen(false);
        gPending.current = false;
        return;
      }

      // Skip while typing or when a modifier is held (Cmd+K is handled elsewhere).
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      // Second key of a `g` sequence: jump to a destination.
      if (gPending.current) {
        gPending.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        const dest = goToShortcuts.find((g) => g.key === e.key.toLowerCase());
        if (dest) {
          e.preventDefault();
          setHelpOpen(false);
          router.push(dest.href);
        }
        return;
      }

      if (e.key === "g") {
        gPending.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => (gPending.current = false), 1200);
        return;
      }

      if (e.key === "t") {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((o) => !o);
      }
    };

    const onOpen = () => setHelpOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-shortcuts", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-shortcuts", onOpen as EventListener);
    };
  }, [router, toggleDarkMode]);

  return (
    <AnimatePresence>
      {helpOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4"
          variants={backdropFadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => setHelpOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-border-strong bg-elevated shadow-2xl"
            variants={dialogPopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                Keyboard shortcuts
              </span>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                aria-label="Close"
                className="text-subtle transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              {shortcutGroups.map((group) => (
                <div key={group.title}>
                  <div className="px-1 pb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                    {group.title}
                  </div>
                  <ul className="space-y-1.5">
                    {group.items.map((s) => (
                      <li
                        key={s.label}
                        className="flex items-center justify-between px-1 text-sm text-foreground"
                      >
                        <span>{s.label}</span>
                        <span className="flex items-center gap-1">
                          {s.keys.map((k, i) => (
                            <kbd
                              key={i}
                              className="grid h-6 min-w-[24px] place-items-center rounded-md border border-border-strong bg-card px-1.5 font-mono text-[11px] text-muted-foreground"
                            >
                              {k}
                            </kbd>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
