# Portfolio Visual Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp the existing Next.js portfolio's visual layer — graphite+indigo theme, editorial serif typography, a hybrid narrow/breakout layout, a projects showcase, full case-study pages, a ⌘K command palette, and a branded dynamic OG system — without rewriting the data or infrastructure layers.

**Architecture:** Tokens-first, incremental migration (Approach 1). Replace design tokens and fonts first, add reusable layout primitives, then migrate sections/routes one at a time on top of the new system. The site stays live and reviewable at every commit. Spec: `docs/superpowers/specs/2026-05-27-portfolio-visual-revamp-design.md`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, `motion` (Framer Motion), `next/font/google`, `next/og` (`ImageResponse`), MDX. Branch: `portfolio-visual-revamp`.

---

## Testing & Verification Note (read first)

This repo has **no unit-test runner** (scripts are only `dev`, `build`, `lint`). This is a visual/layout revamp where unit tests add little. So instead of TDD, **every implementation task is verified by this standard gate** before its commit:

```bash
npx tsc --noEmit        # types are clean
npm run lint            # next lint passes (warnings ok, no errors)
```

Tasks that change routing, metadata, fonts, or server/client boundaries also run:

```bash
npm run build           # production build succeeds
```

And tasks that change visuals include a **manual visual check**: run `npm run dev`, open the stated URL, confirm the stated expectations in **both dark and light mode** and at mobile width (≤640px). Where pure logic exists (⌘K filtering, projects-filter derivation), it's written as an exported pure function and exercised with a one-off `node -e`/`npx tsx` check shown in the task.

Do **not** mark a task complete unless its verification commands ran and passed. Commit after each task.

---

## File Structure

**New files:**
- `components/layout/Container.tsx` — width wrapper (`reading` 680px / `wide` 1080px) + gutter padding.
- `components/layout/Section.tsx` — vertical-rhythm section with optional Label+heading header row.
- `components/layout/Label.tsx` — mono uppercase editorial label.
- `components/layout/Reveal.tsx` — client staggered fade-up wrapper (reduced-motion aware).
- `components/layout/ProseGutter.tsx` — case-study two-column (sticky meta/TOC gutter + content).
- `components/ProjectShowcaseCard.tsx` — large project card (media + meta) for home + index.
- `components/CommandPalette.tsx` — ⌘K palette (client, lazy).
- `components/project/ProjectMedia.tsx` — client island for case-study hero media + video modal.
- `lib/commandData.ts` — builds the ⌘K item list (pure).
- `lib/projectFilters.ts` — derives filter tag groups from projects (pure).
- `lib/seo.ts` — JSON-LD builders (`personLd`, `websiteLd`, `softwareAppLd`, `articleLd`) + `ogUrl()` helper.
- `public/fonts/Fraunces-Medium.ttf`, `public/fonts/Inter-Regular.ttf`, `public/fonts/Inter-SemiBold.ttf` — font binaries for OG rendering.

**Modified files:**
- `app/layout.tsx` — swap fonts (Fraunces/Inter/JetBrains Mono), add Person+WebSite JSON-LD, update inline theme script comment only if needed.
- `app/globals.css` — replace color tokens (dark+light) and base type styles; add `--font-*`, `--subtle`, `--elevated`, `--border-strong`, easing vars.
- `tailwind.config.ts` — `fontFamily` (serif/sans/mono), add `elevated`/`subtle`/`border-strong` colors, radius bump.
- `lib/motionVariants.ts` — align ease to `[0.22,1,0.36,1]`, add `revealUp`.
- `lib/projectsData.ts` — extend `TSideProject` with optional `caseStudy` + `tags`; add real case-study content to PaperNoise.
- `components/Navbar.tsx` — top sticky bar with links + ⌘K pill + theme/sound (replaces bottom dock).
- `components/Footer.tsx`, `components/Intro.tsx`, `components/About.tsx`, `components/Projects.tsx`, `components/Work.tsx`, `components/Clients.tsx`, `components/TechStack.tsx`, `components/Activity.tsx`, `components/Socials.tsx`, `components/SideProjectCard.tsx` — restyle to new system.
- `app/page.tsx` — new section order + Container/Section wrappers, mount CommandPalette.
- `app/project/[slug]/page.tsx` — server case-study page (ProseGutter + conditional sections + metrics + metadata + JSON-LD).
- `app/projects/page.tsx` — Section header + conditional filters + showcase grid.
- `app/blogs/[slug]/page.tsx` — fix `/blog/`→`/blogs/`, real author name, branded OG params.
- `app/sitemap.ts` — fix blog URL, add projects routes.

---

## Phase 1 — Foundation

### Task 1: Swap fonts to Fraunces / Inter / JetBrains Mono

**Files:**
- Modify: `app/layout.tsx:2` (font import) and `:29-34` (font init) and `:101-103` (body className)

- [ ] **Step 1: Replace the font import and initialization**

In `app/layout.tsx`, replace the `Plus_Jakarta_Sans` import line:

```tsx
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
```

Replace the `plusJakarta` const (lines ~29-34) with:

```tsx
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});
```

- [ ] **Step 2: Apply the font variables on `<body>`**

Replace the `<body className=...>` (line ~101-103) with:

```tsx
      <body
        className={`bg-background text-foreground border-border ${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans`}
      >
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: build succeeds. (Fonts won't be mapped in Tailwind until Task 3 — that's fine; `font-sans` still resolves to the default until then.)

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(fonts): load Fraunces, Inter, JetBrains Mono via next/font"
```

---

### Task 2: Replace color tokens and base typography in globals.css

**Files:**
- Modify: `app/globals.css:6-58` (`:root`), `:60-95` (`.dark`), `:101-137` (base element styles), `:218-223` (easing vars)

- [ ] **Step 1: Replace the `:root` (light) block**

Replace the entire `:root { ... }` token block (lines ~6-58) with — note: **light is `:root`, dark is `.dark`**, dark is the default applied by the inline script in `layout.tsx`:

```css
:root {
  /* Light (mirrored) */
  --background: 240 33% 99%;
  --foreground: 240 8% 9%;
  --card: 0 0% 100%;
  --card-foreground: 240 8% 9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 8% 9%;
  --elevated: 240 16% 96%;
  --primary: 240 8% 9%;
  --primary-foreground: 240 33% 99%;
  --secondary: 240 16% 96%;
  --secondary-foreground: 240 8% 9%;
  --muted: 240 16% 96%;
  --muted-foreground: 240 5% 38%;
  --subtle: 240 4% 56%;
  --accent: 242 69% 61%;
  --accent-foreground: 0 0% 100%;
  --accent-hover: 242 69% 67%;
  --destructive: 0 65% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 14% 91%;
  --border-strong: 240 12% 85%;
  --input: 240 14% 91%;
  --ring: 242 69% 61%;
  --radius: 0.75rem;
  --sh-class: 242 50% 50%;
  --sh-identifier: 240 8% 20%;
  --sh-sign: 240 5% 45%;
  --sh-string: 160 40% 38%;
  --sh-keyword: 242 69% 55%;
  --sh-comment: 240 5% 55%;
  --sh-jsxliterals: 242 50% 50%;
}
```

- [ ] **Step 2: Replace the `.dark` block**

Replace the entire `.dark { ... }` block (lines ~60-95) with:

```css
.dark {
  /* Graphite + Indigo (default) */
  --background: 240 15% 5%;
  --foreground: 240 6% 93%;
  --card: 240 13% 9%;
  --card-foreground: 240 6% 93%;
  --popover: 240 13% 13%;
  --popover-foreground: 240 6% 93%;
  --elevated: 240 13% 13%;
  --primary: 240 6% 93%;
  --primary-foreground: 240 15% 5%;
  --secondary: 240 13% 13%;
  --secondary-foreground: 240 6% 85%;
  --muted: 240 10% 16%;
  --muted-foreground: 240 6% 63%;
  --subtle: 240 4% 45%;
  --accent: 241 84% 68%;
  --accent-foreground: 0 0% 100%;
  --accent-hover: 242 86% 73%;
  --destructive: 0 60% 55%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 10% 16%;
  --border-strong: 240 10% 20%;
  --input: 240 10% 16%;
  --ring: 241 84% 68%;
  --sh-class: 241 70% 75%;
  --sh-identifier: 240 6% 82%;
  --sh-sign: 240 5% 55%;
  --sh-string: 160 35% 65%;
  --sh-keyword: 241 80% 78%;
  --sh-comment: 240 5% 50%;
  --sh-jsxliterals: 241 60% 72%;
}
```

- [ ] **Step 3: Update base element typography**

Replace the `body` and heading rules (lines ~106-137) with:

```css
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "cv11", "ss01";
    line-height: 1.65;
    text-rendering: optimizeLegibility;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-fraunces), Georgia, serif;
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.015em;
  }

  h1 { font-size: 2.25rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.25rem; }
```

- [ ] **Step 4: Confirm/extend easing vars**

Ensure the easing block (around line ~218) reads:

```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

- [ ] **Step 5: Verify (visual)**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: colors shift to graphite/indigo in dark mode (default); headings render in Fraunces serif. Layout is still old/cramped — that's expected; only tokens changed. Toggle to light via the navbar settings → near-white background, indigo accent. No console errors.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat(theme): replace tokens with graphite+indigo, serif headings"
```

---

### Task 3: Map fonts and new colors in Tailwind config

**Files:**
- Modify: `tailwind.config.ts:56-58` (fontFamily), `:73-114` (colors), `:68-72` (borderRadius)

- [ ] **Step 1: Replace `fontFamily`**

```ts
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
```

- [ ] **Step 2: Add new color tokens**

Inside `theme.extend.colors`, add these entries alongside the existing ones:

```ts
        elevated: "hsl(var(--elevated))",
        subtle: "hsl(var(--subtle))",
        "border-strong": "hsl(var(--border-strong))",
        "accent-hover": "hsl(var(--accent-hover))",
```

- [ ] **Step 3: Keep radius var-driven (no change needed)**

The existing `borderRadius` already maps `lg/md/sm` to `var(--radius)`; the radius is now `0.75rem` from Task 2. Leave as-is.

- [ ] **Step 4: Verify (visual)**

Run: `npm run dev`. Headings should now also respond to `font-serif`, body to `font-sans` (Inter). Add a temporary `<p className="font-mono">test</p>` in `app/page.tsx`, confirm JetBrains Mono renders, then remove it.
Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(theme): map serif/sans/mono fonts and new color tokens in tailwind"
```

---

### Task 4: Extend motion variants

**Files:**
- Modify: `lib/motionVariants.ts`

- [ ] **Step 1: Update ease and add `revealUp`**

Replace the file contents with:

```ts
import type { Variants } from "motion/react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const slideUpContainerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, ease: easeOut, duration: 0.4 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easeOut } },
};

// Reveal-on-scroll, used by <Reveal>
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean (existing imports of `containerVariants`/`itemVariants` still valid).

- [ ] **Step 3: Commit**

```bash
git add lib/motionVariants.ts
git commit -m "refactor(motion): align ease to 0.22,1,0.36,1 and add revealUp variant"
```

---

### Task 5: Create layout primitives

**Files:**
- Create: `components/layout/Container.tsx`, `components/layout/Label.tsx`, `components/layout/Section.tsx`, `components/layout/Reveal.tsx`, `components/layout/ProseGutter.tsx`

- [ ] **Step 1: `Container.tsx`** (server component)

```tsx
import { cn } from "@/lib/utils";

type Props = {
  as?: "div" | "section" | "header" | "footer" | "main";
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
  id?: string;
};

export default function Container({
  as: Tag = "div",
  width = "reading",
  className,
  children,
  id,
}: Props) {
  return (
    <Tag
      id={id}
      className={cn(
        "mx-auto w-full px-6",
        width === "reading" ? "max-w-[680px]" : "max-w-[1080px]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: `Label.tsx`** (server component)

```tsx
import { cn } from "@/lib/utils";

export default function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.16em] text-subtle",
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: `Reveal.tsx`** (client component)

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { revealUp, containerVariants } from "@/lib/motionVariants";

export default function Reveal({
  children,
  stagger = false,
  className,
}: {
  children: React.ReactNode;
  stagger?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={stagger ? containerVariants : revealUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: `Section.tsx`** (server component)

```tsx
import { cn } from "@/lib/utils";
import Container from "./Container";
import Label from "./Label";

type Props = {
  id?: string;
  label?: string;
  title?: string;
  action?: React.ReactNode;
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
};

export default function Section({
  id,
  label,
  title,
  action,
  width = "reading",
  className,
  children,
}: Props) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <Container width={width}>
        {(label || title || action) && (
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              {label && <Label>{label}</Label>}
              {title && (
                <h2 className="font-serif text-2xl md:text-[1.75rem] text-foreground">
                  {title}
                </h2>
              )}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
```

- [ ] **Step 5: `ProseGutter.tsx`** (server component)

```tsx
export default function ProseGutter({
  gutter,
  children,
}: {
  gutter: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] md:gap-11">
      <aside className="md:sticky md:top-24 md:self-start">{gutter}</aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. (`cn` exists in `lib/utils`.)

- [ ] **Step 7: Commit**

```bash
git add components/layout
git commit -m "feat(layout): add Container, Section, Label, Reveal, ProseGutter primitives"
```

---

## Phase 2 — Global chrome

### Task 6: Rebuild Navbar as top sticky bar with ⌘K, theme, sound

> **Decision:** The current navbar is a bottom-fixed pill dock. The approved design uses a **top sticky bar**. This task replaces the dock with a top bar, preserving the existing `useDarkMode` and `useSound` toggles and adding a ⌘K trigger. The ⌘K trigger dispatches a global custom event the palette (Task) listens for.

**Files:**
- Modify: `components/Navbar.tsx` (full replacement)

- [ ] **Step 1: Replace `components/Navbar.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Volume2, VolumeX } from "feather-icons-react";
import { useDarkMode } from "@/app/hooks/useDarkMode";
import { useSound } from "@/app/providers/SoundProvider";

const navLinks = [
  { label: "Work", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Writing", href: "/blogs" },
  { label: "Books", href: "/books" },
];

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("open-command-palette"));
}

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { muted, toggleMuted } = useSound();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-3.5">
        <Link href="/" className="font-serif text-lg font-semibold text-foreground">
          offcod8
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command menu"
            className="flex items-center gap-1.5 rounded-lg border border-border-strong px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="text-[13px] leading-none">⌘</span> K
          </button>
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-colors hover:text-foreground"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border-strong text-muted-foreground transition-colors hover:text-foreground"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="text-sm text-muted-foreground md:hidden"
          >
            Menu
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border px-6 md:hidden"
          >
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
```

> Note: the homepage section ids must match (`#experience`, `#projects`). Those are set in Phase 6.

- [ ] **Step 2: Verify (visual)**

Run: `npm run dev`. Navbar now sits at the top, sticky, translucent. Theme toggle and sound toggle work. ⌘K button is present (palette wired later). Mobile width shows a "Menu" toggle that expands links.
Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat(nav): top sticky navbar with cmdK trigger, theme and sound toggles"
```

---

### Task 7: Restyle Footer

**Files:**
- Modify: `components/Footer.tsx` (read current file first, then replace its markup)

- [ ] **Step 1: Read the current footer** to preserve any links/analytics it renders.

Run: open `components/Footer.tsx`.

- [ ] **Step 2: Replace the footer's outer markup** with the new system (keep any existing dynamic content like year/links you found):

```tsx
import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer className="border-t border-border py-9">
      <Container width="wide" className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-subtle">
        <span>© {new Date().getFullYear()} Shashwat Tripathi · offcod8</span>
        <span>Built with Next.js · Crafted with care</span>
      </Container>
    </footer>
  );
}
```

If the current footer is a client component or renders other content (e.g., the animated `offcod8` dots), keep that content but reskin it with `text-subtle`, `border-border`, and `Container width="wide"`.

- [ ] **Step 3: Verify (visual + types)**

Run: `npm run dev` → footer is minimal, muted, full-width aligned. `npx tsc --noEmit && npm run lint` clean.

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat(footer): restyle to new token system"
```

