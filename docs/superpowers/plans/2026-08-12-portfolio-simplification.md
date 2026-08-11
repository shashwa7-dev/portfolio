# Portfolio Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip the portfolio to a professional, consistent surface: neutral warm palette with no accent hue, one coherent type scale on DM Sans + IBM Plex Mono, motion that obeys Emil Kowalski's standards, and roughly 6,860 lines of showcase and decorative code deleted.

**Architecture:** Pure subtraction plus retokenization. No new features, no layout changes, no copy rewrites except the hero headline. Deletions land first so later retokenizing passes have a smaller surface to sweep. A single executable gate script (`scripts/verify-simplification.sh`) encodes every mechanical invariant from the spec and serves as the red-green cycle in place of a unit test suite.

**Tech Stack:** Next.js 14.2 App Router, React 18, TypeScript 5, Tailwind CSS 3.4, motion 12.23 (`motion/react`), Radix UI via shadcn, `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-08-11-portfolio-simplification-design.md`

## Global Constraints

- **No em-dashes in any user-facing copy.** Use periods, colons, parentheses, or rephrase. Applies to UI strings, blog content, and `data/agent-memory.md`.
- **All motion tokens live in `lib/motionVariants.ts`**, mirrored as CSS custom properties in `app/globals.css`. Never paste a literal easing array or duration number into a component. Keep both files in sync.
- **All Marker highlight helpers** go through `lib/markerHighlight.tsx` (`withMarker`, `fullMarker`).
- **Page padding** is `py-8 md:py-12` on the `<main>` of every secondary route.
- **The global `<Navbar />`** renders once in `app/layout.tsx`. Per-page Navbar imports are forbidden.
- **`data/agent-memory.md` MUST be updated in the same change** as any portfolio fact change (tech stack, routes, stats, bio). This plan changes the font stack and removes routes, so Task 13 is mandatory, not optional.
- **UI animations stay under 300ms.** The only permitted exception after this work is the 404 page sequence.
- **`--ease-out` is exactly `cubic-bezier(0.23, 1, 0.32, 1)`.** Emil's published value. Do not round or substitute.
- **Never `ease-in` on UI. Never `transition: all`. Never `scale(0)` entries.**
- **Two hues survive the palette**, both semantic: `--destructive` (red) and `emerald-500` (availability and current-role status). Everything else is neutral.
- **Verification is `npm run build` + `npm run lint` + `./scripts/verify-simplification.sh`**, all three clean. There is no test script in this repo.
- **Branch:** cut from current `feat/global-shortcuts-and-palette-fixes` HEAD. Do not reset to `master` (see spec section 2 for why).

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `scripts/verify-simplification.sh` | Executable gate. Encodes all 14 mechanical invariants. Single source of truth for "is this done" |
| `components/ui/accordion.tsx` | shadcn/Radix accordion, generated then retokenized |
| `components/common/IconSwap.tsx` | Crossfade between two states in a fixed grid cell. Shared by both copy buttons (Task 14) |

**Deleted (26 route/showcase files, 8 component files, 29 skill files):**

`app/motion/` (2), `components/motion/` (24), `app/design/page.tsx`, `app/skills/` (3), `lib/skillsData.ts`, `components/common/Accordion.tsx`, `components/AnimatedBackground.tsx`, `components/HeroTitle.tsx`, `lib/useHeadingCycle.ts`, `components/layout/Divider.tsx`, `components/layout/Reveal.tsx`, `components/common/Marquee.tsx`, `components/CurrentState.tsx`, `components/NFT.tsx`, `components/AvatarWithThemeSwitch.tsx`, `components/WorkListItem.tsx`, `components/BottomFadeMask.tsx`, `components/CurrentTime.tsx`, `components/ui/CardNav/` (3), `.claude/skills/transitions-dev/` (29), `docs/superpowers/plans/2026-07-24-motion-polish-and-showcase.md`

**Modified (core):** `app/globals.css` (palette + motion vars + h1-h6), `tailwind.config.ts` (fonts + scales), `app/layout.tsx` (font loaders + removed mounts), `lib/motionVariants.ts` (177 lines to ~70), `components/ExperienceWork.tsx`, `components/Faq.tsx`, `components/ui/tooltip.tsx`, `components/Navbar.tsx`, `components/CommandPalette.tsx`, `components/KeyboardShortcuts.tsx`, `components/ChatBot.tsx`, `components/About.tsx`, `middleware.ts`, `lib/commandData.ts`, `lib/shortcutsData.ts`, `app/sitemap.ts`, `public/.well-known/llms.txt`, `CLAUDE.md`, `data/agent-memory.md`

---

## Task 1: The verification gate

**Files:**
- Create: `scripts/verify-simplification.sh`

**Interfaces:**
- Consumes: nothing.
- Produces: `./scripts/verify-simplification.sh` exits `0` when all checks pass, `1` otherwise. Every later task runs it. Checks are numbered `C01`-`C14` and later tasks reference those IDs.

This is the failing test. It should be almost entirely red when written, and each subsequent task turns specific checks green.

- [ ] **Step 1: Write the gate script**

```bash
#!/usr/bin/env bash
# Mechanical invariants for the portfolio simplification.
# Spec: docs/superpowers/specs/2026-08-11-portfolio-simplification-design.md
# Usage: ./scripts/verify-simplification.sh
# Exit 0 = all checks pass.

set -uo pipefail
cd "$(dirname "$0")/.."

# Preflight. Without this, running from the wrong directory makes every
# count check find zero matches and report PASS. A gate that goes green
# when it cannot find the source tree is worse than no gate at all.
for required in package.json app components lib tailwind.config.ts; do
  if [ ! -e "$required" ]; then
    printf '\033[31mABORT\033[0m  not at the repo root: %s is missing (cwd: %s)\n' \
      "$required" "$(pwd)" >&2
    exit 2
  fi
done

FAILED=0

# count <label> <expected-count> <grep-args...>
count() {
  local id="$1" label="$2" want="$3"; shift 3
  local got
  got=$("$@" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$got" = "$want" ]; then
    printf '  \033[32mPASS\033[0m  %s  %s\n' "$id" "$label"
  else
    printf '  \033[31mFAIL\033[0m  %s  %s (expected %s, got %s)\n' "$id" "$label" "$want" "$got"
    FAILED=1
  fi
}

# absent <id> <label> <path>
absent() {
  local id="$1" label="$2" path="$3"
  if [ ! -e "$path" ]; then
    printf '  \033[32mPASS\033[0m  %s  %s\n' "$id" "$label"
  else
    printf '  \033[31mFAIL\033[0m  %s  %s (%s still exists)\n' "$id" "$label" "$path"
    FAILED=1
  fi
}

SRC=(app components lib)

echo ""
echo "Typography"
count C01 "no arbitrary text-[Npx]"      0 grep -rEoh "text-\[[0-9.]+px\]" --include=*.tsx app components
count C02 "no arbitrary tracking-[Nem]"  0 grep -rEoh "tracking-\[[0-9.]+em\]" --include=*.tsx app components
count C03 "no font-serif"                0 grep -rEoh "font-serif" --include=*.tsx --include=*.ts app components lib
count C04 "no Inter/Fraunces/JetBrains"  0 grep -rEoh "Fraunces|font-inter|JetBrains_Mono" --include=*.ts --include=*.tsx app lib tailwind.config.ts

echo ""
echo "Motion"
count C05 "no transition-all"            0 grep -rEoh "transition-all" --include=*.tsx --include=*.css app components
count C06 "no tw-animate keyframes"      0 grep -rEoh "animate-in|animate-out|fade-in-0|zoom-in-95" --include=*.tsx app components
count C07 "single TooltipProvider"       1 grep -rEl "<TooltipProvider" --include=*.tsx app components
count C08 "no whileInView"               0 grep -rEoh "whileInView" --include=*.tsx app components
count C09 "orphaned motion tokens gone"  0 grep -rEoh "ease\.expo|ease\.modal|spring\.soft|spring\.pop|duration\.ambient|duration\.draw|wordCycle|stagger\.section" --include=*.ts --include=*.tsx app components lib

echo ""
echo "Deleted surfaces"
absent C10 "/motion route gone"          app/motion
absent C10 "/motion components gone"     components/motion
absent C11 "/design route gone"          app/design
absent C11 "/skills route gone"          app/skills
absent C11 "skillsData gone"             lib/skillsData.ts
absent C12 "transitions-dev skill gone"  .claude/skills/transitions-dev
count C13 "no dead component imports"    0 grep -rEoh "components/(Marquee|CurrentState|NFT|AvatarWithThemeSwitch|WorkListItem|BottomFadeMask|CurrentTime|AnimatedBackground|HeroTitle)|layout/(Divider|Reveal)|common/Accordion|common/Marquee|ui/CardNav" --include=*.tsx --include=*.ts app components lib
absent C13 "CardNav gone"                components/ui/CardNav

echo ""
echo "Palette"
count C14 "no indigo hue in tokens"      0 grep -rEoh "24[12] [0-9]+%|--accent: *24" app/globals.css

echo ""
if [ "$FAILED" = 0 ]; then
  printf '\033[32mAll checks pass.\033[0m\n\n'
else
  printf '\033[31mSome checks failed.\033[0m\n\n'
fi
exit "$FAILED"
```

