"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useDarkMode } from "@/app/hooks/useDarkMode";
import { buildCommands, filterCommands, type Command } from "@/lib/commandData";

export default function CommandPalette() {
  const router = useRouter();
  const { toggleDarkMode } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const all = useMemo(() => buildCommands(), []);
  const results = useMemo(() => filterCommands(all, q), [all, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);
  useEffect(() => setActive(0), [q]);

  const run = (c: Command) => {
    setOpen(false);
    if (c.href) router.push(c.href);
    else if (c.action === "toggle-theme") toggleDarkMode();
    else if (c.action === "copy-email") navigator.clipboard?.writeText("contact@shashwa7.in");
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  };

  const groups = ["Navigation", "Projects", "Actions"] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command menu"
        >
          <motion.div
            className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-border-strong bg-elevated shadow-2xl"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects, sections, actions…"
              className="w-full border-b border-border bg-transparent px-4 py-4 text-[15px] text-foreground outline-none placeholder:text-subtle"
              aria-label="Search commands"
            />
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-subtle">No results</div>
              )}
              {groups.map((g) => {
                const items = results.filter((r) => r.group === g);
                if (items.length === 0) return null;
                return (
                  <div key={g} className="mb-1">
                    <div className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{g}</div>
                    {items.map((c) => {
                      const idx = results.indexOf(c);
                      return (
                        <button
                          key={c.id}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => run(c)}
                          className={`flex w-full items-center rounded-[9px] px-3 py-2 text-left text-sm ${
                            idx === active ? "bg-accent text-accent-foreground" : "text-foreground"
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
