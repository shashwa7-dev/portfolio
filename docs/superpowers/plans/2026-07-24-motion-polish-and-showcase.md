# Motion Polish + /motion Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize every animation on the site onto one token scale, fix the unpolished spots found in the 2026-07-24 audit, and ship a `/motion` route that showcases the motion system with interactive demos.

**Architecture:** `lib/motionVariants.ts` stays the single source of truth for timing (TS side), mirrored by `--duration-*` / `--ease-*` CSS vars in `app/globals.css` (already landed). Components never carry literal durations/easings. motion/react drives stateful/orchestrated animation; plain CSS drives simple hovers and loops. `/motion` is a server page composing small client demo components from `components/motion/`.

**Tech Stack:** Next.js 14 App Router, motion/react, Tailwind, vendored `transitions-dev` skill (recipes adapted to our tokens, not pasted verbatim).

**Verification:** No test runner exists in this repo. Every task ends with `npx tsc --noEmit` + `npm run lint` clean, plus a visual check on the dev server (port 3001) where the change is user-visible.

**Already landed before this plan (context, do not redo):** motion-token CSS vars + link-hover fix + `.prose a` `transition-colors` in `globals.css`; `wordCycle` tokens + hero word cycle; vendored `.claude/skills/transitions-dev/`; `transitions-dev` slug in `lib/skillsData.ts`; `nav-motion` entry in `lib/commandData.ts`.

**Convention reminders (CLAUDE.md):** no em-dashes in user-facing copy; page `<main>` padding `py-8 md:py-12`; no per-page Navbar; motion literals only in `lib/motionVariants.ts`.

---

## Phase 1 — Token foundation (`lib/motionVariants.ts`)

### Task 1: Stagger tokens, draw duration, asymmetric exits

**Files:**
- Modify: `lib/motionVariants.ts`

- [ ] **Step 1: Add `stagger` + `duration.draw` tokens**

After the `duration` export, add; also add `draw: 0.7` inside `duration`:

```ts
export const duration = {
  fast: 0.15,
  base: 0.2,
  med: 0.3,
  slow: 0.4,
  hero: 0.5,
  /** Long draw-on strokes (Marker underline). */
  draw: 0.7,
} as const;

/** Per-item stagger offsets (seconds). Use instead of literal `i * 0.05`. */
export const stagger = {
  /** Tight lists: chips, palette rows. */
  tight: 0.04,
  /** Default list/grid stagger. */
  base: 0.06,
  /** Card grids, nav cards. */
  loose: 0.08,
  /** Sequenced page sections (404 page blocks). */
  section: 0.2,
} as const;
```

- [ ] **Step 2: Tokenize `popoverDownVariants` and give it a faster exit**

```ts
export const popoverDownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: duration.fast, ease: ease.out } },
};
```

- [ ] **Step 3: Make exits faster than enters on the remaining symmetric variants**

`dialogPopVariants`, `backdropFadeVariants`, `popoverUpVariants`, `pillUpVariants`: change each `exit` transition duration to `duration.fast` (keep easing as-is). Example for `dialogPopVariants`:

```ts
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast, ease: ease.modal } },
```

- [ ] **Step 4: Give `collapseHeightVariants` explicit tokens (used by Navbar mobile menu)**

```ts
export const collapseHeightVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: duration.med, ease: ease.out } },
  exit: { opacity: 0, height: 0, transition: { duration: duration.base, ease: ease.out } },
};
```

- [ ] **Step 5: Remove unused exports `slideUpContainerVariants` and `hoverLift`**

First verify zero consumers (audit found none):

Run: `grep -rn "slideUpContainerVariants\|hoverLift\b" app components lib --include="*.tsx" --include="*.ts" | grep -v motionVariants`
Expected: no output. Then delete both exports. If a consumer appears, keep that export and skip its deletion.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean (except pre-existing CardNav `<img>` warning).

- [ ] **Step 7: Commit**

```bash
git add lib/motionVariants.ts
git commit -m "feat(motion): stagger tokens, draw duration, asymmetric exits"
```

### Task 2: Dead keyframes + global hover gating

**Files:**
- Modify: `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Verify the globals keyframes are unused**

Run: `grep -rn "animate-float\|animate-spin-slow\|animate-spin-reverse\|dots\b\|animate-fadeIn" app components --include="*.tsx"`
Expected: no output (audit found none). Delete from `globals.css`: `@keyframes float`, `@keyframes spin-slow`, `@keyframes spin-reverse`, `@keyframes ellipsis` and the `.animate-float`, `.animate-spin-slow`, `.animate-spin-reverse`, `.dots::after` rules. If any consumer shows up, keep that pair.

- [ ] **Step 2: Clean `tailwind.config.ts`**

Remove `animation.float` + `animation.fadeIn` and `keyframes.fadeIn` (only if Step 1 grep found no `animate-fadeIn`/`animate-float` consumers; there is no `keyframes.float` in the config so the utility was silently using the globals.css one). Remove `transitionDuration` `2000`/`4000` after: `grep -rn "duration-2000\|duration-4000" app components` returns nothing.

- [ ] **Step 3: Gate every Tailwind `hover:` behind real hover support**

In `tailwind.config.ts` top level add:

```ts
  future: {
    hoverOnlyWhenSupported: true,
  },