- [ ] **Step 2: Make it executable and run it to confirm it fails**

```bash
chmod +x scripts/verify-simplification.sh
./scripts/verify-simplification.sh
```

Expected: exit code 1, with exactly this baseline (measured on this branch before any changes):

```
Typography
  FAIL  C01  no arbitrary text-[Npx] (expected 0, got 132)
  FAIL  C02  no arbitrary tracking-[Nem] (expected 0, got 33)
  FAIL  C03  no font-serif (expected 0, got 34)
  FAIL  C04  no Inter/Fraunces/JetBrains (expected 0, got 11)
Motion
  PASS  C05  no transition-all
  FAIL  C06  no tw-animate keyframes (expected 0, got 4)
  FAIL  C07  single TooltipProvider (expected 1, got 2)
  FAIL  C08  no whileInView (expected 0, got 2)
  FAIL  C09  orphaned motion tokens gone (expected 0, got 53)
Deleted surfaces
  FAIL  C10-C12  (six paths still exist)
  FAIL  C13  no dead component imports (expected 0, got 12)
Palette
  FAIL  C14  no indigo hue in tokens (expected 0, got 12)
```

If your numbers differ materially from these, stop and investigate before proceeding: something already diverged from the audit the spec was written against.

`C05` already PASSES and that is deliberate. This branch is at zero `transition-all` while `master` has it in 8 files, which is one of the reasons the spec forbids resetting to `master`. It must stay green.

`C07` reporting `got 2` is the duplicate-`TooltipProvider` bug from spec finding 9, confirmed live.

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-simplification.sh
git commit -m "test(verify): executable gate for the simplification invariants

No test runner in this repo, so the spec's mechanical invariants become an
executable script. C01-C14 are referenced by each task in the plan. Red now,
green by the end."
```

---

## Task 2: Delete the showcase routes and unhook their wiring

**Files:**
- Delete: `app/motion/` (2 files), `components/motion/` (24 files), `app/design/page.tsx`, `app/skills/page.tsx`, `app/skills/[slug]/page.tsx`, `app/skills/[slug]/markdown/route.ts`, `lib/skillsData.ts`, `.claude/skills/transitions-dev/` (29 files), `docs/superpowers/plans/2026-07-24-motion-polish-and-showcase.md`
- Modify: `components/Navbar.tsx:15`, `lib/commandData.ts:17-19`, `lib/shortcutsData.ts:14-15`, `app/sitemap.ts:24,28`, `middleware.ts`, `public/.well-known/llms.txt`

**Interfaces:**
- Consumes: the gate script from Task 1.
- Produces: `C10`, `C11`, `C12` green. `C01`/`C02`/`C03` counts drop substantially as a side effect, because `app/design/page.tsx` alone held 16 accent references and many arbitrary type values.

Deletions land before any retokenizing so later sweeps touch less code. `components/motion/` was verified self-contained: nothing outside `app/motion/` imports any of its 24 components.

- [ ] **Step 1: Delete the route and showcase files**

```bash
git rm -r app/motion components/motion app/design app/skills .claude/skills/transitions-dev
git rm lib/skillsData.ts docs/superpowers/plans/2026-07-24-motion-polish-and-showcase.md
```

- [ ] **Step 2: Remove the Design link from the Navbar**

In `components/Navbar.tsx`, delete this line from the nav array:

```tsx
{ label: "Design", href: "/design" },
```

- [ ] **Step 3: Remove the three nav commands**

In `lib/commandData.ts`, delete these three entries from the `nav` array:

```tsx
{ id: "nav-design", label: "Design system", group: "Navigation", href: "/design" },
{ id: "nav-motion", label: "Motion system", group: "Navigation", href: "/motion" },
{ id: "nav-principles", label: "12 principles of animation", group: "Navigation", href: "/motion/principles" },
```

- [ ] **Step 4: Remove the two go-to shortcuts**

In `lib/shortcutsData.ts`, delete from `goToShortcuts`:

```tsx
{ key: "d", label: "Design", href: "/design" },
{ key: "m", label: "Motion", href: "/motion" },
```

- [ ] **Step 5: Remove the sitemap entries**

In `app/sitemap.ts`, delete both objects whose `url` is `` `${baseUrl}motion` `` and `` `${baseUrl}motion/principles` ``.

- [ ] **Step 6: Remove the skills branch from middleware**

In `middleware.ts`: delete the `skillRoute` regex constant, delete the `if (skill)` rewrite branch that targets `/skills/${skill[1]}/markdown`, and remove `"/skills/:path*"` from the `matcher` array so it reads:

```ts
export const config = {
  matcher: ["/", "/blogs/:path*", "/work/:path*"],
};
```

- [ ] **Step 7: Remove the skills and design lines from llms.txt**

In `public/.well-known/llms.txt`, delete the line beginning `- Skills:      /skills/<slug>`, the two lines beginning `- /skills`, and the line beginning `- /design`.

- [ ] **Step 8: Verify the build and the gate**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Expected: build and lint clean. `C10`, `C11`, `C12` now PASS. Others still FAIL. If the build fails with an unresolved import, grep for the missing symbol; the most likely culprit is a stale `Divider` or `Marker` import inside a deleted page's sibling.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: delete /motion, /motion/principles, /design, /skills

Showcase routes that documented tooling rather than showing work. 1,467
lines of /motion plus 24 self-contained demo components, 736 lines of
/design, 256 of /skills, and the 3,701-line vendored transitions-dev skill
that competed with lib/motionVariants.ts as a source of truth.

Unhooks Navbar, commandData, shortcutsData, sitemap, middleware, llms.txt.
Keeps /markdown: invisible to visitors, cheap, real agent-discovery value."
```

---

## Task 3: Delete the dead and decorative components

**Files:**
- Delete: `components/common/Marquee.tsx`, `components/CurrentState.tsx`, `components/NFT.tsx`, `components/AvatarWithThemeSwitch.tsx`, `components/WorkListItem.tsx`, `components/layout/Reveal.tsx`, `components/layout/Divider.tsx`, `components/BottomFadeMask.tsx`, `components/CurrentTime.tsx`, `components/AnimatedBackground.tsx`, `components/HeroTitle.tsx`, `lib/useHeadingCycle.ts`
- Modify: `app/page.tsx`, `app/layout.tsx`, `components/Footer.tsx`, `components/About.tsx`, `app/work/[org]/page.tsx`, `app/books/[slug]/page.tsx`

**Interfaces:**
- Consumes: Task 2's deletions.
- Produces: `C08` green. `About.tsx` no longer imports `HeroTitle`; it renders the static `<h1>` inline. The `Divider` component no longer exists, so no file may import it.
- **Not** `C13`: that check's regex includes `common/Accordion`, which Task 10 deletes, so `C13` cannot go green until then. Expect it to report exactly 1 remaining hit (`Faq.tsx`) at the end of this task.
- `C08` requires removing the scroll reveal in `components/Clients.tsx:27-32` as well as deleting `Reveal.tsx`. An earlier draft of the spec wrongly called `Reveal.tsx` "the last `whileInView`"; `Clients.tsx` has an independent one wrapping its whole section with a staggered card cascade. Remove it for the reason the plan gives in Task 14's rejected list: homepage section scroll reveals fail the frequency gate.

Six components were verified to have zero consumers. Six more become dead or are decorative chrome being stripped.

- [ ] **Step 1: Delete the confirmed-dead components**

All seven were verified by grep to have no importers anywhere in the repo (`Reveal`'s only consumer was `app/design/page.tsx`, deleted in Task 2; `NFT`'s only consumer was `CurrentState`, itself dead; `components/ui/CardNav/` is 186 lines across 3 files with zero importers).

```bash
git rm components/common/Marquee.tsx components/CurrentState.tsx components/NFT.tsx \
       components/AvatarWithThemeSwitch.tsx components/WorkListItem.tsx components/layout/Reveal.tsx
git rm -r components/ui/CardNav
```

- [ ] **Step 2: Remove the 7 homepage dividers**

In `app/page.tsx`, delete the `import Divider from "@/components/layout/Divider";` line and all 7 `<Divider />` elements, so the body reads:

```tsx
<About />
<ExperienceWork />
<Projects />
<TechStack />
<Clients />
<Activity />
<Faq />
<Socials />
```

- [ ] **Step 3: Remove the remaining Divider usages, then the component**

`app/work/[org]/page.tsx` has 3 usages and `app/books/[slug]/page.tsx` has 1. Remove the import and every `<Divider />` element from both, then:

```bash
git rm components/layout/Divider.tsx
```

- [ ] **Step 4: Remove BottomFadeMask and AnimatedBackground from the layout**

In `app/layout.tsx`, delete the `AnimatedBackground` dynamic import block (lines ~22-26), the `BottomFadeMask` import, and both elements from the JSX body. Then:

```bash
git rm components/BottomFadeMask.tsx components/AnimatedBackground.tsx
```