---

## Phase 3 — Hero + Projects showcase

### Task 8: Rebuild the hero (Intro + About)

**Files:**
- Modify: `components/Intro.tsx`, `components/About.tsx`

- [ ] **Step 1: Replace `components/About.tsx`**

```tsx
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import Reveal from "@/components/layout/Reveal";
import ToolsAndStack from "./ToolStack";

export default function About() {
  return (
    <header className="pt-16 pb-8 md:pt-24">
      <Container width="reading">
        <Reveal className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/apple-touch-icon.png" alt="Shashwat Tripathi" className="h-full w-full object-cover" />
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
              Available for freelance &amp; full-time
            </span>
          </div>

          <div className="space-y-3">
            <Label>Frontend Engineer · Full-stack</Label>
            <h1 className="font-serif text-[clamp(2.4rem,6vw,3.6rem)] font-medium leading-[1.03] tracking-[-0.02em] text-foreground">
              I craft <span className="italic text-accent-hover">quality interfaces</span>, end to end.
            </h1>
          </div>

          <p className="max-w-[54ch] text-lg text-muted-foreground">
            Hi, I&apos;m Shashwat — a frontend engineer who works across the stack. I build clean,
            fast, accessible web apps with a focus on great design and seamless UX. Reach me at{" "}
            <a
              href="mailto:contact@shashwa7.in"
              className="text-foreground underline decoration-accent underline-offset-4 hover:decoration-2"
            >
              contact@shashwa7.in
            </a>
            .
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/#projects"
              className="rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              View selected work →
            </a>
            <a
              href="mailto:contact@shashwa7.in"
              className="rounded-[9px] border border-border-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-elevated"
            >
              Get in touch
            </a>
          </div>

          <div className="pt-2">
            <ToolsAndStack />
          </div>
        </Reveal>
      </Container>
    </header>
  );
}
```

- [ ] **Step 2: Retire the old `Intro.tsx` content**

`About.tsx` no longer imports `Intro`. Leave `Intro.tsx` in place but unused, OR delete it if nothing else imports it. Check: `grep -rn "components/Intro" app components`. If nothing imports it, delete `components/Intro.tsx`.

- [ ] **Step 3: Verify (visual)**

Run: `npm run dev` → hero shows availability dot, mono label, large Fraunces headline with italic indigo "quality interfaces", lede, two CTAs. Works in light + dark, mobile.
Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 4: Commit**

```bash
git add components/About.tsx components/Intro.tsx
git commit -m "feat(hero): editorial serif hero with status, label, CTAs"
```

---

### Task 9: Build `ProjectShowcaseCard`

**Files:**
- Create: `components/ProjectShowcaseCard.tsx`

- [ ] **Step 1: Create the card**

```tsx
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "feather-icons-react";
import type { TSideProject } from "@/lib/projectsData";
import { ActiveBadge } from "./common/ActiveBadge";

function hasCaseStudy(p: TSideProject) {
  return Boolean(p.caseStudy && Object.keys(p.caseStudy).length > 0);
}

export default function ProjectShowcaseCard({ project }: { project: TSideProject }) {
  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];
  return (
    <Link
      href={`/project/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 760px) 100vw, 520px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2.5">
          <h3 className="font-serif text-xl text-foreground">{project.title}</h3>
          {project.isRecent && <ActiveBadge variant="minimal" label="Recent" />}
        </div>
        <p className="line-clamp-2 text-[15px] text-muted-foreground">{project.tagline}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wide text-subtle">
            {stack.slice(0, 3).join(" · ")}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {project.links?.web && (
              <span className="inline-flex items-center gap-1 group-hover:text-accent">
                Live <ExternalLink className="h-3 w-3" />
              </span>
            )}
            {project.links?.github && (
              <span className="inline-flex items-center gap-1 group-hover:text-accent">
                GitHub <ExternalLink className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
        {hasCaseStudy(project) && (
          <div className="border-t border-border pt-3 text-[13px] text-accent">
            Read case study →
          </div>
        )}
      </div>
    </Link>
  );
}
```

> Note: outbound links are shown as text (not nested `<a>`) to avoid invalid nested anchors inside the card `<Link>`. The whole card navigates to the case study; live/GitHub remain available on the case-study page.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. (`TSideProject.caseStudy` doesn't exist yet — this references it; add a temporary `caseStudy?: Record<string, unknown>` to the type now if tsc errors, OR sequence Task 11 before this. **If tsc errors on `caseStudy`, do Task 11 Step 1 first, then return here.**)

- [ ] **Step 3: Commit**

```bash
git add components/ProjectShowcaseCard.tsx
git commit -m "feat(projects): add ProjectShowcaseCard"
```

---

### Task 10: Rebuild the home Projects section

**Files:**
- Modify: `components/Projects.tsx` (full replacement)

- [ ] **Step 1: Replace `components/Projects.tsx`**

```tsx
import Link from "next/link";
import { sideProjects } from "@/lib/projectsData";
import Section from "@/components/layout/Section";
import Reveal from "@/components/layout/Reveal";
import ProjectShowcaseCard from "./ProjectShowcaseCard";