```

This fixes all HOVER UNGATED findings (Clients, About avatars, ProjectShowcaseCard, BlogPosts, AvatarWithThemeSwitch, CardNav) in one move: `hover:` variants compile inside `@media (hover: hover) and (pointer: fine)`.

- [ ] **Step 4: Verify + visual check**

Run: `npx tsc --noEmit && npm run lint && curl -s -o /dev/null -w "%{http_code}" http://localhost:3001`
Expected: clean, 200. Visually confirm hover lifts still work on desktop (cards on homepage).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "chore(motion): drop dead keyframes, gate hover styles on hover-capable devices"
```

---

## Phase 2 — Fix the drift (audit findings, by file)

### Task 3: Enumerate every `transition-all`

**Files (exact sites from audit):**
- Modify: `components/BookListItem.tsx:65,119` → `transition-[width]`
- Modify: `components/common/Book.tsx:65` → `transition-[width]`
- Modify: `components/ChatBot.tsx:419` → `transition-colors`
- Modify: `components/Clients.tsx:46` → `transition-[opacity,filter] duration-300`
- Modify: `components/Avatar.tsx:243,250` → `transition-[transform,opacity] duration-200`; `:257` → `transition-transform duration-300`
- Modify: `components/ProjectShowcaseCard.tsx:11` → `transition-[transform,border-color] duration-300`
- Modify: `components/BlogPosts.tsx:16` → `transition-[transform,border-color] duration-300`
- Modify: `app/design/page.tsx:588` → `transition-colors`; `:605` → `transition-[box-shadow,border-color]`

- [ ] **Step 1: Apply each replacement above** (keep every other class on the line untouched; keep existing durations unless listed)
- [ ] **Step 2: Verify**

Run: `grep -rn "transition-all" app components --include="*.tsx"; grep -n "transition-all" app/globals.css`
Expected: no output.

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components app/design/page.tsx
git commit -m "fix(motion): enumerate transition properties, no more transition-all"
```

### Task 4: Keyboard-initiated surfaces get near-instant treatment

Emil rule: never make keyboard-repeated actions feel slow. Palette/help overlay stay animated but drop to fast, asymmetric timing (Task 1 already made exits fast).

**Files:**
- Modify: `components/CommandPalette.tsx`
- Modify: `components/KeyboardShortcuts.tsx`

- [ ] **Step 1: CommandPalette panel: swap `popoverDownVariants` for a dedicated fast variant**

Add to `lib/motionVariants.ts`:

```ts
/** Keyboard-summoned surfaces (⌘K palette, ? overlay): fast in, faster out, minimal travel. */
export const keyboardSurfaceVariants: Variants = {
  hidden: { opacity: 0, y: -4, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.fast, ease: ease.out } },
  exit: { opacity: 0, scale: 0.99, transition: { duration: 0.1, ease: ease.out } },
};
```

(The `0.1` literal lives in the token file, which is allowed.) Use it in `CommandPalette.tsx` (replace `popoverDownVariants` import/usage) and for the `KeyboardShortcuts.tsx` panel (replace `dialogPopVariants`).

- [ ] **Step 2: Verify behavior**

Dev server: hit ⌘K repeatedly and `?` — open/close should feel immediate, no perceptible lag. `npx tsc --noEmit && npm run lint` clean.

- [ ] **Step 3: Commit**

```bash
git add lib/motionVariants.ts components/CommandPalette.tsx components/KeyboardShortcuts.tsx
git commit -m "feat(motion): near-instant keyboard surfaces (palette, shortcuts overlay)"
```

### Task 5: Press states everywhere (match `ui/button.tsx`)

Canonical pattern (`components/ui/button.tsx:8`): `transition-[color,background-color,border-color,transform] duration-150 ease-[--ease-out] active:scale-[0.97]`.