- [ ] **Step 5: Remove the footer clock**

In `components/Footer.tsx`, delete the `CurrentTime` import and its element. If it sat inside a flex wrapper that now holds a single child, collapse the wrapper. Then:

```bash
git rm components/CurrentTime.tsx
```

- [ ] **Step 6: Freeze the hero and delete the word cycle**

In `components/About.tsx`, replace `<HeroTitle />` with the static headline. This is the phrase already hardcoded in `HeroTitle.tsx`'s reduced-motion branch, so it is a proven fallback. Note `ship and scale` is now a weight-600 span in `--foreground`, not an italic accent span:

```tsx
<h1 className="text-[clamp(2.2rem,5.5vw,3.4rem)] font-semibold leading-[1.02] tracking-tighter text-foreground">
  I build interfaces that{" "}
  <span className="font-semibold text-foreground">ship and scale</span> to
  millions.
</h1>
```

Remove the `HeroTitle` import from `About.tsx`, then:

```bash
git rm components/HeroTitle.tsx lib/useHeadingCycle.ts
```

- [ ] **Step 7: Verify**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Expected: build and lint clean. `C08` and `C13` now PASS. Load the homepage on `npm run dev` and confirm the hero renders one static sentence with no cycling, and that sections read as separated by whitespace alone.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: strip decorative UI and dead components

Dead, zero consumers: Marquee, CurrentState, NFT, AvatarWithThemeSwitch,
WorkListItem, Reveal (its only consumer was /design).

Decorative, removed deliberately: the gradient Divider (7 uses between 8
homepage sections plus 4 elsewhere), BottomFadeMask and AnimatedBackground
(ambient motion on every route), CurrentTime (a footer clock re-rendering
on setInterval(1000) forever), and the hero word cycle (an infinite loop on
the highest-traffic element).

The hero freezes on 'ship and scale', the phrase already hardcoded in
HeroTitle's reduced-motion branch."
```

---

## Task 4: Fonts and the type scale

**Files:**
- Modify: `app/layout.tsx`, `tailwind.config.ts`, `app/globals.css`

**Interfaces:**
- Consumes: Task 3 (so no deleted file needs retokenizing).
- Produces: Tailwind exposes `text-2xs` through `text-4xl` and `tracking-label`/`tight`/`tighter`. CSS vars are `--font-sans` and `--font-mono`; `--font-inter` and `--font-fraunces` no longer exist. Task 5 depends on these class names existing.
- **`C04` drops from 9 to 3, but does not reach green here.** The three survivors are all in `app/og/route.tsx`, which loads Fraunces and Inter TTFs from `public/fonts/` for satori-based OG image generation. That file is owned by Task 7, which rewrites its fonts and its hardcoded colours together. Do not touch it in this task.

- [ ] **Step 1: Swap the font loaders**

In `app/layout.tsx`, replace the three loaders. DM Sans is a variable font, so omit `weight` and let `next/font` serve the full axis. IBM Plex Mono is static and needs explicit weights.

```tsx
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});
```

Update the `<html>` or `<body>` className to use `${dmSans.variable} ${plexMono.variable}` and drop the Fraunces and Inter variables.

- [ ] **Step 2: Update the Tailwind font families and add both scales**

In `tailwind.config.ts`, replace the `fontFamily` block (removing `serif` entirely) and add `fontSize` and `letterSpacing` under `theme.extend`:

```ts
fontFamily: {
  sans: ["var(--font-sans)", ...fontFamily.sans],
  mono: ["var(--font-mono)", ...fontFamily.mono],
},
fontSize: {
  '2xs': ['0.625rem',  { lineHeight: '1.4' }],   // 10px, mono labels
  xs:    ['0.6875rem', { lineHeight: '1.45' }],  // 11px
  sm:    ['0.8125rem', { lineHeight: '1.55' }],  // 13px
  base:  ['0.9375rem', { lineHeight: '1.65' }],  // 15px
  lg:    ['1.0625rem', { lineHeight: '1.5' }],   // 17px
  xl:    ['1.25rem',   { lineHeight: '1.4' }],   // 20px
  '2xl': ['1.5rem',    { lineHeight: '1.25' }],  // 24px
  '3xl': ['1.875rem',  { lineHeight: '1.15' }],  // 30px
  '4xl': ['2.25rem',   { lineHeight: '1.08' }],  // 36px
},
letterSpacing: {
  label:   '0.1em',
  normal:  '0',
  tight:   '-0.02em',
  tighter: '-0.03em',
},
```

Removing the `serif` key is deliberate. Leaving it while dropping the font would silently fall back to Georgia.

- [ ] **Step 3: Update the heading rules and drop the Inter-specific font features**

In `app/globals.css`, the `h1..h6` block currently sets `font-family: var(--font-fraunces), Georgia, serif`. Replace with:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

h1 { font-size: 2.25rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
```

`h2` moves from `1.75rem` to `1.5rem` so it lands on the `2xl` step. This affects blog prose headings, so note it for the manual sweep in Task 14.

In the `body` rule, delete `font-feature-settings: "cv11", "ss01";`. Those are Inter-specific OpenType features. DM Sans does not implement them, so leaving the declaration is dead weight at best and could disable a default feature at worst.

- [ ] **Step 4: Verify**

```bash
npm run build && ./scripts/verify-simplification.sh
```

Expected: build clean, `C04` PASS. `C01`/`C02`/`C03` still FAIL, they are Task 5. Run `npm run dev` and confirm text renders in DM Sans rather than a fallback serif. If everything renders in Times, the `variable` name in `layout.tsx` does not match `tailwind.config.ts`.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx tailwind.config.ts app/globals.css
git commit -m "feat(type): DM Sans + IBM Plex Mono, plus the missing type scale

Drops Fraunces entirely and replaces Inter/JetBrains Mono. Adds the
fontSize and letterSpacing scales that tailwind.config.ts never had, which
is the root cause of 132 arbitrary text-[Npx] values across 14 sizes and
three competing trackings.

Removes the serif key so font-serif fails loudly rather than falling back
to Georgia, and drops font-feature-settings cv11/ss01 (Inter-specific)."
```

---

## Task 5: Migrate the 132 arbitrary type values

**Files:**
- Modify: every `.tsx` under `app/` and `components/` containing an arbitrary type value (roughly 40 files after Task 2's deletions)

**Interfaces:**
- Consumes: the scale classes from Task 4.
- Produces: `C01`, `C02`, `C03` green.

Mechanical, so drive it with scripted replacements and then review the diff. Counts are lower than the spec's original 132 because `app/design/page.tsx` and `app/motion/` are already gone.

- [ ] **Step 1: Record the starting counts**

```bash
grep -rEoh "text-\[[0-9.]+px\]" --include=*.tsx app components | sort | uniq -c | sort -rn
grep -rEoh "tracking-\[[0-9.]+em\]" --include=*.tsx app components | sort | uniq -c | sort -rn
```

Note the numbers. You will compare after the sweep.

- [ ] **Step 2: Run the size migration**

Ordered longest-match-first so `12.5px` is not partially matched by the `12px` rule.

```bash
FILES=$(grep -rEl "text-\[[0-9.]+px\]|tracking-\[[0-9.]+em\]" --include=*.tsx app components)
perl -i -pe '
  s/text-\[8px\]/text-2xs/g;
  s/text-\[9px\]/text-2xs/g;
  s/text-\[10px\]/text-2xs/g;
  s/text-\[11px\]/text-xs/g;
  s/text-\[12\.5px\]/text-sm/g;
  s/text-\[13\.5px\]/text-sm/g;
  s/text-\[12px\]/text-sm/g;
  s/text-\[13px\]/text-sm/g;
  s/text-\[14px\]/text-base/g;
  s/text-\[15px\]/text-base/g;
  s/text-\[16px\]/text-base/g;
  s/text-\[17px\]/text-lg/g;
  s/text-\[18px\]/text-lg/g;
  s/text-\[22px\]/text-2xl/g;
  s/tracking-\[0\.1[246]em\]/tracking-label/g;
' $FILES
```

- [ ] **Step 3: Remove the now-redundant font-serif classes**

Fraunces is gone, so every `font-serif` is a no-op that would fall back to Georgia if the Tailwind key still existed. Delete the class, keeping surrounding classes intact:

```bash
FILES=$(grep -rEl "font-serif" --include=*.tsx app components)
perl -i -pe 's/\bfont-serif\s*//g; s/\s+"/"/g;' $FILES
```

- [ ] **Step 4: Run the gate and read the whole diff**

```bash
./scripts/verify-simplification.sh
git diff --stat
git diff
```

Expected: `C01`, `C02`, `C03` PASS. Then read the diff. The scripted pass cannot judge intent, so check specifically for:
- A heading that was `font-serif text-lg` and is now just `text-lg`, where the intended result is `text-lg font-semibold`. Headings that relied on Fraunces for visual weight now need an explicit weight.
- Any `clamp()` or arbitrary value the regex left behind, for example `text-[clamp(...)]` in the hero, which is intentional and must stay.
- Double spaces or a stray leading space inside a `className` string.

- [ ] **Step 5: Fix the heading weights by hand**

For each heading that lost `font-serif`, add `font-semibold` if it does not already carry a weight. `globals.css` handles real `h1`-`h6` elements, but a `<div>` or `<span>` styled as a heading does not inherit that rule and needs the class.

- [ ] **Step 6: Verify**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Expected: all three clean for `C01`-`C04`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(type): migrate arbitrary type values onto the scale

Collapses 14 ad-hoc font sizes (including 12.5px and 13.5px) into 9 named
steps, and three competing trackings (0.12/0.14/0.16em) into tracking-label.
Removes font-serif now that Fraunces is gone, adding explicit font-semibold
where a heading was relying on the serif for weight."
```