export default function Projects() {
  return (
    <Section
      id="projects"
      width="wide"
      label="Selected Work"
      title="Things I've built"
      action={
        <Link href="/projects" className="text-sm text-muted-foreground transition-colors hover:text-accent">
          View all projects →
        </Link>
      }
    >
      <Reveal stagger className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sideProjects.map((p) => (
          <ProjectShowcaseCard key={p.id} project={p} />
        ))}
        <Link
          href="/projects"
          className="flex items-center justify-center rounded-2xl border border-dashed border-border-strong p-8 text-center text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          + more on the projects page →
        </Link>
      </Reveal>
    </Section>
  );
}
```

> `Reveal` is a client component but receives server-rendered children — valid in App Router (children are passed through). Cards stay server components.

- [ ] **Step 2: Verify (visual)**

Run: `npm run dev` → home Projects section is now a wide 2-col showcase grid with large media cards + a dashed "more" card; staggered reveal on scroll. Light + dark + mobile (single column).
Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add components/Projects.tsx
git commit -m "feat(projects): home showcase grid with breakout width"
```

---

## Phase 4 — Case studies + data model

### Task 11: Extend the project data model

**Files:**
- Modify: `lib/projectsData.ts:3-25` (type)

- [ ] **Step 1: Add optional fields to `TSideProject`**

Add inside the `TSideProject` type (after `stack`):