**Files + exact targets:**
- Modify: `components/Navbar.tsx:47-71` — ⌘K button, theme toggle, menu button: append `transition-transform active:scale-[0.94]` (keep `transition-colors` → merge to `transition-[color,transform]`)
- Modify: `components/About.tsx:166-177` — both CTA `<a>`s: append `active:scale-[0.97]`, merge transitions to `transition-[color,background-color,transform]`
- Modify: `app/work/[org]/[project]/page.tsx:36-42,166-208` — back link + external link buttons: append `active:scale-[0.97]` and add `transform` to the enumerated transition
- Modify: `components/ChatBot.tsx` — sample-prompt buttons (412): add `whileTap={tapPress}`; close (372), send (524), new-messages pill (493): add `active:scale-[0.94]` + transform in transition list
- Modify: `components/KeyboardShortcuts.tsx:105` and `components/BookListItem.tsx:34,88` links: `active:scale-[0.98]`
- Modify: `components/AvatarWithThemeSwitch.tsx:17` — clickable div: add `active:scale-95`, plus `role="button"` `tabIndex={0}` if not present
- Modify: `components/ProjectShowcaseCard.tsx:11`, `components/BlogPosts.tsx:16` — card links: `active:scale-[0.99]`

- [ ] **Step 1: Apply each change** (small scales for small targets 0.94, standard 0.97, cards 0.99)
- [ ] **Step 2: Verify**: click things on dev server; `npx tsc --noEmit && npm run lint` clean.
- [ ] **Step 3: Commit**

```bash
git add components app/work
git commit -m "feat(motion): press feedback on every pressable, matching ui/button"
```

### Task 6: Tokenize the stragglers

**Files:**
- Modify: `components/ui/CardNav/variants.ts` — import `{ ease, duration, stagger }`; replace `0.4`→`duration.slow`, `0.25`→`duration.base`, `0.3`→`duration.med`, `staggerChildren: 0.08`/`delay: i*0.08`→`stagger.loose`, `"easeOut"`→`ease.out`
- Modify: `app/not-found.tsx:45,62,79,106` — delays `0.2/0.2/0.4/0.6` → `stagger.section`, `stagger.section`, `stagger.section * 2`, `stagger.section * 3`; `duration.hero * 2` stays (token arithmetic is fine, add a comment "slow decorative glow")
- Modify: `app/work/[org]/[project]/page.tsx:91,119` — `delay: 0.1` → `stagger.loose` (0.08s, visually identical) and `delay: 0.2` → `stagger.section`
- Modify: `components/ChatBot.tsx:417` — `delay: 0.1 + idx * 0.05` → `delay: stagger.loose + idx * stagger.tight`; `chatDotPulse` styled-jsx: keep keyframes but set `animation-duration` from a constant `DOT_PULSE_S = 1.2` defined next to it with a comment pointing at motionVariants if reused (single-use local loop is acceptable) — simpler: leave keyframes, add `/* decorative loop, intentionally local */` comment
- Modify: `components/common/Marker.tsx:59,61` — `0.7`→`duration.draw`, `0.01` stays (it is an opacity snap, add comment `/* snap, not a transition */`)
- Modify: `components/AnimatedBackground.tsx:79-81` — keep 2s enter but move it to a named local constant is not allowed; add `duration.ambient: 2` to the `duration` token map and use `duration.ambient`; give exit `transition={{ duration: duration.med }}`
- Modify: `components/AvatarWithThemeSwitch.tsx:17` — `duration-500 ease-in-out` → `duration-300 ease-[--ease-out]`
- Modify: `components/Faq.tsx:26` — `duration-200` stays (matches `--duration-base`), change nothing else here (accordion body animation is Task 7)
- Modify: `components/Avatar.tsx` — gate JS eye-tracking + blink behind `useReducedMotion` from motion/react: `const reduce = useReducedMotion()` and early-return from the mousemove handler / skip blink interval when `reduce`

- [ ] **Step 1: Apply each change**
- [ ] **Step 2: Add `ambient: 2` to `duration` in `lib/motionVariants.ts`** with comment `/** Ambient background fades. */`
- [ ] **Step 3: Verify**: `npx tsc --noEmit && npm run lint` clean; homepage + 404 + org project page look unchanged at normal speed.
- [ ] **Step 4: Commit**

```bash
git add components app lib/motionVariants.ts
git commit -m "refactor(motion): all component timing reads from motionVariants tokens"
```

### Task 7: FAQ accordion actually animates

Native `<details>` pops open instantly (audit: only the chevron animates). Convert to the grid-rows accordion pattern (transitions.dev 21 adapted to tokens), reusable by the /motion demo.

**Files:**
- Create: `components/common/Accordion.tsx`
- Modify: `components/Faq.tsx`

- [ ] **Step 1: Create `components/common/Accordion.tsx`**