---

## Task 6: The Paper palette

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces: `C14` green. `--accent` now equals `--foreground` in both themes. `--marker` is a new token consumed by Task 8. Task 7 depends on these values.

Copy the values verbatim from spec section 3. Do not re-derive them.

- [ ] **Step 1: Replace the light palette**

Replace the `:root` block's color tokens with the spec's Light values (spec section 3, "Light"), and add `--marker: 38 75% 55% / 0.16`. Keep `--radius: 0.75rem` unchanged.

- [ ] **Step 2: Replace the dark palette**

Replace the `.dark` block's color tokens with the spec's Dark values, and add `--marker: 38 60% 70% / 0.16`.

- [ ] **Step 3: Retune the syntax highlighting tokens**

Replace the seven `--sh-*` values in each theme with the spec's warm-neutral scheme (spec section 3, "Syntax highlighting"). Code blocks are the one place color earns its keep, so these keep real hue while the interface does not.

- [ ] **Step 4: Neutralize the scrollbar**

The scrollbar rules (roughly `globals.css` lines 99-124) are accent-tinted. Replace:

```css
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border-strong)) transparent;
}
::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border-strong));
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 9999px;
  transition: background-color var(--duration-fast) ease;
}
::-webkit-scrollbar-thumb:hover  { background-color: hsl(var(--subtle)); }
::-webkit-scrollbar-thumb:active { background-color: hsl(var(--muted-foreground)); }
```

Note the transition easing moves from `var(--ease-out)` to `ease`: this is a color change, and Emil's decision tree routes color to `ease`.

- [ ] **Step 5: Verify**

```bash
npm run build && ./scripts/verify-simplification.sh
```

Expected: `C14` PASS. Then `npm run dev` and check both themes. Components still reference `--accent`, which now resolves to the foreground color, so expect some inverted-text bugs (white-on-white) which Task 7 fixes. Do not fix them here.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat(color): Paper palette, no accent hue

Replaces Graphite+Indigo. Drops the indigo accent and desaturates the whole
neutral ramp, which carried a 240 hue on every gray. New ramp is
near-neutral with a faint warm cast (hue 30-40 at 5-20% saturation).

--accent becomes the foreground color: emphasis via weight and contrast,
links underlined rather than colored. Two hues survive, both semantic:
--destructive and emerald-500 for status. Syntax highlighting keeps real
hue because code blocks are where color earns its keep."
```

---

## Task 7: Sweep the accent consumers

**Files:**
- Modify: `components/About.tsx`, `components/Clients.tsx`, `components/ChatBot.tsx`, `components/Socials.tsx`, `components/SectionSkeleton.tsx`, `components/ProjectPreviewCard.tsx`, `components/ProjectShowcaseCard.tsx`, `components/common/DiaryEntry.tsx`, `components/chat/MarkdownMessage.tsx`, `components/ui/separator.tsx`, `components/ui/button.tsx`, `app/project/[slug]/page.tsx`, `app/work/[org]/[project]/page.tsx`, `app/books/[slug]/page.tsx`, `app/not-found.tsx`, `app/globals.css` (`.prose a`)

**Interfaces:**
- Consumes: Task 6's tokens.
- Produces: `C04` green (via the OG route rewrite in Step 4), and no white-on-white or invisible-text regressions. Contrast cannot be asserted by the gate, so most of this task's verification is visual.
- Also deletes four font binaries from `public/fonts/`, so `Fraunces-Medium.ttf`, `Inter-Regular.ttf`, `Inter-SemiBold.ttf`, and the entirely-unreferenced `Somatic-Rounded.otf` are gone.

`--accent` now equals `--foreground`, so any `text-white` paired with `bg-accent` is now white-on-near-white in light mode. Enumerate and read each site.

- [ ] **Step 1: List every remaining accent reference**

```bash
grep -rn "accent" --include=*.tsx --include=*.ts --include=*.css app components lib | grep -v node_modules
```

- [ ] **Step 2: Fix the four known-tricky sites**

| File | Before | After |
|---|---|---|
| `components/About.tsx` verified badge | `bg-accent text-white` | `bg-foreground text-background` |
| `components/Clients.tsx` logo row | `hover:outline-accent` | `hover:outline-border-strong` |
| `app/globals.css` `.prose a` | `decoration-accent/50 hover:decoration-accent` | `decoration-subtle hover:decoration-foreground` |
| `components/About.tsx` Clients row | `hover:outline-accent` | `hover:outline-border-strong` |

- [ ] **Step 3: Apply the general rules to the rest**

- `text-accent` / `text-accent-hover` used for emphasis on body copy becomes `text-foreground`.
- `text-accent` used for a link becomes `text-foreground` plus `underline underline-offset-4 decoration-subtle hover:decoration-foreground`.
- `bg-accent` on a solid button keeps `bg-accent` and pairs with `text-accent-foreground` (the token already inverts correctly). Replace any literal `text-white` alongside it.
- `bg-accent/NN` and `border-accent/NN` washes become `bg-muted` and `border-border-strong`.
- `ring-accent` / `outline-accent` becomes `ring-border-strong` / `outline-border-strong`.
- `focus-visible:ring-accent` becomes `focus-visible:ring-ring` (the `--ring` token is already neutral).

- [ ] **Step 4: Rewrite the OG image route (fonts and colours)**

`app/og/route.tsx` (121 lines) generates the social share image via satori. It is the highest-visibility surface on the site, because it is what renders when the link is pasted into LinkedIn, Twitter, or Slack. It is also a concentrated pocket of everything this revamp removes, and no earlier task owns it:

- **Fonts:** it reads three TTFs from `public/fonts/` (`Fraunces-Medium.ttf`, `Inter-Regular.ttf`, `Inter-SemiBold.ttf`) and uses `fontFamily: "Fraunces"` for the title, `"Inter"` for body text.
- **Colours:** four hardcoded hexes, all from the old palette. `#807DF5` is the indigo accent. `#0B0B0F`, `#EDEDEF`, and `#9A9AA6` are the old dark background, foreground, and muted-foreground.

Steps:

1. Download DM Sans TTFs (Regular 400 and SemiBold 600) into `public/fonts/`. Satori needs real font buffers; it cannot use `next/font`. Get them from the Google Fonts repository or the `@fontsource/dm-sans` package files. Verify each downloaded file is a valid TTF (non-trivial byte size, correct magic bytes) before committing, since a corrupt font makes satori fail at request time rather than build time.
2. Replace the three `readFile` calls with the two DM Sans files, and update the `fonts:` array to `{ name: "DM Sans", data: dmSansRegular, weight: 400, style: "normal" }` and the same at `weight: 600`.
3. Replace every `fontFamily: "Fraunces"` and `fontFamily: "Inter"` with `fontFamily: "DM Sans"`. The title keeps its larger size and gains `fontWeight: 600` in place of the serif's visual weight.
4. Replace the four hexes with the **dark** Paper palette values converted to hex, since the OG card is dark: background `#0D0C0C` (from `30 7% 5%`), foreground `#F0EFEE` (from `35 6% 94%`), muted-foreground `#A5A29E` (from `35 6% 63%`). The indigo `#807DF5` has no replacement: that element becomes the foreground colour, matching the no-accent decision.
5. Delete the now-unused font binaries: `git rm public/fonts/Fraunces-Medium.ttf public/fonts/Inter-Regular.ttf public/fonts/Inter-SemiBold.ttf`. Also delete `public/fonts/Somatic-Rounded.otf`, which was verified to have zero references anywhere in the repo.
6. **Verify the route actually renders.** Run `npm run dev` and open `http://localhost:3000/og?title=Shashwat%20Tripathi&subtitle=Frontend%20Engineer&type=home`. You must get a 1200x630 PNG, not a 500. A satori font failure only surfaces at request time, so a clean build proves nothing here.

This step turns `C04` green.

- [ ] **Step 5: Verify visually in both themes**

```bash
npm run build && npm run lint && npm run dev
```

Walk the homepage, one org page, one project case study, one blog post, `/books`, and the 404 page in **both** light and dark. Look specifically for invisible text, a button whose label vanished, and focus rings that disappeared. Toggle theme with `t`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(color): sweep accent consumers onto neutral tokens