```ts
  tags?: string[];
  caseStudy?: {
    role?: string;
    year?: string;
    overview?: string;
    problem?: string;
    constraints?: string[];
    architecture?: string[] | string;
    tradeoffs?: string[] | string;
    performance?: string[] | string;
    results?: { value: string; caption: string }[];
    lessons?: string[] | string;
  };
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. `ProjectShowcaseCard` (Task 9) now typechecks against the real field.

- [ ] **Step 3: Commit**

```bash
git add lib/projectsData.ts
git commit -m "feat(data): add optional caseStudy and tags to TSideProject"
```

---

### Task 12: Add real case-study content to PaperNoise

**Files:**
- Modify: `lib/projectsData.ts` (the `paper-noise` entry)

- [ ] **Step 1: Add a `caseStudy` and `tags` to the PaperNoise object**

Inside the `paper-noise` entry, add:

```ts
    tags: ["web", "tools"],
    caseStudy: {
      role: "Design & Engineering",
      year: "2026",
      overview:
        "PaperNoise renders tactile, print-like cards entirely client-side. The challenge was making screen pixels feel like physical paper — and exporting them at high quality without any server.",
      problem:
        "Existing tools lean on templates or generic filters. I wanted real texture compositing and ink-palette control, with an export that survives the browser's canvas quirks.",
      constraints: [
        "100% client-side — no server rendering or storage",
        "Exports must be deterministic and high-resolution",
        "Runs smoothly on mid-range laptops",
      ],
      architecture: [
        "Layered texture + tint compositing pipeline",
        "Export-safe rendering via dom-to-image-more",
        "Deterministic high-res PNG output",
      ],
      tradeoffs:
        "Chose dom-to-image-more over canvas-native export for fidelity, accepting a larger dependency to avoid cross-browser canvas tainting issues.",
      results: [
        { value: "<1s", caption: "export time" },
        { value: "100%", caption: "client-side" },
        { value: "Launched", caption: "on Product Hunt" },
      ],
      lessons:
        "Texture realism is mostly about blend modes and grain, not resolution. Constraining scope to one beautiful thing shipped faster than a flexible editor would have.",
    },
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add lib/projectsData.ts
git commit -m "content(papernoise): add case-study fields"
```

---

### Task 13: Rebuild the case-study page (server) + client media island

**Files:**
- Create: `components/project/ProjectMedia.tsx`
- Modify: `app/project/[slug]/page.tsx` (full replacement, becomes a server component)

- [ ] **Step 1: Create `components/project/ProjectMedia.tsx`** (client island for hero + video modal)

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "feather-icons-react";
import VideoModal from "@/components/common/VideoModal";

export default function ProjectMedia({
  thumbnail,
  preview,
  title,
}: {
  thumbnail: string;
  preview?: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="group relative aspect-[16/8] overflow-hidden rounded-2xl bg-elevated">
        <Image src={thumbnail} alt={title} fill priority className="object-cover" />
        {preview && (
          <button
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Watch demo"
          >
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
              <Play className="h-4 w-4 fill-current" /> Watch demo
            </span>
          </button>
        )}
      </div>
      {preview && (
        <VideoModal isOpen={open} onClose={() => setOpen(false)} videoUrl={preview} title={title} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Replace `app/project/[slug]/page.tsx`** (server component — no `"use client"`)

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "feather-icons-react";
import { getSideProject, getAllSideProjects } from "@/lib/projectsData";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import ProseGutter from "@/components/layout/ProseGutter";
import StackIcon from "@/components/common/StackIcon";
import ProjectMedia from "@/components/project/ProjectMedia";
import { softwareAppLd, ogUrl } from "@/lib/seo";

export function generateStaticParams() {
  return getAllSideProjects().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getSideProject(params.slug);
  if (!project) return {};
  const title = project.title;
  const description = project.tagline;
  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];
  const og = ogUrl({ title, subtitle: description, type: "project", label: stack.slice(0, 3).join(" · ") });
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}project/${project.slug}` },
    openGraph: { title, description, type: "article", url: `${baseUrl}project/${project.slug}`, images: [{ url: og }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

const toList = (v?: string[] | string) => (Array.isArray(v) ? v : v ? [v] : []);

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getSideProject(params.slug);
  if (!project) notFound();

  const cs = project.caseStudy || {};
  const stack = [...(project.stack.fe || []), ...(project.stack.be || [])];
  const sections: { key: string; label: string; heading: string; body: string[] }[] = [
    { key: "overview", label: "Overview", heading: "Overview", body: toList(cs.overview) },
    { key: "problem", label: "The problem", heading: "Why this exists", body: toList(cs.problem) },
    { key: "constraints", label: "Constraints", heading: "Constraints", body: toList(cs.constraints) },
    { key: "architecture", label: "Architecture", heading: "How it's built", body: toList(cs.architecture) },
    { key: "tradeoffs", label: "Tradeoffs", heading: "Tradeoffs", body: toList(cs.tradeoffs) },
    { key: "performance", label: "Performance", heading: "Performance", body: toList(cs.performance) },
    { key: "lessons", label: "Lessons", heading: "Lessons learned", body: toList(cs.lessons) },
  ].filter((s) => s.body.length > 0);

  return (
    <main className="py-16 md:py-24">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd(project)) }}
      />
      <Container width="wide" className="space-y-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>

        <div className="max-w-[760px] space-y-4">
          <Label>
            {project.title}
            {cs.year ? ` · ${cs.year}` : ""}
            {cs.role ? ` · ${cs.role}` : ""}
          </Label>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3rem)] font-medium leading-[1.03] tracking-[-0.02em]">
            {project.title}
          </h1>
          <p className="text-lg text-muted-foreground">{project.tagline}</p>
        </div>

        <ProjectMedia thumbnail={project.thumbnail} preview={project.preview} title={project.title} />

        <ProseGutter
          gutter={
            <div className="space-y-5">
              {cs.role && <GutterItem k="Role" v={cs.role} />}
              {cs.year && <GutterItem k="Year" v={cs.year} />}
              <div>
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Stack</div>
                <div className="flex flex-wrap gap-2">
                  {stack.map((t) => (
                    <StackIcon key={t} name={t} size={14} showLabel />
                  ))}
                </div>
              </div>
              {project.links && (
                <div>
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">Links</div>
                  <div className="flex flex-col gap-1 text-sm">
                    {project.links.web && <a className="hover:text-accent" href={project.links.web} target="_blank" rel="noopener noreferrer">Live ↗</a>}
                    {project.links.github && <a className="hover:text-accent" href={project.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
                    {project.links.download && <a className="hover:text-accent" href={project.links.download} target="_blank" rel="noopener noreferrer">Download ↗</a>}
                    {project.links.producthunt && <a className="hover:text-accent" href={project.links.producthunt} target="_blank" rel="noopener noreferrer">Product Hunt ↗</a>}
                  </div>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-9">
            {sections.map((s) => (
              <section key={s.key} className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{s.label}</div>
                <h2 className="font-serif text-2xl">{s.heading}</h2>
                {s.body.length > 1 ? (
                  <ul className="space-y-1.5">
                    {s.body.map((line, i) => (
                      <li key={i} className="flex gap-2.5 text-[15px] text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="max-w-[62ch] text-[15px] text-muted-foreground">{s.body[0]}</p>
                )}
              </section>
            ))}

            {cs.results && cs.results.length > 0 && (
              <section className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">Results</div>
                <h2 className="font-serif text-2xl">Impact</h2>
                <div className="flex flex-wrap gap-3">
                  {cs.results.map((r, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card px-4 py-3">
                      <div className="font-serif text-2xl text-foreground">{r.value}</div>
                      <div className="text-xs text-subtle">{r.caption}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Fallback for projects without case-study content */}
            {sections.length === 0 && !cs.results && project.longDescription && (
              <div className="space-y-4">
                {project.longDescription.split("\n\n").map((p, i) => (
                  <p key={i} className="text-[15px] text-muted-foreground">{p}</p>
                ))}
              </div>
            )}
          </div>
        </ProseGutter>
      </Container>
    </main>
  );
}

function GutterItem({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">{k}</div>
      <div className="text-sm text-foreground">{v}</div>
    </div>
  );
}
```

> `lib/seo.ts` (`softwareAppLd`, `ogUrl`) is created in Task 23/26. **If implementing strictly in order, create `lib/seo.ts` (Task 23 Step 1 + Task 26 Step 1) before this task, or stub the two functions now and fill them in.** To keep this task self-contained, add a minimal `lib/seo.ts` now if it doesn't exist:
>
> ```ts
> import { baseUrl } from "@/app/sitemap";
> import type { TSideProject } from "@/lib/projectsData";
> export function ogUrl(p: { title: string; subtitle?: string; type?: string; label?: string }) {
>   const q = new URLSearchParams();
>   q.set("title", p.title);
>   if (p.subtitle) q.set("subtitle", p.subtitle);
>   if (p.type) q.set("type", p.type);
>   if (p.label) q.set("label", p.label);
>   return `${baseUrl}og?${q.toString()}`;
> }
> export function softwareAppLd(p: TSideProject) {
>   return {
>     "@context": "https://schema.org",
>     "@type": "SoftwareApplication",
>     name: p.title,
>     description: p.tagline,
>     applicationCategory: "DeveloperApplication",
>     url: `${baseUrl}project/${p.slug}`,
>     author: { "@type": "Person", name: "Shashwat Tripathi" },
>   };
> }
> ```

- [ ] **Step 3: Verify (visual + build)**

Run: `npm run build` (this page now uses `generateStaticParams` — build must succeed for all 3 slugs).
Run: `npm run dev` → `/project/paper-noise` shows the gutter (Role/Year/Stack/Links) + Overview→Lessons sections + Results metric cards. Visit `/project/kiryoku` (no caseStudy) → page still renders cleanly with header, media, and the `longDescription` fallback. Light + dark + mobile (gutter stacks above content).
Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 4: Commit**

```bash
git add app/project/[slug]/page.tsx components/project/ProjectMedia.tsx lib/seo.ts
git commit -m "feat(case-study): editorial case-study page with gutter, conditional sections, metrics"
```

---

## Phase 5 — Projects index + filters

### Task 14: Derive filters (pure) + rebuild `SideProjectCard`

**Files:**
- Create: `lib/projectFilters.ts`
- Modify: `components/SideProjectCard.tsx` (replace with a thin wrapper over `ProjectShowcaseCard`)

- [ ] **Step 1: Create `lib/projectFilters.ts`**

```ts
import type { TSideProject } from "@/lib/projectsData";

export type FilterTag = { tag: string; count: number };

/** Returns tag chips only when filtering is worthwhile: >=2 tags each used by >=2 projects. */
export function deriveFilters(projects: TSideProject[]): FilterTag[] {
  const counts = new Map<string, number>();
  for (const p of projects) for (const t of p.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
  const tags = [...counts.entries()].map(([tag, count]) => ({ tag, count }));
  const meaningful = tags.filter((t) => t.count >= 2);
  return meaningful.length >= 2 ? tags.sort((a, b) => b.count - a.count) : [];
}
```

- [ ] **Step 2: Verify the pure function**

Run:
```bash
npx tsx -e 'import { deriveFilters } from "./lib/projectFilters"; import { sideProjects } from "./lib/projectsData"; console.log(deriveFilters(sideProjects));'
```
Expected: `[]` today (only PaperNoise has tags) — confirms filters stay hidden until more projects are tagged. (If `tsx` isn't installed, run `npx --yes tsx -e ...`.)

- [ ] **Step 3: Replace `components/SideProjectCard.tsx`**

```tsx
import type { TSideProject } from "@/lib/projectsData";
import ProjectShowcaseCard from "./ProjectShowcaseCard";

export default function SideProjectCard({ project }: { project: TSideProject; index?: number }) {
  return <ProjectShowcaseCard project={project} />;
}
```

> `index` prop kept optional for backward compatibility with existing call sites.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 5: Commit**

```bash
git add lib/projectFilters.ts components/SideProjectCard.tsx
git commit -m "feat(projects): filter derivation + unify project card"
```

---

### Task 15: Rebuild the projects index with conditional filters

**Files:**
- Create: `components/ProjectsIndex.tsx` (client filter island)
- Modify: `app/projects/page.tsx`

- [ ] **Step 1: Create `components/ProjectsIndex.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import type { TSideProject } from "@/lib/projectsData";
import { deriveFilters } from "@/lib/projectFilters";
import ProjectShowcaseCard from "./ProjectShowcaseCard";

export default function ProjectsIndex({ projects }: { projects: TSideProject[] }) {
  const filters = useMemo(() => deriveFilters(projects), [projects]);
  const [active, setActive] = useState<string>("all");
  const shown = active === "all" ? projects : projects.filter((p) => (p.tags || []).includes(active));

  return (
    <div className="space-y-7">
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[{ tag: "all", count: projects.length }, ...filters].map((f) => (
            <button
              key={f.tag}
              onClick={() => setActive(f.tag)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                active === f.tag
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.tag}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {shown.map((p) => (
          <ProjectShowcaseCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/projects/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowLeft } from "feather-icons-react";
import { sideProjects } from "@/lib/projectsData";
import { baseUrl } from "@/app/sitemap";
import Container from "@/components/layout/Container";
import Label from "@/components/layout/Label";
import ProjectsIndex from "@/components/ProjectsIndex";
import { ogUrl } from "@/lib/seo";

export const metadata = {
  title: "Projects",
  description: "Personal projects and experiments I've built.",
  alternates: { canonical: `${baseUrl}projects` },
  openGraph: {
    title: "Projects",
    description: "Personal projects and experiments I've built.",
    images: [{ url: ogUrl({ title: "Projects", subtitle: "Things I've built", type: "generic", label: "Work" }) }],
  },
};

export default function ProjectsPage() {
  return (
    <main className="py-16 md:py-24">
      <Container width="wide" className="space-y-8">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="space-y-2">
          <Label>Projects</Label>
          <h1 className="font-serif text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]">
            Everything I&apos;ve shipped
          </h1>
        </div>
        <ProjectsIndex projects={sideProjects} />
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Verify (visual + build)**

Run: `npm run build` then `npm run dev` → `/projects` shows editorial header + 2-col showcase grid. Filter bar is **hidden** (only 1 tagged project). Light + dark + mobile.
Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 4: Commit**

```bash
git add components/ProjectsIndex.tsx app/projects/page.tsx
git commit -m "feat(projects): index page with conditional filters and showcase grid"
```

---

## Phase 6 — Remaining home sections

> For each task below: **read the current component first** to preserve its data wiring (props, hooks, data imports like `workData`, `books`, marquee, Spotify), then reskin using `Section`/`Container`/`Label`/`Reveal` and the new tokens. Keep all dynamic/data logic; change only presentation.

### Task 16: Experience (Work) → editorial timeline

**Files:**
- Modify: `components/Work.tsx`

- [ ] **Step 1: Read `components/Work.tsx` and `lib/workData.ts`** to learn the data shape (org, role, dates, blurb, link).

- [ ] **Step 2: Wrap in a `Section` with `id="experience"`, `label="Experience"`, render rows** using this row markup (map over the existing work data; adapt field names to what you found):

```tsx
// row template — adapt field names to lib/workData.ts
<div className="grid grid-cols-1 gap-2 border-b border-border py-4 last:border-0 md:grid-cols-[120px_1fr] md:gap-5">
  <div className="pt-0.5 font-mono text-xs tabular-nums text-subtle">{item.dates}</div>
  <div>
    <div className="font-semibold text-foreground">{item.role}</div>
    <div className="text-sm text-accent">{item.org}</div>
    {item.blurb && <div className="mt-1 text-sm text-muted-foreground">{item.blurb}</div>}
  </div>
</div>
```

Outer:

```tsx
<Section id="experience" label="Experience" width="reading">
  <div>{/* mapped rows */}</div>
</Section>
```

- [ ] **Step 3: Verify (visual)** — `/#experience` shows a clean timeline; dates use mono tabular numerals and align. Light + dark + mobile. `npx tsc --noEmit && npm run lint`.

- [ ] **Step 4: Commit**

```bash
git add components/Work.tsx
git commit -m "feat(experience): editorial timeline styling"
```

---

### Task 17: Clients → muted→color logo row

**Files:**
- Modify: `components/Clients.tsx`

- [ ] **Step 1: Read `components/Clients.tsx`** (uses `Marquee` and/or logos). Preserve the marquee/data.

- [ ] **Step 2: Wrap in `Section` (`label="Trusted by"`, `width="reading"`)** and apply muted-by-default, color-on-hover to logos:

```tsx
// logo image className
className="opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
```

- [ ] **Step 3: Verify (visual)** — logos muted, colorize on hover; marquee still animates; respects reduced-motion. `npx tsc --noEmit && npm run lint`.

- [ ] **Step 4: Commit**

```bash
git add components/Clients.tsx
git commit -m "feat(clients): muted-to-color logo treatment in Section"
```

---

### Task 18: Toolkit (TechStack) → grouped chips

**Files:**
- Modify: `components/TechStack.tsx`

- [ ] **Step 1: Read `components/TechStack.tsx`** to learn how stacks are grouped/rendered (uses `StackIcon`).

- [ ] **Step 2: Wrap in `Section` (`id="tech_stack"`, `label="Toolkit"`, `width="reading"`)** and lay out groups as `grid-cols-[120px_1fr]` rows with mono category labels:

```tsx
<div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr] md:items-start">
  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">Frontend</div>
  <div className="flex flex-wrap gap-2">{/* StackIcon chips */}</div>
</div>
```

Chip wrapper class: `rounded-[9px] border border-border bg-card px-3 py-2 text-sm text-muted-foreground`.

- [ ] **Step 3: Verify (visual)** — grouped, labeled tech rows; chips readable in both themes. `npx tsc --noEmit && npm run lint`.

- [ ] **Step 4: Commit**

```bash
git add components/TechStack.tsx
git commit -m "feat(toolkit): grouped, labeled tech stack"
```

---

### Task 19: Now (Activity) + Socials/Contact

**Files:**
- Modify: `components/Activity.tsx`, `components/Socials.tsx`

- [ ] **Step 1: Read both files** to preserve Spotify/book/social data + links.

- [ ] **Step 2: Activity** → wrap in `Section` (`label="Now"`, `width="reading"`); render existing cards in a `grid gap-4 md:grid-cols-2`, each card `rounded-2xl border border-border bg-card p-4`.

- [ ] **Step 3: Socials** → render as a centered contact block inside a `Section` (`label="Get in touch"`, `width="reading"`):

```tsx
<div className="space-y-4 text-center">
  <h2 className="font-serif text-3xl">Let&apos;s build something good.</h2>
  <a href="mailto:contact@shashwa7.in" className="inline-block rounded-[9px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">
    contact@shashwa7.in
  </a>
  <div className="flex justify-center gap-4 pt-2 text-sm text-muted-foreground">
    {/* existing social links, className="hover:text-accent" */}
  </div>
</div>
```

- [ ] **Step 4: Verify (visual)** — Now cards + centered contact CTA render in both themes/mobile. `npx tsc --noEmit && npm run lint`.

- [ ] **Step 5: Commit**

```bash
git add components/Activity.tsx components/Socials.tsx
git commit -m "feat(home): restyle Now activity and contact sections"
```

---

### Task 20: Recompose the homepage + mount ⌘K

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import About from "@/components/About";
import Projects from "@/components/Projects";
import Work from "@/components/Work";
import Clients from "@/components/Clients";
import TechStack from "@/components/TechStack";
import Activity from "@/components/Activity";
import Socials from "@/components/Socials";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const S7Bot = dynamic(() => import("@/components/ChatBot"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <About />
      <Projects />
      <Work />
      <Clients />
      <TechStack />
      <Activity />
      <Socials />
      <S7Bot />
      <CommandPalette />
    </main>
  );
}
```

> Sections now own their own vertical rhythm + dividers via `Section`; the old `max-w-2xl` wrapper and `<Separator>` between sections are removed. `Navbar` was previously rendered here — keep it here (it's `sticky`, not in `layout.tsx`).

- [ ] **Step 2: Verify (visual + build)** — full homepage flows top-to-bottom with generous rhythm: hero → wide projects showcase → experience → clients → toolkit → now → contact. No leftover cramped `max-w-2xl`. `npm run build` succeeds. Light + dark + mobile.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): recompose sections with new layout and mount command palette"
```

---

### Task 21: Build the ⌘K command palette

**Files:**
- Create: `lib/commandData.ts`, `components/CommandPalette.tsx`

- [ ] **Step 1: Create `lib/commandData.ts`**

```ts
import { getAllSideProjects } from "@/lib/projectsData";

export type Command = {
  id: string;
  label: string;
  group: "Navigation" | "Projects" | "Actions";
  href?: string;
  action?: "toggle-theme" | "copy-email";
};

export function buildCommands(): Command[] {
  const nav: Command[] = [
    { id: "nav-work", label: "Selected work", group: "Navigation", href: "/#projects" },
    { id: "nav-exp", label: "Experience", group: "Navigation", href: "/#experience" },
    { id: "nav-writing", label: "Writing", group: "Navigation", href: "/blogs" },
    { id: "nav-books", label: "Books", group: "Navigation", href: "/books" },
  ];
  const projects: Command[] = getAllSideProjects().map((p) => ({
    id: `proj-${p.slug}`,
    label: p.title,
    group: "Projects",
    href: `/project/${p.slug}`,
  }));
  const actions: Command[] = [
    { id: "act-theme", label: "Toggle theme", group: "Actions", action: "toggle-theme" },
    { id: "act-email", label: "Copy email", group: "Actions", action: "copy-email" },
  ];
  return [...nav, ...projects, ...actions];
}

export function filterCommands(commands: Command[], q: string): Command[] {
  const s = q.trim().toLowerCase();
  if (!s) return commands;
  return commands.filter((c) => c.label.toLowerCase().includes(s) || c.group.toLowerCase().includes(s));
}
```

- [ ] **Step 2: Create `components/CommandPalette.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify (visual + logic)**

Run: `npm run dev`. Press ⌘K (or Ctrl+K) → palette opens, autofocuses. Type "paper" → PaperNoise appears; Enter navigates to it. Arrow keys move highlight. "Toggle theme" flips the theme; "Copy email" copies. Esc / backdrop click closes. The navbar ⌘K button also opens it.
Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 4: Commit**

```bash
git add lib/commandData.ts components/CommandPalette.tsx
git commit -m "feat(cmdk): command palette with fuzzy search, nav, and actions"
```

---

## Phase 7 — Dynamic OG

### Task 22: Add font binaries for OG rendering

**Files:**
- Create: `public/fonts/Fraunces-Medium.ttf`, `public/fonts/Inter-Regular.ttf`, `public/fonts/Inter-SemiBold.ttf`

- [ ] **Step 1: Download the fonts into `public/fonts/`**

```bash
mkdir -p public/fonts
curl -sL "https://github.com/undercasetype/Fraunces/raw/master/fonts/ttf/Fraunces-Medium.ttf" -o public/fonts/Fraunces-Medium.ttf
curl -sL "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf" -o public/fonts/Inter-Regular.ttf
curl -sL "https://github.com/rsms/inter/raw/master/docs/font-files/Inter-SemiBold.ttf" -o public/fonts/Inter-SemiBold.ttf
```

- [ ] **Step 2: Verify the files exist and are real TTFs**

```bash
ls -la public/fonts && file public/fonts/*.ttf
```
Expected: three non-empty files identified as TrueType font data. If any download fails or returns HTML, source the TTF from the font's official release and place it manually.

- [ ] **Step 3: Commit**

```bash
git add public/fonts
git commit -m "chore(og): add Fraunces/Inter ttf binaries for OG image rendering"
```

---

### Task 23: Rebuild the OG route (branded, route-aware)

**Files:**
- Modify: `app/og/route.tsx` (full replacement)
- Modify/Create: `lib/seo.ts` (ensure `ogUrl` exists — created in Task 13; no change if present)

- [ ] **Step 1: Replace `app/og/route.tsx`**

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

const LABELS: Record<string, string> = {
  home: "Portfolio",
  project: "Case Study",
  post: "Writing",
  books: "Reading",
  generic: "",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Shashwat Tripathi";
  const subtitle = url.searchParams.get("subtitle") || "";
  const type = url.searchParams.get("type") || "generic";
  const label = url.searchParams.get("label") || LABELS[type] || "";

  const [fraunces, interReg, interSemi] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Fraunces-Medium.ttf")),
    readFile(join(process.cwd(), "public/fonts/Inter-Regular.ttf")),
    readFile(join(process.cwd(), "public/fonts/Inter-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0B0B0F",
          backgroundImage:
            "radial-gradient(900px 500px at 85% -10%, rgba(110,107,242,0.28), transparent)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {label ? (
            <div
              style={{
                fontFamily: "Inter",
                fontSize: 22,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#807DF5",
              }}
            >
              {label}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: title.length > 40 ? 64 : 80,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: "#EDEDEF",
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontFamily: "Inter", fontSize: 30, color: "#9A9AA6", maxWidth: 900 }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Inter",
            fontSize: 24,
            color: "#9A9AA6",
          }}
        >
          <span style={{ color: "#EDEDEF", fontWeight: 600 }}>Shashwat Tripathi</span>
          <span>shashwa7.in</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
        { name: "Inter", data: interReg, weight: 400, style: "normal" },
        { name: "Inter", data: interSemi, weight: 600, style: "normal" },
      ],
    }
  );
}
```

> Uses `runtime = "nodejs"` so `fs` can read the bundled fonts. `next/og` supports Node runtime in Next 14.

- [ ] **Step 2: Verify (visual + build)**

Run: `npm run dev`, open:
- `http://localhost:3000/og?title=Shashwat Tripathi&subtitle=Frontend Engineer&type=home`
- `http://localhost:3000/og?title=PaperNoise&subtitle=Where pixels pretend to be paper&type=project&label=React · TypeScript`
Expected: 1200×630 graphite card with indigo glow, mono eyebrow label, Fraunces title, Inter subtitle, footer wordmark. Run `npm run build` — OG route compiles.

- [ ] **Step 3: Commit**

```bash
git add app/og/route.tsx
git commit -m "feat(og): branded route-aware dynamic OG image generation"
```

---

### Task 24: Wire OG + canonical metadata across routes

**Files:**
- Modify: `app/layout.tsx` (home OG via `ogUrl`), `app/blogs/[slug]/page.tsx` (fix `/blog/`→`/blogs/`, branded OG, author), `app/books/page.tsx` (if present), `app/blogs/page.tsx` (if present)

- [ ] **Step 1: Home OG in `app/layout.tsx`**

In the root `metadata.openGraph.images` and `twitter.images`, replace the static `og-image.png` references with the dynamic route:

```tsx
// near top: import { ogUrl } from "@/lib/seo";
// then use in openGraph.images and twitter.images:
images: [{ url: ogUrl({ title: "Shashwat Tripathi", subtitle: "Frontend Engineer · Crafting quality interfaces", type: "home" }), width: 1200, height: 630, alt: "Shashwat Tripathi — Frontend Engineer" }],
```

(Apply the same `ogUrl(...)` string to `twitter.images`.)

- [ ] **Step 2: Fix blog metadata in `app/blogs/[slug]/page.tsx`**

- Change `ogImage` fallback (line ~27-29) to use branded params:
```tsx
let ogImage = image
  ? image
  : ogUrl({ title, subtitle: description, type: "post" });
```
(add `import { ogUrl } from "@/lib/seo";`)
- Fix the OpenGraph `url` (line ~39) from `/blog/${post.slug}` to `/blogs/${post.slug}`.
- Add `alternates: { canonical: `${baseUrl}blogs/${post.slug}` }` to the returned metadata object.
- In the JSON-LD (line ~79-82), change author `name: "My Portfolio"` to `name: "Shashwat Tripathi"`, and the fallback `image` to `ogUrl({ title: post.metadata.title, type: "post" })`.

- [ ] **Step 3: Books metadata (if `app/books/page.tsx` exists and sets metadata)**

Add `openGraph.images: [{ url: ogUrl({ title: "Books", subtitle: "What I'm reading", type: "books" }) }]` and a canonical `${baseUrl}books`.

- [ ] **Step 4: Verify (build)**

Run: `npm run build`. Then `npm run dev` and view a blog post's `<head>` (View Source) → `og:image` points to `/og?...&type=post`, `og:url` uses `/blogs/`, canonical present.
Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/blogs/[slug]/page.tsx app/books/page.tsx
git commit -m "feat(seo): wire branded OG + canonicals across routes, fix /blog->/blogs"
```

---

## Phase 8 — SEO/GEO + polish

### Task 25: Fix sitemap and add JSON-LD for Person/WebSite

**Files:**
- Modify: `app/sitemap.ts`, `lib/seo.ts` (add `personLd`, `websiteLd`), `app/layout.tsx` (inject root JSON-LD)

- [ ] **Step 1: Fix `app/sitemap.ts`**

- Change blog URL from `${baseUrl}/blog/${post.slug}` to `${baseUrl}blogs/${post.slug}` (note `baseUrl` already ends with `/`).
- Add projects routes:
```ts
import { getAllSideProjects } from "@/lib/projectsData";
// ...
const projects = getAllSideProjects().map((p) => ({
  url: `${baseUrl}project/${p.slug}`,
  lastModified: new Date().toISOString().split("T")[0],
}));
const routes = [
  { url: `${baseUrl}`, lastModified: today },
  { url: `${baseUrl}projects`, lastModified: today },
  { url: `${baseUrl}books`, lastModified: today },
];
return [...routes, ...projects, ...blogs, ...bookPages];
```
(define `const today = new Date().toISOString().split("T")[0];`)

- [ ] **Step 2: Add `personLd` and `websiteLd` to `lib/seo.ts`**

```ts
import { baseUrl } from "@/app/sitemap";

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Shashwat Tripathi",
    url: baseUrl,
    jobTitle: "Frontend Engineer",
    email: "mailto:contact@shashwa7.in",
    sameAs: [
      "https://github.com/shashwa7-dev",
      "https://x.com/offcod8",
    ],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shashwat Tripathi",
    url: baseUrl,
  };
}
```

- [ ] **Step 3: Inject root JSON-LD in `app/layout.tsx`**

Inside `<head>` (alongside the existing theme script), add:

```tsx
<script
  type="application/ld+json"
  suppressHydrationWarning
  dangerouslySetInnerHTML={{ __html: JSON.stringify([personLd(), websiteLd()]) }}
/>
```
(add `import { personLd, websiteLd } from "@/lib/seo";`)

- [ ] **Step 4: Verify**

Run: `npm run build`. Open `/sitemap.xml` in dev → blog URLs use `/blogs/`, project URLs present. View home source → Person + WebSite JSON-LD present.
Run: `npx tsc --noEmit && npm run lint`

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts lib/seo.ts app/layout.tsx
git commit -m "feat(seo): fix sitemap urls, add Person/WebSite JSON-LD"
```

---

### Task 26: Final QA pass

**Files:** none (verification only) — fix-forward any issues found, committing per fix.

- [ ] **Step 1: Full build + lint + types**

```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: all clean.

- [ ] **Step 2: Reduced-motion check**

In the browser devtools (Rendering → "Emulate prefers-reduced-motion: reduce"), reload the homepage. Expected: content appears without transform animations (Reveal falls back to static; CSS reduced-motion block neutralizes transitions).

- [ ] **Step 3: Accessibility + Lighthouse**

Run Lighthouse (Chrome devtools) on `/` and `/project/paper-noise` in both themes. Targets: Performance 95+, SEO 100, Accessibility 100, Best Practices 100. Note any failures and fix-forward (common: missing alt text, contrast on subtle text, focus-visible rings). Verify keyboard nav: Tab through nav → links/buttons show focus; ⌘K trap works; Esc closes.

- [ ] **Step 4: Cross-check both themes + mobile** on every route: `/`, `/projects`, `/project/paper-noise`, `/project/kiryoku` (no case study), `/blogs`, a blog post, `/books`, and `/not-found`.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(polish): a11y, contrast, and reduced-motion adjustments from QA"
```

- [ ] **Step 6: Update README** tech/section notes if they reference the old e-ink theme (optional, low priority).

---

## Self-Review (performed against the spec)

- **§2 Decisions** — layout primitives (Task 5), serif type (Tasks 1-3), graphite+indigo (Task 2), projects showcase (Tasks 9-10, 14-15), case studies (Tasks 11-13), restrained motion (Task 4 + Reveal), ⌘K (Task 21), OG (Tasks 22-24). ✓ Covered.
- **§3 Foundation** — exact HSL values in Task 2; fonts in Task 1; tailwind mapping Task 3; motion Task 4. ✓
- **§4 Primitives** — Container/Section/Label/Reveal/ProseGutter in Task 5. ✓
- **§5 IA** — homepage recompose (Task 20); routes restyled (Tasks 13, 15); no Experience/Resume page added. ✓
- **§6 Designs** — every section has a task. ✓
- **§7 Data model** — Task 11; example content Task 12. ✓
- **§8 OG** — Tasks 22-24 cover route-aware templates + font loading + per-route wiring. ✓
- **§9 SEO/GEO** — sitemap fix + JSON-LD Tasks 24-25; canonicals Tasks 13/15/24. ✓
- **§10 Performance** — server-first sections, `dynamic()` for ChatBot + palette (Task 20), `next/image` (Tasks 9, 13), font `display:swap` (Task 1); verified via Task 26 Lighthouse. ✓
- **§11 A11y** — Task 26 audit; aria labels in Navbar/palette. ✓
- **Sequencing note:** `ProjectShowcaseCard` (Task 9) references `caseStudy`; `lib/seo.ts` is first created in Task 13. Both are flagged inline with "do X first if tsc errors." ✓
- **Type consistency:** `TSideProject.caseStudy`/`tags` shape used identically in Tasks 11, 12, 13, 14, 21; `ogUrl`/`softwareAppLd`/`personLd`/`websiteLd` signatures consistent across Tasks 13, 15, 23, 24, 25. ✓
- **Placeholder scan:** restyle tasks (16-19) say "read current file first" but each includes the **actual target markup/classes** — no vague "style appropriately." ✓

No unresolved gaps.