```tsx
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
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-foreground transition-colors hover:text-accent-hover"
      >
        <span className="font-medium">{summary}</span>
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
          <div className="pb-4 text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Swap `components/Faq.tsx` `<details>`/`<summary>` markup for `<Accordion summary={q}>{a}</Accordion>`**, preserving current copy and outer Section wrapper. Delete the now-dead chevron/`group-open` classes.
- [ ] **Step 3: Verify**: FAQ opens/closes smoothly on dev server; content reachable with keyboard (button + aria-expanded). `npx tsc --noEmit && npm run lint` clean.
- [ ] **Step 4: Commit**

```bash
git add components/common/Accordion.tsx components/Faq.tsx
git commit -m "feat(faq): animated accordion, grid-rows pattern"
```

---

## Phase 3 — /motion showcase route

### Task 8: Demo scaffolding

**Files:**
- Create: `components/motion/DemoCard.tsx`

- [ ] **Step 1: Create the shared demo shell**

Children mount only when the card scrolls into view (`useInView`), so mount-triggered enter animations play when the visitor can actually see them; the replay button remounts via `key`.

```tsx
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
```

Note: the `key={runId}` remount is what makes enter animations replayable; demos that manage their own state (tabs, accordion) pass `replayable={false}`.

- [ ] **Step 2: Verify + commit**

`npx tsc --noEmit` clean.

```bash
git add components/motion/DemoCard.tsx
git commit -m "feat(motion-page): DemoCard shell"
```

### Task 9: The demos

**Files (all Create, all `"use client"`, all in `components/motion/`):**

- [ ] **Step 1: `EasingDemo.tsx`** — four tracks, a dot slides left→right on replay, one per easing token

```tsx
"use client";

import { motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const curves = [
  { name: "ease.out", value: ease.out },
  { name: "ease.modal", value: ease.modal },
  { name: "ease.expo", value: ease.expo },
] as const;

export default function EasingDemo() {
  return (
    <div className="w-full space-y-3">
      {curves.map((c) => (
        <div key={c.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-[10px] text-subtle">{c.name}</span>
          <div className="relative h-2 flex-1 rounded-full bg-muted">
            <motion.div
              className="absolute -top-1 h-4 w-4 rounded-full bg-accent"
              initial={{ left: "0%" }}
              animate={{ left: "calc(100% - 16px)" }}
              transition={{ duration: duration.hero, ease: c.value }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: `DurationDemo.tsx`** — bars grow with the same easing, one per duration token (`fast/base/med/slow/hero`), labels show ms

```tsx
"use client";

import { motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const steps = (["fast", "base", "med", "slow", "hero"] as const).map((k) => ({
  name: `duration.${k}`,
  s: duration[k],
}));

export default function DurationDemo() {
  return (
    <div className="w-full space-y-2">
      {steps.map((d) => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="w-28 shrink-0 font-mono text-[10px] text-subtle">{d.name}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full origin-left rounded-full bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: d.s, ease: ease.out }}
            />
          </div>
          <span className="w-12 text-right font-mono text-[10px] text-subtle">{d.s * 1000}ms</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `RevealStaggerDemo.tsx`** — 6 tiles enter via `containerVariants` + `itemVariants`

```tsx
"use client";

import { motion } from "motion/react";
import { containerVariants, itemVariants } from "@/lib/motionVariants";

export default function RevealStaggerDemo() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid w-full grid-cols-3 gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div key={i} variants={itemVariants} className="h-12 rounded-lg border border-border bg-elevated" />
      ))}
    </motion.div>
  );
}
```

- [ ] **Step 4: `SpringDemo.tsx`** — three chips toggle position on click, one per spring token, labels `spring.soft/pop/hoverIn`

```tsx
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/motionVariants";

const springs = [
  { name: "spring.soft", t: spring.soft },
  { name: "spring.pop", t: spring.pop },
  { name: "spring.hoverIn", t: spring.hoverIn },
] as const;

export default function SpringDemo() {
  const [right, setRight] = useState(false);

  return (
    <button type="button" onClick={() => setRight((r) => !r)} className="w-full space-y-3" aria-label="Toggle springs">
      {springs.map((s) => (
        <div key={s.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-left font-mono text-[10px] text-subtle">{s.name}</span>
          <div className={`flex h-8 flex-1 rounded-full bg-muted p-1 ${right ? "justify-end" : "justify-start"}`}>
            <motion.div layout transition={s.t} className="h-6 w-6 rounded-full bg-accent" />
          </div>
        </div>
      ))}
      <p className="text-center font-mono text-[10px] text-subtle">click to toggle</p>
    </button>
  );
}
```

- [ ] **Step 5: `WordCycleDemo.tsx`** — the hero mechanic on its own phrases

```tsx
"use client";

import { wordCycle } from "@/lib/motionVariants";
import { useHeadingCycle } from "@/lib/useHeadingCycle";

const phrases = ["enters word by word", "holds for a beat", "exits and loops"];

export default function WordCycleDemo() {
  const { words, visibleWords, exitWords, phase } = useHeadingCycle(phrases);

  return (
    <p className="font-serif text-2xl italic text-accent-hover">
      <span className="inline-flex gap-x-[0.28em] overflow-hidden py-[0.06em] -my-[0.06em] align-bottom">
        {words.map((word, i) => {
          const entered = i < visibleWords;
          const exited = (phase === "exiting" && i < exitWords) || phase === "waiting";
          const shown = entered && !exited;
          return (
            <span
              key={`${word}-${i}`}
              className="inline-block"
              style={{
                opacity: shown ? 1 : 0,
                transform: shown ? "translateY(0)" : exited ? "translateY(-100%)" : "translateY(100%)",
                transition: wordCycle.transition,
              }}
            >
              {word}
            </span>
          );
        })}
      </span>
    </p>
  );
}
```

- [ ] **Step 6: `TextSwapDemo.tsx`** — status text swaps in place (blur + 4px travel, `duration.fast`), transitions.dev recipe 04 adapted to motion/react

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const states = ["Saving...", "Saved", "Synced to cloud"];

export default function TextSwapDemo() {
  const [i, setI] = useState(0);

  return (
    <button
      type="button"
      onClick={() => setI((n) => (n + 1) % states.length)}
      className="rounded-full border border-border-strong px-5 py-2 font-mono text-sm text-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
    >
      <span className="relative inline-grid overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={states[i]}
            initial={{ y: 6, opacity: 0, filter: "blur(2px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -6, opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: duration.fast, ease: ease.out }}
            className="whitespace-nowrap"
          >
            {states[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
```

- [ ] **Step 7: `SlidingTabsDemo.tsx`** — segmented control with a `layoutId` pill (`duration.base`, `ease.out`)

```tsx
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ease, duration } from "@/lib/motionVariants";

const tabs = ["Images", "Videos", "Stores"];

export default function SlidingTabsDemo() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex rounded-full bg-muted p-1">
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => setActive(i)}
          className={`relative rounded-full px-4 py-1.5 font-mono text-xs transition-colors duration-150 ${i === active ? "text-foreground" : "text-muted-foreground"}`}
        >
          {i === active && (
            <motion.span
              layoutId="tab-pill"
              transition={{ duration: duration.base, ease: ease.out }}
              className="absolute inset-0 rounded-full bg-card shadow-sm"
            />
          )}
          <span className="relative">{t}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: `PressDemo.tsx`** — the press-state standard, side by side CSS (`active:scale`) and motion (`whileTap`)

```tsx
"use client";

import { motion } from "motion/react";
import { tapPress, spring } from "@/lib/motionVariants";

export default function PressDemo() {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-full bg-accent px-5 py-2 text-sm text-accent-foreground transition-transform duration-150 ease-[--ease-out] active:scale-[0.97]"
      >
        CSS active
      </button>
      <motion.button whileTap={tapPress} transition={spring.hoverIn} className="rounded-full border border-border-strong px-5 py-2 text-sm text-foreground">
        whileTap
      </motion.button>
    </div>
  );
}
```

- [ ] **Step 9: `MarkerDrawDemo.tsx`** — the marker underline drawing on (reuses `components/common/Marker.tsx`; check its props signature before writing and adapt: it wraps children and draws on in-view)

```tsx
"use client";

import Marker from "@/components/common/Marker";

export default function MarkerDrawDemo() {
  return (
    <p className="font-serif text-2xl text-foreground">
      details <Marker>compound</Marker>
    </p>
  );
}
```

(If `Marker`'s API differs, mirror its usage in `components/About.tsx` / `lib/markerHighlight.ts` `withMarker` helper instead.)

- [ ] **Step 10: `AccordionDemo.tsx`** — reuse the Task 7 primitive

```tsx
"use client";

import Accordion from "@/components/common/Accordion";

export default function AccordionDemo() {
  return (
    <div className="w-full">
      <Accordion summary="Why grid-template-rows?">
        Animating 0fr to 1fr tweens height without measuring the content, and the
        inner overflow-hidden wrapper keeps padding out of the collapsed track.
      </Accordion>
      <Accordion summary="Why not height auto?">
        CSS cannot transition to height auto; grid tracks can.
      </Accordion>
    </div>
  );
}
```

- [ ] **Step 11: Verify**: `npx tsc --noEmit && npm run lint` clean.
- [ ] **Step 12: Commit**

```bash
git add components/motion
git commit -m "feat(motion-page): ten interactive demos on the token system"
```

### Task 10: The `/motion` page

**Files:**
- Create: `app/motion/page.tsx`

- [ ] **Step 1: Compose the page** (server component; mirror `/design` metadata pattern; `py-8 md:py-12` main; Sections numbered; Bento grids of DemoCards)

```tsx
import Link from "next/link";
import { baseUrl } from "@/app/sitemap";
import { ogUrl } from "@/lib/seo";
import Section from "@/components/layout/Section";
import Bento from "@/components/layout/Bento";
import Divider from "@/components/layout/Divider";
import DemoCard from "@/components/motion/DemoCard";
import EasingDemo from "@/components/motion/EasingDemo";
import DurationDemo from "@/components/motion/DurationDemo";
import RevealStaggerDemo from "@/components/motion/RevealStaggerDemo";
import SpringDemo from "@/components/motion/SpringDemo";
import WordCycleDemo from "@/components/motion/WordCycleDemo";
import TextSwapDemo from "@/components/motion/TextSwapDemo";
import SlidingTabsDemo from "@/components/motion/SlidingTabsDemo";
import PressDemo from "@/components/motion/PressDemo";
import MarkerDrawDemo from "@/components/motion/MarkerDrawDemo";
import AccordionDemo from "@/components/motion/AccordionDemo";

export const metadata = {
  title: "Motion System",
  description:
    "The animation tokens, variants, and interaction patterns behind this portfolio. One scale, two engines: motion/react for state, CSS for hovers.",
  alternates: { canonical: `${baseUrl}motion` },
  openGraph: {
    title: "Motion System",
    description: "The animation system behind this site, live and replayable.",
    images: [
      { url: ogUrl({ title: "Motion System", subtitle: "Every animation, one scale", type: "generic", label: "Motion" }) },
    ],
  },
};

export default function MotionPage() {
  return (
    <main className="py-8 md:py-12">
      <Section number="01" label="foundation" title="One scale, two engines" width="reading">
        <p className="text-muted-foreground">
          Every animation on this site reads from the same tokens in{" "}
          <code className="rounded bg-card px-1 py-0.5 font-mono text-xs">lib/motionVariants.ts</code>, mirrored as CSS
          variables. motion/react drives anything with state or exits; plain CSS handles hovers and loops. Durations stay
          under 300ms for UI, exits run faster than enters, and keyboard-summoned surfaces barely animate at all.
        </p>
        <Bento className="mt-8 grid-cols-1 md:grid-cols-2">
          <DemoCard title="Easing curves" engine="motion/react" tokens={["ease.out", "ease.modal", "ease.expo"]}>
            <EasingDemo />
          </DemoCard>
          <DemoCard title="Duration scale" engine="motion/react" tokens={["duration.fast → hero"]}>
            <DurationDemo />
          </DemoCard>
        </Bento>
      </Section>
      <Divider />
      <Section number="02" label="primitives" title="Variants and springs" width="reading">
        <Bento className="grid-cols-1 md:grid-cols-2">
          <DemoCard title="Stagger reveal" engine="motion/react" tokens={["containerVariants", "itemVariants", "stagger.base"]}>
            <RevealStaggerDemo />
          </DemoCard>
          <DemoCard title="Springs" engine="motion/react" tokens={["spring.soft", "spring.pop", "spring.hoverIn"]} replayable={false}>
            <SpringDemo />
          </DemoCard>
          <DemoCard title="Press feedback" engine="CSS" tokens={["active:scale-[0.97]", "tapPress"]} replayable={false}>
            <PressDemo />
          </DemoCard>
          <DemoCard title="Text swap" engine="motion/react" tokens={["duration.fast", "ease.out", "blur(2px)"]} replayable={false}>
            <TextSwapDemo />
          </DemoCard>
        </Bento>
      </Section>
      <Divider />
      <Section number="03" label="in the wild" title="Patterns used on this site" width="reading">
        <Bento className="grid-cols-1 md:grid-cols-2">
          <DemoCard title="Hero word cycle" engine="CSS" tokens={["wordCycle", "ease.expo", "duration.slow"]} replayable={false}>
            <WordCycleDemo />
          </DemoCard>
          <DemoCard title="Marker draw" engine="motion/react" tokens={["duration.draw", "ease.out"]}>
            <MarkerDrawDemo />
          </DemoCard>
          <DemoCard title="Sliding tabs" engine="motion/react" tokens={["layoutId", "duration.base", "ease.out"]} replayable={false}>
            <SlidingTabsDemo />
          </DemoCard>
          <DemoCard title="Accordion" engine="CSS" tokens={["grid-template-rows", "duration.med", "ease.out"]} replayable={false}>
            <AccordionDemo />
          </DemoCard>
        </Bento>
        <p className="mt-8 text-sm text-muted-foreground">
          Color, type, and spacing live in the <Link href="/design" className="underline decoration-accent/50 underline-offset-4 hover:decoration-accent">design system</Link>.
          The rules encoding all of this for coding agents ship as skills on the <Link href="/skills" className="underline decoration-accent/50 underline-offset-4 hover:decoration-accent">skills page</Link>.
        </p>
      </Section>
    </main>
  );
}
```

Check `Section`'s actual props against `components/layout/Section.tsx` before writing (label casing, `width` values) and `Bento` cell expectations (`bg-card` per cell is provided by DemoCard).

- [ ] **Step 2: Verify visually**: `curl -s http://localhost:3001/motion | grep -o "Motion System"` returns a hit; open in browser, replay every card, check dark + light themes.
- [ ] **Step 3: Commit**

```bash
git add app/motion
git commit -m "feat: /motion route, live showcase of the motion system"
```

### Task 11: Wiring

**Files:**
- Modify: `lib/shortcutsData.ts` — add `{ key: "m", label: "Motion", href: "/motion" }` to `goToShortcuts`
- Modify: `app/sitemap.ts` — add `motion` to the static routes list (check existing shape first: `grep -n "design" app/sitemap.ts`)
- Modify: `app/design/page.tsx` — in its motion-guidelines section, add a link: "See it live at /motion"
- Modify: `docs/design-system.md` — add a Motion section pointer to `/motion` and the token scale
- Modify: `CLAUDE.md` — add `/motion` to "Useful entry points"; add `transitions-dev` next to the design-system skill mention
- Modify: `middleware.ts` — do NOT add /motion to markdown matcher (interactive page, no markdown rendition); confirm nothing needed

- [ ] **Step 1: Apply each edit**
- [ ] **Step 2: Verify**: `g` then `m` navigates to /motion; `⌘K` → "Motion system" navigates; `curl -s http://localhost:3001/sitemap.xml | grep motion` hits.
- [ ] **Step 3: Commit**

```bash
git add lib/shortcutsData.ts app/sitemap.ts app/design/page.tsx docs/design-system.md CLAUDE.md
git commit -m "feat(motion-page): wire /motion into shortcuts, palette, sitemap, docs"
```

---

## Phase 4 — /motion/principles (12 Principles of Animation, applied to UI)

Essay-style page in the spirit of raphaelsalaja.com/library/12-principles-of-animation: for each Disney principle, a short definition, its UI translation, a live demo, and a one-line caution. Original copy (NO copying Raphael's text; no em-dashes). Demos reuse `DemoCard` and, where marked, adapt a vendored transitions.dev recipe to our tokens (adapt: our class names, our `duration.*`/`ease.*` tokens, never the `t-*` selectors).

### Task 12: Principle demos

**Files:** all Create under `components/motion/principles/`, all `"use client"`. Each is small (30-70 lines); each imports timing ONLY from `lib/motionVariants.ts`. The twelve, with their mechanic:

- [ ] **Step 1: `SquashStretchDemo.tsx`** — a ball drops on click and squashes on impact: `motion.div` animating `scaleY: [1, 1, 0.6, 1.05, 1]`, `scaleX: [1, 1, 1.4, 0.97, 1]`, `y: [0, 64, 64, 64, 64]` with `transition={{ duration: duration.hero, ease: ease.out, times: [0, 0.5, 0.65, 0.85, 1] }}`. Caution copy: subtle or it reads cartoonish.
- [ ] **Step 2: `AnticipationDemo.tsx`** — "Delete" list row: on click the row first nudges left `x: -8` (`duration.fast`), then exits right `x: 80, opacity: 0` (`duration.med`). Sequence via `animate` keyframes `x: [0, -8, 80]`, `opacity: [1, 1, 0]`, `times: [0, 0.3, 1]`. Reset button re-adds the row.
- [ ] **Step 3: `StagingDemo.tsx`** — three cards; clicking one dims and blurs the others (`opacity: 0.3, filter: "blur(2px)"`, `duration.base`) spotlighting the actor.
- [ ] **Step 4: `StraightAheadPoseDemo.tsx`** — two dots travel the same track: left one tweens pose-to-pose (`duration.slow`, `ease.out`), right one is spring-driven straight-ahead (`spring.pop`); label which is which.
- [ ] **Step 5: `FollowThroughDemo.tsx`** — a card slides in and its child badge overshoots and settles after the parent stops (`spring.pop` on the child, `duration.med` + `ease.out` on the parent).
- [ ] **Step 6: `SlowInOutDemo.tsx`** — same dot, three tracks: `linear` vs `ease.out` vs `ease.expo`, same `duration.hero`; linear looks robotic by comparison.
- [ ] **Step 7: `ArcsDemo.tsx`** — two dots move A→B: one straight line (`x` only), one arcs (`x` tween + `y` keyframes `[0, -24, 0]` same duration); arcs read as natural.
- [ ] **Step 8: `SecondaryActionDemo.tsx`** — like button: heart fills + tiny particles burst (adapt transitions.dev 23; particles = 6 absolutely-positioned dots animating `scale: [0,1,0]`, radial `x/y`, `opacity: [1,1,0]` over `duration.hero`).
- [ ] **Step 9: `TimingDemo.tsx`** — two identical dropdown mocks opening side by side: 150ms vs 600ms, same easing; the slow one feels broken. Buttons trigger both.
- [ ] **Step 10: `ExaggerationDemo.tsx`** — invalid input shake (adapt transitions.dev 12): wrong-PIN field animates `x: [0, -6, 6, -4, 4, 0]` over `duration.slow` with red border pulse, then reverts.
- [ ] **Step 11: `SolidDrawingDemo.tsx`** — 3D card tilt toward pointer (adapt transitions.dev 19): `rotateX/rotateY` from pointer position via `useSpring`, `perspective: 1000`, subtle glare div; reduced-motion returns a static card.
- [ ] **Step 12: `AppealDemo.tsx`** — the composed finale: a small "Saved" toast rises with fade + blur (adapt transitions.dev 22) using `duration.med` in, `duration.fast` out; copy notes appeal = all principles in concert, restraint included.
- [ ] **Step 13: Verify** `npx tsc --noEmit && npm run lint` clean.
- [ ] **Step 14: Commit**

```bash
git add components/motion/principles
git commit -m "feat(principles): twelve interactive principle demos"
```

### Task 13: The `/motion/principles` page

**Files:**
- Create: `app/motion/principles/page.tsx`
- Modify: `app/motion/page.tsx` (link to it), `app/sitemap.ts`, `lib/commandData.ts` (add `{ id: "nav-principles", label: "12 principles of animation", group: "Navigation", href: "/motion/principles" }`)

- [ ] **Step 1: Compose the page.** Server component, `py-8 md:py-12` main, `width="reading"`. Structure: intro Section (what the 12 principles are, one paragraph, credit Disney's Frank Thomas and Ollie Johnston plus a pointer that this applies them to UI), then one Section per principle numbered `01`-`12`, each: `title` = principle name, body = definition paragraph + UI-translation paragraph (2-3 sentences each, original copy, no em-dashes), `DemoCard` with the demo, then a `<p className="text-sm text-subtle">` caution line. `Divider` between sections. Metadata mirrors /motion (`title: "12 Principles of Animation"`, canonical `${baseUrl}motion/principles`, ogUrl label "Motion").
- [ ] **Step 2: Copy quality bar.** Write all 12 definition/translation/caution blocks in full in the page file. Each caution is one sentence of restraint guidance (e.g. squash and stretch: "Past 5 percent it stops feeling physical and starts feeling like a cartoon."). Sell-hard tone consistent with the rest of the site; no em-dashes anywhere.
- [ ] **Step 3: Cross-link.** /motion section 03 footer paragraph gains: "For the theory behind these choices, read the 12 principles applied to UI." Link back from principles page header to /motion.
- [ ] **Step 4: Verify** dev server: page renders, all 12 demos play in view, both themes, mobile viewport. `npx tsc --noEmit && npm run lint` clean.
- [ ] **Step 5: Commit**

```bash
git add app/motion components/motion lib/commandData.ts app/sitemap.ts
git commit -m "feat: /motion/principles, the 12 principles of animation applied to this UI"
```

---

## Phase 5 — Final verification

### Task 14: Full pass

- [ ] **Step 1:** `npm run build` — clean production build, no type/lint errors.
- [ ] **Step 2:** Manual sweep on dev server: homepage (hero cycle, reveals, cards), ⌘K + `?` + `g m`, FAQ accordion, chat FAB open/close, VideoModal, 404 page, /motion + /motion/principles all cards in both themes, one org page + one project page. Include a mobile-viewport pass: `hoverOnlyWhenSupported` now hides hover states on touch, so confirm the Clients logo row and card lifts look intentional (not broken) without hover.
- [ ] **Step 3:** Reduced-motion spot check: enable "Reduce motion" in macOS accessibility, confirm hero renders static, /motion demos degrade (opacity only), avatar eyes stop tracking.
- [ ] **Step 4:** `grep -rn "transition-all" app components` → empty; `grep -rnE "duration: 0\.[0-9]" components app --include="*.tsx" | grep -v motionVariants` → empty (all timing tokenized).
- [ ] **Step 5:** Final commit of any stragglers; do not push without user sign-off.

---

## Explicitly out of scope (YAGNI)

- No markdown rendition for /motion (interactive page).
- No changes to `data/agent-memory.md` (no facts about Shashwat changed; revisit only if the user wants Truffy to pitch the motion page).
- No new npm dependencies; transitions.dev recipes are adapted, never pasted with their `t-*` classes.
- Tooltip (`ui/tooltip.tsx`) keeps `tailwindcss-animate` defaults.
- `Marquee` `direction-reverse` no-op class: left alone (separate bug, note to user).