--accent now resolves to the foreground color, so every text-white paired
with bg-accent was white-on-near-white in light mode. Emphasis moves to
text-foreground, links get underlines instead of color, washes become muted
or border-strong, and focus rings use the neutral --ring token."
```

---

## Task 8: Motion tokens

**Files:**
- Modify: `lib/motionVariants.ts` (177 lines to roughly 70), `app/globals.css` (motion vars block), `components/common/Marker.tsx`, `app/not-found.tsx`, `components/ChatBot.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `C09` green. `lib/motionVariants.ts` exports exactly: `ease` (with only `out`), `duration` (`fast`/`base`/`med`/`slow`/`hero`), `stagger` (`tight`/`base`/`loose`), `spring` (only `hoverIn`), plus the surviving variants. Tasks 9 and 11 import from this shape.

Findings 1, 2, 3, 4, 10, 11, 12 from spec section 5.

- [ ] **Step 1: Collapse the easings and durations**

In `lib/motionVariants.ts`:

```ts
export const ease = {
  /** Emil Kowalski's published strong ease-out. The single UI curve. */
  out: [0.23, 1, 0.32, 1] as const,
} as const;

export const duration = {
  fast: 0.15,
  base: 0.2,
  med: 0.3,
  /** Entrances. Was 0.4, which broke the sub-300ms UI budget. */
  slow: 0.24,
  /** 404 page sequence only. The one sanctioned exception. */
  hero: 0.5,
} as const;

export const stagger = {
  tight: 0.04,
  base: 0.06,
  loose: 0.08,
} as const;

export const spring = {
  /** Chat FAB inner hover. The only spring left; keep it subtle. */
  hoverIn: { type: "spring", stiffness: 300, damping: 22 } satisfies Transition,
} as const;
```

Delete `ease.modal`, `ease.expo`, `spring.soft`, `spring.pop`, `duration.draw`, `duration.ambient`, `stagger.section`, and the whole `wordCycle` object. All were verified orphaned by Tasks 2 and 3 except `duration.draw` and `stagger.section`, handled in steps 3 and 4.

- [ ] **Step 2: Point every `ease.modal` reference at `ease.out`**

`dialogPopVariants` and `backdropFadeVariants` used `ease.modal`. Replace with `ease.out`. The two curves differed by 0.01 and 0.04 in two control points, which is imperceptible and exactly the duplication Emil calls a consolidation finding.

- [ ] **Step 3: Soften the hover and press targets, and fix the FAB**

```ts
export const hoverLiftRotate = { scale: 1.02 } as const;
export const hoverZoom = { scale: 1.02 } as const;
export const tapPress = { scale: 0.97 } as const;
```

`hoverLiftRotate` loses its `rotate: -3` and keeps the name so `ChatBot.tsx` needs no import change. Then fix `fabPopVariants`, which started at `scale: 0.5, rotate: -12`:

```ts
export const fabPopVariants: Variants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { scale: 0.96, opacity: 0, transition: { duration: duration.fast, ease: ease.out } },
};
```

Nothing appears from nothing, and `spring.pop` is gone so the transition is now duration-based.

- [ ] **Step 4: Give `chatWindowVariants` a faster exit**

It used `spring.soft` for both enter and exit, the only symmetric variant in the file:

```ts
export const chatWindowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.fast, ease: ease.out } },
};
```

- [ ] **Step 5: Fix the two remaining orphan consumers**

`components/common/Marker.tsx` uses `duration.draw` (0.7s) for the highlight draw-on. Remove the animation entirely and render a static wash: delete the motion wrapper and animated width/clip, keeping the `hsl(var(--marker))` background. The static highlight stays because it points at the contact address; only the 700ms draw goes.

`app/not-found.tsx` uses `stagger.section` (200ms, 2.5x Emil's ceiling). Replace with `stagger.loose` (80ms). It also uses `duration.hero`, which survives.

- [ ] **Step 6: Mirror the tokens in CSS and fix reduced motion**

In `app/globals.css`, the motion vars block becomes:

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

  --duration-stagger: 40ms;
  --duration-micro: 80ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-med: 300ms;
  --duration-slow: 240ms;
  --duration-hero: 500ms;
}
```

`--ease-spring` and `--ease-expo` are deleted. Then replace the reduced-motion blanket, which nuked everything to `0.01ms !important`:

```css
/* Reduced motion: fewer and gentler, not zero. Opacity and color still
   transition because they aid comprehension; movement is what causes
   motion sickness, so transforms are what we drop. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-property: opacity, color, background-color, border-color !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 7: Verify**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Expected: `C09` PASS. Then `npm run dev`, open the chat FAB and confirm it pops from a near-full scale rather than shrinking out of nothing, and that closing it is visibly faster than opening. Enable reduced motion at OS level and confirm hovers still change color while nothing slides.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(motion): one curve, sub-300ms entrances, subtler feedback

- duration.slow 0.4 -> 0.24. It backed the four most-used entrance variants,
  making 400ms the app's default entrance against a sub-300ms budget
- three near-identical expo curves collapse to Emil's published
  cubic-bezier(0.23, 1, 0.32, 1); --ease-spring and --ease-expo deleted
- tapPress 0.94 -> 0.97, hoverZoom 1.08 -> 1.02, hoverLiftRotate drops
  its rotate
- fabPopVariants started at scale(0.5) rotate(-12); now 0.96
- chatWindowVariants was the only symmetric enter/exit; exit is now faster
- stagger.section was 200ms, 2.5x the 30-80ms ceiling
- Marker loses its 700ms draw-on, keeps the static wash
- reduced motion keeps opacity and color, drops only transforms"
```

---

## Task 9: Tooltip and keyboard-surface motion

**Files:**
- Modify: `components/ui/tooltip.tsx`, `app/layout.tsx`, `components/About.tsx`, `components/CommandPalette.tsx`, `components/KeyboardShortcuts.tsx`, `components/Navbar.tsx`, `lib/motionVariants.ts`

**Interfaces:**
- Consumes: Task 8's token shape.
- Produces: `C06`, `C07` green. `keyboardSurfaceVariants` and `collapseHeightVariants` are removed from `lib/motionVariants.ts`.

Findings 6, 7, 8, 9 and 5 from spec section 5.

- [ ] **Step 1: Move the tooltip from keyframes to transitions**

In `components/ui/tooltip.tsx`, replace the `animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out ...` class soup. Keyframes restart from zero, and the Clients row has 7+ adjacent triggers, so sweeping across it is the rapid-trigger case transitions handle better. Keep the existing origin-aware class, which is already correct.

```tsx
className={cn(
  "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
  "origin-[--radix-tooltip-content-transform-origin]",
  "transition-[opacity,transform] duration-[var(--duration-fast)] ease-[--ease-out]",
  "data-[state=delayed-open]:opacity-100 data-[state=delayed-open]:scale-100",
  "data-[state=closed]:opacity-0 data-[state=closed]:scale-95",
  className
)}
```

- [ ] **Step 2: Consolidate to one TooltipProvider with a delay skip**

There are currently two providers: one in `app/layout.tsx` and another in `components/About.tsx` at `delayDuration={150}` wrapping only the Clients row. The stats logos therefore fall through to Radix's 700ms default, so two logo groups on the same page have different hover feel.

In `app/layout.tsx`, set the single provider:

```tsx
<TooltipProvider delayDuration={150} skipDelayDuration={0}>
```

In `components/About.tsx`, delete the nested `<TooltipProvider delayDuration={150}>` wrapper and its closing tag, keeping the `Tooltip` children. Remove `TooltipProvider` from that file's import.

`skipDelayDuration={0}` means once one tooltip is open, moving to an adjacent trigger opens instantly. Radix has no `data-instant` equivalent, so the 150ms fade still plays; this is the documented partial fix, with base-ui as the full solution if primitives ever migrate.

- [ ] **Step 3: Make the keyboard surfaces instant**

Emil's hard rule: keyboard-initiated actions repeat hundreds of times a day and must not animate. Raycast has no open/close animation.

In `components/CommandPalette.tsx` and `components/KeyboardShortcuts.tsx`, remove `variants={keyboardSurfaceVariants}` plus the `initial`/`animate`/`exit` props from the panel element, so it renders immediately. Keep `backdropFadeVariants` on the backdrop: the overlay is a large area whose sudden appearance is genuinely jarring, and it is not what the user is looking at.

Then delete `keyboardSurfaceVariants` from `lib/motionVariants.ts`.

- [ ] **Step 4: Move the Navbar collapse off `height`**

`collapseHeightVariants` animates `height`, which triggers layout, paint, and composite. Replace with the `grid-rows` technique carried over from the deleted `Accordion.tsx`. In `components/Navbar.tsx`, replace the `motion.div` using `collapseHeightVariants` with:

```tsx
<div
  className="grid transition-[grid-template-rows] duration-[var(--duration-base)] ease-[--ease-out]"
  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
>
  <div className="overflow-hidden">
    {/* existing menu contents */}
  </div>
</div>
```

Still a layout animation, but it needs no JS measurement and the mobile menu is opened rarely enough to sit inside budget. Delete `collapseHeightVariants` from `lib/motionVariants.ts`.

- [ ] **Step 5: Verify**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Expected: `C06`, `C07` PASS. Then `npm run dev`:
- Sweep the pointer across the Clients logo row. The first tooltip waits 150ms; every subsequent one appears immediately.
- Hover a stats logo and confirm it now uses the same 150ms, not 700ms.
- Press Cmd+K and `?`. Both panels must appear with no scale or fade on the panel itself.
- Open the mobile menu at a narrow viewport and confirm it still expands smoothly.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(motion): tooltip transitions, one provider, instant keyboard surfaces

- tooltip animated via animate-in/zoom-in-95 keyframes; the Clients row has
  7+ adjacent triggers, which is the rapid-trigger case transitions suit
- two TooltipProviders existed (layout.tsx plus one in About.tsx at 150ms
  wrapping only the Clients row), so the stats logos silently used Radix's
  700ms default. One provider now, with skipDelayDuration=0 so adjacent
  tooltips do not re-wait the delay
- Cmd+K and ? panels no longer animate. Keyboard-initiated actions repeat
  hundreds of times daily; Raycast has no open/close animation either.
  The backdrop keeps its fade
- Navbar collapse moves from animated height to grid-rows"
```

---

## Task 10: Replace the accordion with shadcn/Radix

**Files:**
- Create: `components/ui/accordion.tsx` (generated, then edited)
- Delete: `components/common/Accordion.tsx`
- Modify: `components/Faq.tsx`, `tailwind.config.ts`, `package.json`

**Interfaces:**
- Consumes: Task 4's type scale, Task 6's palette.
- Produces: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` exported from `@/components/ui/accordion`. `C13` stays green (nothing may import `common/Accordion`).

The hand-rolled component has four real defects: collapsed content stays in the tab order and accessibility tree (`grid-template-rows: 0fr` hides it visually only), the panel lacks `role="region"` and `aria-labelledby`, the trigger is not wrapped in a heading, and there is no arrow-key navigation. Radix fixes all four.

- [ ] **Step 1: Generate the component**

shadcn is already configured (`components.json`, style `new-york`, `baseColor: neutral`) and Radix is already a dependency via `@radix-ui/react-tooltip`, so this adds no new primitive library.

```bash
npx shadcn@latest add accordion
```

- [ ] **Step 2: Diff before trusting it**

```bash
git status --short
git diff package.json
```

Only `components/ui/accordion.tsx` should be new, plus a `@radix-ui/react-accordion` entry in `package.json`. If the generator touched `tailwind.config.ts`, `globals.css`, or `lib/utils.ts`, review each change and revert anything unrelated to the accordion. Confirm the new Radix version resolves alongside the existing `@radix-ui/react-tooltip ^1.2.8`.

- [ ] **Step 3: Swap keyframes for an interruptible transition**

shadcn ships `accordion-up` / `accordion-down` `@keyframes` driven by `--radix-accordion-content-height`. Keyframes restart from zero, so a rapidly toggled accordion stutters. In `components/ui/accordion.tsx`, replace the `AccordionContent` animation classes:

```tsx
// Deviation from shadcn's generated output, deliberate:
// keyframes restart from zero and cannot be interrupted, so a rapidly
// toggled accordion stutters. A transition on the Radix height variable
// retargets from the current position instead. Keep this on regeneration.
<AccordionPrimitive.Content
  ref={ref}
  className="overflow-hidden text-sm transition-[height] duration-[var(--duration-med)] ease-[--ease-out]"
  style={{ height: "var(--radix-accordion-content-height)" }}
  {...props}
>
```

Then remove the `accordion-up` / `accordion-down` entries from `keyframes` and `animation` in `tailwind.config.ts` if the generator added them.

- [ ] **Step 4: Retokenize the generated styles**

Map shadcn's raw defaults onto this repo's tokens: `border-b border-border` on the item, `text-base` on the trigger, `text-sm text-muted-foreground` on the content, `text-subtle` on the chevron. The chevron rotation is already a `transform`, so leave it. Add `active:scale-[0.99]` on the trigger for press feedback, consistent with every other pressable in the app.

- [ ] **Step 5: Rewrite the FAQ to use it**

In `components/Faq.tsx`, keep the `faqs` array and the `faqLd` script exactly as they are. Replace the markup:

```tsx
<Accordion type="single" collapsible defaultValue="faq-0" className="overflow-hidden rounded-2xl border border-border">
  {faqs.map((f, i) => (
    <AccordionItem key={f.q} value={`faq-${i}`} className="border-b border-border px-5 last:border-b-0">
      <AccordionTrigger className="py-4 text-left text-base font-medium text-foreground">
        {f.q}
      </AccordionTrigger>
      <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
        {f.a}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

`defaultValue="faq-0"` opens "Are you available for new work?" on load. That answer contains the contact address and is the highest-intent copy in the section, so it should not start hidden.

- [ ] **Step 6: Delete the old component**

```bash
git rm components/common/Accordion.tsx
```

- [ ] **Step 7: Verify**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Then `npm run dev` and check the FAQ:
- The first item is open on load.
- Clicking a closed item opens it and closes the previous one.
- **Tab through the section with a closed item.** Focus must skip the collapsed content entirely. This is the defect that motivated the swap.
- Arrow keys move between triggers.
- Toggle one item rapidly. It should retarget smoothly rather than restarting.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix(a11y): FAQ accordion moves to shadcn/Radix

The hand-rolled component had four defects: collapsed content stayed in the
tab order and a11y tree (grid-template-rows 0fr hides it visually only),
the panel lacked role=region and aria-labelledby, the trigger was not
wrapped in a heading, and there was no arrow-key navigation.

Two deliberate deviations from shadcn's output, both commented in the file:
drive the collapse with a transition on --radix-accordion-content-height
rather than the shipped keyframes (which restart from zero), and retokenize
onto the Paper palette. First item opens by default since that answer
carries the contact address."
```

---

## Task 11: Restyle the Experience section

**Files:**
- Modify: `components/ExperienceWork.tsx`

**Interfaces:**
- Consumes: Tasks 4, 6, 7.
- Produces: no new exports. `ExperienceWork` keeps its current props (none) and content.

Restyle only. No new fields on `TOrganization`, no copy changes.

- [ ] **Step 1: Delete the timeline rail, nodes, and mask**

Three coupled magic numbers: the rail at `left-[7px]` inside a `pl-8` wrapper, nodes at `-left-8`, and a mask at `-left-[25px]` painting `bg-background` over the rail so it does not trail past the last entry.

The mask is a latent bug in this revamp specifically: it assumes the rail sits directly on the page background, which Task 6 changed. And `-left-[25px]` has no derivable relationship to the other two values.

Remove:
- the `<span className="absolute left-[7px] top-2 bottom-2 w-px bg-border-strong" aria-hidden />` rail,
- the `isLast && <span ... bg-background />` mask block and the now-unused `isLast` const,
- the `<span className="absolute -left-8 top-1 ... rounded-full border-2" >` node block,
- the `pl-8` from the wrapping `<div className="relative pl-8">`, which becomes `<div>`.

Dropping `pl-8` realigns the section with every other `width="reading"` section instead of being indented by a rail that no longer exists.

- [ ] **Step 2: Apply the retokenizing table**

| Before | After |
|---|---|
| `font-serif text-lg` on the org name | `text-lg font-semibold` |
| `text-[13.5px]` on highlights | `text-sm` |
| `text-[10px]` on the Featured-projects label | `text-2xs` |
| `tracking-[0.12em]` on that label | `tracking-label` |
| `text-[9px]` on the Currently-building badge | `text-2xs` |
| `text-accent-hover` on the role | `text-muted-foreground` |
| `bg-accent/60` on highlight bullets | `bg-subtle` |
| `group-hover/orglink:text-accent` on the org name | `group-hover/orglink:text-foreground`, base `text-foreground/90` |
| `group-hover/orglink:ring-accent/50` on the logo | `group-hover/orglink:ring-border-strong` |
| `hover:text-accent` on the View-all link | `hover:text-foreground` |

Steps 1 and 2 may already be partly done by Task 5's scripted sweep and Task 7's accent sweep. Verify each row rather than assuming.

Keep the `emerald-500` current-role indicators. That is a semantic status color, consistent with the availability dot.

- [ ] **Step 3: Verify**

```bash
npm run build && npm run lint && npm run dev
```

Check the Experience section in both themes: no rail or dots, no leftover indentation, the section's left edge aligns with About and Projects above and below it, org names render in DM Sans semibold, and the current role still shows its green indicator.

- [ ] **Step 4: Commit**

```bash
git add components/ExperienceWork.tsx
git commit -m "refactor(experience): drop the timeline rail, retokenize

The rail used three coupled magic numbers (rail at left-[7px] in a pl-8
wrapper, nodes at -left-8, last item masked by a bg-background strip at
-left-[25px]). The mask painted the page background over the rail, so it
only worked while the rail sat on that exact background, which the palette
change breaks. The duration column already conveys sequence.

Dropping pl-8 realigns the section with every other reading-width section.
Content is unchanged: no new fields, no copy edits. emerald-500 status
indicators stay."
```

---

## Task 12: Install Emil's skills

**Files:**
- Create: `.claude/skills/emil-design-eng/SKILL.md`, `.claude/skills/animate/{SKILL.md,RECIPES.md}`, `.claude/skills/review-animations/{SKILL.md,STANDARDS.md}`, `.claude/skills/improve-animations/{SKILL.md,AUDIT.md,PLAN-TEMPLATE.md}`, `.claude/skills/find-animation-opportunities/SKILL.md`, `.claude/skills/apple-design/SKILL.md`, `.claude/skills/pick-ui-library/SKILL.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `.claude/skills/` holds `design-system` plus seven Emil skills. `transitions-dev` is already gone from Task 2.

- [ ] **Step 1: Install from the upstream repo**

```bash
npx skills@latest add emilkowalski/skills
```

If that pulls all ten, delete the four the spec excludes: `ask-sonner` (no toasts in this repo), `prototype` (multi-version switcher, not needed), `animation-vocabulary` (teaches humans to prompt, redundant given the others). Keep `pick-ui-library`, which the accordion decision proved relevant.

- [ ] **Step 2: Confirm the refresh replaced the stale vendored copy**

The old vendored `emil-design-eng` predated an upstream rename. Confirm the new copy references Base UI rather than Radix in its `transform-origin` guidance:

```bash
grep -n "transform-origin" .claude/skills/emil-design-eng/SKILL.md
```

Expected: `var(--transform-origin)`, not `var(--radix-popover-content-transform-origin)`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills
git commit -m "chore(skills): install Emil Kowalski's animation skills

Replaces the vendored transitions-dev (deleted in Task 2), which duplicated
~40 cubic-beziers already in lib/motionVariants.ts and competed with it as
a source of truth. One coherent source instead.

Installed: emil-design-eng (refreshed, the vendored copy predated an
upstream rename), animate, review-animations, improve-animations,
find-animation-opportunities, apple-design, pick-ui-library.

Skipped: ask-sonner (no toasts), prototype, animation-vocabulary."
```

---

## Task 13: Update the docs and agent memory

**Files:**
- Modify: `CLAUDE.md`, `data/agent-memory.md`, `docs/design-system.md`

**Interfaces:**
- Consumes: every prior task.
- Produces: docs consistent with the shipped code.

`CLAUDE.md` mandates that `data/agent-memory.md` be updated in the same change as any portfolio fact change. This work changes the font stack and removes routes, so this task is required.

- [ ] **Step 1: Update CLAUDE.md**

- Remove the `transitions-dev` sentence from the motion-tokens convention bullet, and update the literal-easing example from `[0.22, 1, 0.36, 1]` to `[0.23, 1, 0.32, 1]`.
- Remove `/motion`, `/design`, and `/skills` from "Useful entry points", including the "Motion system" and "Skills index" lines.
- Update the homepage-composition line: it lists `<About>` through `<Socials>` and should no longer imply dividers between them.
- Add a bullet recording the type scale: sizes come from `tailwind.config.ts` (`text-2xs` through `text-4xl`), tracking from `tracking-label`/`tight`/`tighter`, and arbitrary `text-[Npx]` is forbidden.
- Add a bullet noting `scripts/verify-simplification.sh` as the mechanical gate.

- [ ] **Step 2: Update data/agent-memory.md**

- **Tech stack:** replace Inter, Fraunces, and JetBrains Mono with DM Sans and IBM Plex Mono.
- Remove any sentence offering `/motion`, `/design`, or `/skills` as somewhere a visitor can go, so Truffy stops advertising 404s.
- Do not touch roles, stats, projects, brands, or contact. None changed.
- No em-dashes.

- [ ] **Step 3: Update docs/design-system.md**

The `/design` route is gone but this file survives as the reference. Update its color table to the Paper values and its type section to DM Sans + IBM Plex Mono plus the new scale. If it references `/design` as a live page, remove that.

- [ ] **Step 4: Verify**

```bash
grep -rn "Fraunces\|JetBrains\|/motion\|/design\|/skills\|transitions-dev" CLAUDE.md data/agent-memory.md docs/design-system.md
```

Expected: no hits, other than prose that legitimately discusses the removal.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md data/agent-memory.md docs/design-system.md
git commit -m "docs: sync CLAUDE.md, agent memory, and design system

Per the agent-memory rule in CLAUDE.md: the font stack changed and three
routes were removed, so Truffy's system prompt needs both or it keeps
telling visitors to visit 404s in Fraunces."
```

---

## Task 14: Add the four motion opportunities that survived the gate

**Files:**
- Modify: `components/ProjectsIndex.tsx`, `components/chat/CodeBlock.tsx`, `components/ChatBot.tsx`, `components/project/ProjectMedia.tsx`, `app/not-found.tsx`

**Interfaces:**
- Consumes: Task 8's tokens (`ease.out`, `duration.fast`) and the CSS vars `--ease-out` / `--duration-fast`.
- Produces: no new exports. No new gate check; these are additive polish that the gate cannot assert, so verification is visual.

Everything here survived Emil's four-question gate (frequency, purpose, speed, function). Six other candidates were rejected and are listed at the end of this task so nobody re-adds them later. All four animate `transform` and `opacity` only, and all are at or under 160ms.

**This task is additive and runs last on purpose.** Every prior task removes motion. Do not let it become a licence to re-animate: if a fifth idea occurs mid-task, it goes through the gate first.

- [ ] **Step 1: Crossfade the projects grid on filter change**

`components/ProjectsIndex.tsx:33-37` swaps the entire grid instantly when `active` changes, so content teleports with no bridge. Purpose: preventing a jarring change. Frequency: occasional.

Container-level crossfade, deliberately **not** a per-card stagger: the user is comparing the grid before and after their own click, and a cascade delays that comparison.

```tsx
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { duration, ease } from "@/lib/motionVariants";
// ...existing imports

// inside the component, replacing the grid div:
<AnimatePresence mode="wait" initial={false}>
  <motion.div
    key={active}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: duration.fast, ease: ease.out }}
    className="grid grid-cols-1 gap-5 md:grid-cols-2"
  >
    {shown.map((p) => (
      <ProjectShowcaseCard key={p.id} project={sideProjectToCard(p)} />
    ))}
  </motion.div>
</AnimatePresence>
```

`mode="wait"` means the outgoing grid finishes before the incoming one starts, so the two never overlap. `initial={false}` means no fade on first paint, only on subsequent filter changes. Opacity-only, so reduced motion needs no branch here.

- [ ] **Step 2: Extract a shared IconSwap component**

Two call sites need the same crossfade (`chat/CodeBlock.tsx:50-58` and `ChatBot.tsx:473-482`), so build it once. Create `components/common/IconSwap.tsx`:

```tsx
import type { ReactNode } from "react";

/**
 * Crossfades between two states in a fixed grid cell so the container never
 * reflows. Used by the copy buttons. Scales from 0.8, never 0: nothing in
 * the real world appears from nothing.
 *
 * `aria-hidden` flips with the state so a screen reader announces only the
 * active label, not both.
 */
export default function IconSwap({
  swapped,
  from,
  to,
  className = "",
}: {
  swapped: boolean;
  from: ReactNode;
  to: ReactNode;
  className?: string;
}) {
  const base =
    "col-start-1 row-start-1 inline-flex items-center gap-1 " +
    "transition-[opacity,transform] duration-[var(--duration-fast)] ease-[--ease-out]";

  return (
    <span className={`inline-grid place-items-center ${className}`}>
      <span
        aria-hidden={swapped}
        className={base}
        style={{ opacity: swapped ? 0 : 1, transform: swapped ? "scale(0.8)" : "scale(1)" }}
      >
        {from}
      </span>
      <span
        aria-hidden={!swapped}
        className={base}
        style={{ opacity: swapped ? 1 : 0, transform: swapped ? "scale(1)" : "scale(0.8)" }}
      >
        {to}
      </span>
    </span>
  );
}
```

Purpose: state indication plus feedback. Frequency: occasional. Both states occupy the same grid cell, so the button keeps a stable width.

- [ ] **Step 3: Use IconSwap at both call sites**

In `components/chat/CodeBlock.tsx`, replace the ternary that swaps the two `<>...</>` fragments:

```tsx
<button
  type="button"
  onClick={onCopy}
  className={cn(
    "rounded px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wide",
    "transition-[color,transform] duration-[var(--duration-fast)] active:scale-[0.97]",
    copied ? "text-foreground" : "text-muted-foreground hover:text-foreground"
  )}
  aria-label="Copy code"
>
  <IconSwap
    swapped={copied}
    from={<><Copy className="h-3 w-3" /> Copy</>}
    to={<><Check className="h-3 w-3" /> Copied</>}
  />
</button>
```

In `components/ChatBot.tsx:473-482`, the same pattern is keyed on `copiedIndex === index`, so pass `swapped={copiedIndex === index}` with that file's existing icons and labels.

`text-accent` becomes `text-foreground` per Task 7.

- [ ] **Step 4: Add press feedback to the filter chips**

`components/ProjectsIndex.tsx:20-30` chips carry `transition-colors` but no `:active`. Purpose: feedback.

```tsx
className={`rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wide
  transition-[color,background-color,border-color,transform]
  duration-[var(--duration-fast)] active:scale-[0.97] ${
  active === f.tag
    ? "border-accent bg-accent text-accent-foreground"
    : "border-border text-muted-foreground hover:text-foreground"
}`}
```

Note the enumerated property list rather than `transition-all`, which check `C05` forbids. `text-[11px]` becomes `text-xs` per Task 5.

- [ ] **Step 5: Add press feedback to the remaining stragglers**

The earlier press-feedback pass covered 22 files and missed these two. Add `active:scale-[0.97]` plus `transition-transform duration-[var(--duration-fast)] ease-[--ease-out]` to the pressable elements in:

- `components/project/ProjectMedia.tsx`
- `app/not-found.tsx`

Check each element is genuinely pressable (has `onClick` or is a link/button) before adding. Do not add it to static containers.

- [ ] **Step 6: Verify**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Expected: all clean, `C05` still PASS (no `transition-all` introduced), `C06` still PASS (no keyframes introduced).

Then `npm run dev` and check:
- `/projects`: click between filters. The grid crossfades rather than hard-cutting, and there is no fade on first load.
- Chat: copy a code block. The icon and label crossfade rather than snapping, and the button does not reflow or jump width.
- Filter chips and the 404 buttons visibly depress on click.
- Enable OS reduced motion: the grid crossfade still works (opacity is safe) while the scale presses stop.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(motion): add the four opportunities that passed the gate

Additive polish, run last so it cannot dilute the removals. All four animate
transform and opacity only, all at or under 160ms, all using existing tokens.

- projects filter swapped the grid instantly; now a 150ms container
  crossfade. Container-level, not per-card stagger: the user is comparing
  before and after their own click, so a cascade would delay that
- copy buttons in CodeBlock and ChatBot hard-cut between Copy and Copied;
  now a stacked crossfade with scale(0.8), never scale(0). aria-hidden
  flips so screen readers announce only the active label
- filter chips had no :active state
- press feedback for ProjectMedia and not-found, missed by the earlier pass

Six candidates were rejected on the gate and are recorded in the plan so
they do not get re-added: palette open/close and nav underlines (frequency),
theme-toggle crossfade (frequency plus it fights every other transition),
section scroll reveals (seen every visit), stat count-up (functional data
the user is reading, above the fold), Experience stagger (just simplified)."
```

- [ ] **Step 8: Record the rejections in CLAUDE.md**

So a future agent does not helpfully re-add them. Append to the motion convention bullet:

> Motion opportunities were audited against `find-animation-opportunities`. These were rejected on the frequency gate and must not be re-added: command palette and shortcuts-overlay open/close, nav link underline slides, theme-toggle colour crossfade, homepage section scroll reveals, stat bento count-up, Experience list stagger.

```bash
git add CLAUDE.md
git commit -m "docs: record the rejected motion candidates so they stay rejected"
```

**Deferred, pending a decision:** `CommandPalette.tsx:53` calls `navigator.clipboard?.writeText()` for the copy-email action and the palette then closes with **no confirmation the copy happened**. That is a real feedback gap on the single thing you most want visitors to copy successfully. The cheap fix is a brief inline `Copied` swap on the row before closing; the correct fix is a toast, which per `pick-ui-library` means adding Sonner as a dependency. Not in this plan because it needs an explicit yes on the dependency.

---

## Task 15: Final verification sweep

**Files:** none modified unless the sweep finds a regression.

**Interfaces:**
- Consumes: everything.
- Produces: a green gate and a completed manual checklist.

- [ ] **Step 1: Run all three automated gates**

```bash
npm run build && npm run lint && ./scripts/verify-simplification.sh
```

Expected: build clean, lint clean, all of `C01`-`C14` PASS.

- [ ] **Step 2: Confirm the deleted routes 404 and /markdown survives**

```bash
npm run build && npm run start &
sleep 5
for p in motion motion/principles design skills; do
  printf '%-20s %s\n' "/$p" "$(curl -s -o /dev/null -w '%{http_code}' localhost:3000/$p)"
done
printf 'markdown negotiation: %s\n' "$(curl -s -H 'Accept: text/markdown' localhost:3000/ | head -c 40)"
```

Expected: all four routes return `404`. The markdown request returns frontmatter, not HTML.

- [ ] **Step 3: Motion budget audit**

```bash
grep -rEn "duration-\[[0-9]+ms\]|duration: [0-9.]+" --include=*.tsx --include=*.ts components app lib
```

Every value must be at or under 300ms except `duration.hero` (500ms) in `app/not-found.tsx`. Anything else over 300ms is a regression.

- [ ] **Step 4: Manual sweep, both themes, desktop and mobile viewport**

- [ ] Homepage: static hero (no cycling), stats bento, Clients row, no dividers between sections, FAQ with the first item open
- [ ] One org page (`/work/shopos`): Experience-style content, no rail
- [ ] One project case study
- [ ] One blog post: syntax colors readable, `h2` sizing correct after the 1.75rem to 1.5rem change
- [ ] `/books` and one book detail page
- [ ] 404 page: sequence still plays, stagger no longer sluggish
- [ ] Cmd+K palette: appears instantly, no panel animation
- [ ] `?` shortcuts overlay: same, and `d`/`m` shortcuts are gone
- [ ] Navbar: no Design link, mobile menu collapses smoothly
- [ ] Clients logo row: first tooltip waits, subsequent ones instant
- [ ] Stats logos: same 150ms delay as the Clients row
- [ ] Chat FAB: opens from near-full scale, closes faster than it opens
- [ ] Footer: no clock
- [ ] Tab through the FAQ with items closed: focus skips collapsed content
- [ ] `/projects`: filter chips depress on click, grid crossfades between filters, no fade on first load
- [ ] Chat: copy a code block, icon crossfades and the button does not change width
- [ ] OS reduced motion on: colors and opacity still transition, nothing slides. The projects crossfade survives (opacity is safe), the scale presses stop

- [ ] **Step 5: Fresh-eyes pass**

Emil: "Review animations with fresh eyes. You notice imperfections the next day that you missed during development." If practical, stop here and re-run step 4 later. At minimum, re-check the hero, the FAQ open/close, and the chat FAB at 4x slowed duration via DevTools before signing off.

- [ ] **Step 6: Commit any fixes and report**

```bash
git add -A
git commit -m "fix: regressions found in the final verification sweep"
```

If the sweep is clean with nothing to commit, say so explicitly rather than creating an empty commit.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| 2. Branch strategy | Global Constraints |
| 3. Part 1: Color | 6 (tokens), 7 (consumers) |
| 4. Part 2: Typography | 4 (config), 5 (migration) |
| 5. Part 3: Motion, delete list | 3 (hero, AnimatedBackground), 9 (keyboard surfaces) |
| 5. Part 3: Motion, findings 1-6 | 8 (1-4, 6), 9 (5) |
| 5. Part 3: Motion, findings 7-12 | 9 (7-9), 8 (10-12) |
| 5. Token cleanup | 8 |
| 6. Part 4: gradient divider | 3 |
| 6. Part 4: FAQ accordion | 10 |
| 6. Part 4: dead components | 3 |
| 6. Part 4: ambient chrome | 3 |
| 6. Part 4: Experience timeline | 11 |
| 6. Part 4: Marker highlight | 8 (step 5) |
| 7. Part 5: Routes | 2 |
| 8. Skills | 12 |
| 9. agent-memory rule | 13 |
| 10. Verification | 1 (gate), 15 (sweep) |

No gaps.

**Beyond the spec:** Task 14 adds four motion opportunities that were not in the original spec. They come from a `find-animation-opportunities` sweep run after the spec was written, and each survived Emil's four-question gate. This is a deliberate scope addition, approved before it was planned, and it is sequenced last so it cannot dilute the removals that make up the rest of the work. Six rejected candidates are recorded in Task 14 and in `CLAUDE.md` so they stay rejected.

`components/ui/CardNav/` (186 lines, 3 files, zero importers) was also found after the spec was written and is folded into Task 3 as a seventh dead component.

**Placeholder scan:** No TBD, TODO, or "similar to Task N". Every code step carries actual code. The one intentionally open item is Task 7 step 3, which gives categorical rules rather than a file-by-file list; that is correct here because the 159 accent sites are individually trivial but collectively too long to enumerate, and step 1 generates the list at execution time.

**Type consistency:** `ease.out`, `duration.slow`, `stagger.loose`, `spring.hoverIn`, `hoverZoom`, `hoverLiftRotate`, `tapPress`, `fabPopVariants`, `chatWindowVariants` are all defined in Task 8 and referenced consistently in 9 and 11. `keyboardSurfaceVariants` and `collapseHeightVariants` are deleted in Task 9, after Task 8 leaves them in place. `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` are produced in Task 10 and used only there. Gate check IDs `C01`-`C14` are defined in Task 1 and referenced by matching ID throughout.

**Ordering:** deletions (2, 3) precede retokenizing (4-8) so later sweeps touch less code. Task 4 must precede Task 5, since the migration needs the scale classes to exist. Task 6 must precede Task 7, since the accent regressions only appear once the token changes. Task 8 must precede Task 9, which deletes two variants Task 8 still references.
