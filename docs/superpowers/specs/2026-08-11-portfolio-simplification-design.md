# Portfolio Simplification: Color, Type, Motion, Routes

**Date:** 2026-08-11
**Status:** Approved (pending spec review)
**Branch strategy:** new branch off `feat/global-shortcuts-and-palette-fixes` HEAD, deleting forward

---

## 1. Goal

Make the site sell. Every decision below is judged against one question: does this help a hiring manager or prospective client decide to contact Shashwat?

The current site loses on two counts. It looks unpolished (incoherent typography, a violet palette that reads as hobbyist), and it spends its surface area on inward-facing engineering showcases instead of on proof of shipped work.

Three concrete outcomes:

1. **A calmer, more professional surface.** Neutral warm palette, one coherent type scale, no decorative motion.
2. **A smaller site that points at the work.** Delete the showcase routes. Navbar and command palette point at work, writing, and contact.
3. **Motion that reads as craft rather than noise.** Fewer animations, all of them under Emil Kowalski's duration and easing rules.

### Non-goals

- No layout, spacing, or information-architecture changes. Structure stays as-is.
- No copy rewrites beyond the hero headline (forced by removing the word cycle).
- No changes to `/blogs`, `/books`, `/work`, `/project`, `/projects`, `/rss`, `/og`, `/api`.
- No new features. This is subtraction plus retokenization.

---

## 2. Branch strategy

Work on a new branch cut from current HEAD, not from `master`.

Rationale: `master` already contains `/design`, `/skills`, and `/markdown`, so it does not remove the routes we want gone. Meanwhile `master` lacks ten commits of wanted work:

| Missing from master | Evidence |
|---|---|
| `transition-all` cleanup | Master has it in 8 files; this branch has zero |
| `hoverOnlyWhenSupported` | Absent from master's `tailwind.config.ts`. Without it, touch devices fire false hovers on tap |
| Press feedback on pressables | Master: 4 files. This branch: 22 |
| The `?` shortcuts overlay | `components/KeyboardShortcuts.tsx` and `lib/shortcutsData.ts` do not exist on master |
| Motion token CSS vars | Master has 2 of the 11 |
| The `grid-rows` collapse technique | Lives in `components/common/Accordion.tsx`, branch-only. That file is replaced by shadcn's accordion in Part 4, but the technique moves to `Navbar.tsx` first |

What master *would* give free: `/motion`, `/motion/principles`, all 24 `components/motion` demos, `transitions-dev`, and `useHeadingCycle` are all branch-only.

That trade is bad. Resetting to `master` would hand back 8 files of `transition-all` and 18 unpressable buttons to re-fix, in exchange for saving a single `git rm -r`. Delete forward instead.

---

## 3. Part 1: Color (Paper palette)

Replace the "Graphite + Indigo" palette in `app/globals.css`. Two changes at once: drop the indigo accent, and desaturate the neutral ramp, which currently carries a `240` hue on every gray.

The new ramp is near-neutral with a faint warm cast (hue 30 to 40 at 5 to 20 percent saturation). It reads as black and white without feeling clinical.

**No accent hue.** `--accent` becomes the foreground color. Emphasis comes from weight and contrast. Links get underlines rather than color. Two hues survive, both semantic, neither decorative: `--destructive` (red) and the availability dot (green).

### Light

```
--background:        40 33% 98.5%
--foreground:        35 9% 11%
--card:              0 0% 100%
--card-foreground:   35 9% 11%
--popover:           0 0% 100%
--popover-foreground:35 9% 11%
--elevated:          38 20% 95.5%
--primary:           35 9% 11%
--primary-foreground:40 33% 99%
--secondary:         38 20% 95.5%
--secondary-foreground: 35 9% 11%
--muted:             38 20% 95.5%
--muted-foreground:  35 7% 39%
--subtle:             35 6% 44%
--accent:            35 9% 11%
--accent-foreground: 40 33% 99%
--accent-hover:      35 9% 22%
--destructive:       0 65% 48%
--destructive-foreground: 0 0% 100%
--border:            36 16% 89.5%
--border-strong:     36 14% 81%
--input:             36 16% 89.5%
--ring:              35 9% 30%
--marker:            38 75% 55% / 0.16
```

### Dark

```
--background:        30 7% 5%
--foreground:        35 6% 94%
--card:              30 7% 8.5%
--card-foreground:   35 6% 94%
--popover:           30 7% 12%
--popover-foreground:35 6% 94%
--elevated:          30 7% 12%
--primary:           35 6% 94%
--primary-foreground:30 7% 6%
--secondary:         30 6% 15%
--secondary-foreground: 35 6% 86%
--muted:             30 6% 15%
--muted-foreground:  35 6% 63%
--subtle:             30 5% 50%
--accent:            35 8% 94%
--accent-foreground: 30 7% 6%
--accent-hover:      35 8% 84%
--destructive:       0 60% 55%
--destructive-foreground: 0 0% 100%
--border:            30 6% 16%
--border-strong:     30 6% 24%
--input:             30 6% 16%
--ring:              35 6% 70%
--marker:            38 60% 70% / 0.16
```

### Syntax highlighting (`--sh-*`)

Currently indigo-tinted. Retune to a warm-neutral scheme with restrained hue, so blog code blocks stay readable without reintroducing an interface accent. Code blocks are the one place color earns its keep.

```
Light: --sh-keyword 25 55% 38% | --sh-string 150 35% 32% | --sh-class 35 45% 34%
       --sh-identifier 35 8% 22% | --sh-sign 35 5% 45% | --sh-comment 35 5% 55%
       --sh-jsxliterals 25 45% 40%
Dark:  --sh-keyword 30 70% 72% | --sh-string 150 32% 62% | --sh-class 38 55% 70%
       --sh-identifier 35 6% 84% | --sh-sign 35 5% 55% | --sh-comment 35 5% 50%
       --sh-jsxliterals 30 55% 68%
```

### Follow-on work

- **Scrollbar** (`globals.css` lines 99 to 124) is accent-tinted. Move to `--border-strong` and `--subtle`.
- **`--accent` consumers: 159 sites.** Most resolve correctly once `--accent` equals foreground, but each needs a read. Specific cases needing real decisions:
  - `About.tsx` verified-check badge: `bg-accent text-white`. Becomes `bg-foreground text-background`.
  - `Clients.tsx` logo row `hover:outline-accent`. Becomes `hover:outline-border-strong`.
  - `.prose a` `decoration-accent/50 hover:decoration-accent`. Becomes `decoration-subtle hover:decoration-foreground`.
  - `app/motion/page.tsx` and `app/design/page.tsx` accent links: moot, both deleted.
- **`lib/markerHighlight.tsx`** (`withMarker`, `fullMarker`) and `components/common/Marker.tsx` need the new `--marker` wash.
- **OG images** (`app/og/`) hardcode palette values. Retune to match.

---

## 4. Part 2: Typography

### Families

| Role | From | To | Loader |
|---|---|---|---|
| Sans (body + headings) | Inter | **DM Sans** | `next/font/google`, variable, omit `weight` |
| Mono (labels + code) | JetBrains Mono | **IBM Plex Mono** | `next/font/google`, `weight: ["400","500"]` |
| Serif (display) | Fraunces | **removed** | n/a |

In `app/layout.tsx`, replace all three loaders. CSS variables collapse from `--font-inter` / `--font-fraunces` / `--font-mono` to `--font-sans` and `--font-mono`.

DM Sans is a variable font on Google Fonts. Do not pass `weight`; let `next/font` serve the variable axis. IBM Plex Mono is static and needs explicit weights. Verify both at build.

### Removing the serif

- `app/globals.css` `h1..h6` currently sets `font-family: var(--font-fraunces)`. Change to `--font-sans`, `font-weight: 600`, `letter-spacing: -0.02em`.
- **34 `font-serif` usages** must be removed, not remapped. After they are gone, delete the `serif` key from `tailwind.config.ts`. Leaving the key while removing the font would silently fall back to Georgia.
- `HeroTitle.tsx`'s `H1_CLASS` uses `font-serif` plus an italic accent span. That file is deleted anyway (see Part 3).

### The type scale

`tailwind.config.ts` has **no `fontSize` and no `letterSpacing` scale**. That absence is the root cause of the unpolished feel: 132 arbitrary `text-[Npx]` values across 14 distinct sizes, including `text-[13.5px]` and `text-[12.5px]`, plus three competing trackings (`0.12em`, `0.14em`, `0.16em`) all styling the same uppercase mono label.

Add both scales. This overrides Tailwind's defaults for `xs` through `4xl`, which is intentional: a tuned scale is the point.

```ts
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
  label:   '0.1em',    // the single uppercase-mono tracking
  normal:  '0',
  tight:   '-0.02em',
  tighter: '-0.03em',
},
```

**Migration mapping** for the 132 arbitrary values:

| From | To |
|---|---|
| `text-[8px]`, `text-[9px]`, `text-[10px]` (59 uses) | `text-2xs` |
| `text-[11px]` (33 uses) | `text-xs` |
| `text-[12px]`, `text-[12.5px]`, `text-[13px]`, `text-[13.5px]` (22 uses) | `text-sm` |
| `text-[14px]`, `text-[15px]`, `text-[16px]` (15 uses) | `text-base` |
| `text-[17px]`, `text-[18px]` (2 uses) | `text-lg` |
| `text-[22px]` (1 use) | `text-2xl` |
| `tracking-[0.12em]`, `tracking-[0.14em]`, `tracking-[0.16em]` (33 uses) | `tracking-label` |

Collapses 14 sizes to 9 named steps and 3 trackings to 1.

---

## 5. Part 3: Motion

Audited against the `emil-design-eng`, `review-animations`, and `improve-animations` skills from `emilkowalski/skills`.

### Delete

| What | Files | Why |
|---|---|---|
| `/motion` showcase surface | `app/motion/` (2), `components/motion/` (24) | Pure showcase. Verified self-contained: nothing outside `app/motion` imports any of it |
| Hero word cycle | `components/HeroTitle.tsx`, `lib/useHeadingCycle.ts`, `wordCycle` token | Infinite loop on the highest-traffic element, communicating nothing |
| `AnimatedBackground` | `components/AnimatedBackground.tsx` (105 lines) + its `layout.tsx` dynamic import | Ambient decorative motion at `duration.ambient = 2s`, on every route |
| Keyboard surface transitions | `keyboardSurfaceVariants` in `CommandPalette.tsx`, `KeyboardShortcuts.tsx` | Emil's hard rule: keyboard-initiated, 100+/day, no animation ever. Render instantly |

**Hero replacement.** Freeze on the phrase already hardcoded in `HeroTitle.tsx`'s reduced-motion branch:

> I build interfaces that **ship and scale** to millions.

`ship and scale` becomes weight-600 sans in `--foreground`, not an italic colored span. Emphasis from weight. This also deletes the invisible widest-phrase sizer spans.

**Deliberately kept:** `chatDotPulse` (loading state, legitimate state indication) and the FAQ accordion, which moves to shadcn/Radix in Part 4. Disclosure is state indication, which is a valid purpose for motion.

### Fix

| # | Finding | Change |
|---|---|---|
| 1 | `duration.slow = 0.4` backs the four most-used entrance variants (25 usages) | **0.24**. Emil's budget is under 300ms for UI |
| 2 | Three near-identical expo curves: `ease.out [0.22,1,0.36,1]`, `ease.modal [0.23,1,0.32,1]`, `ease.expo [0.16,1,0.3,1]`, plus `--ease-spring` and `--ease-expo` in CSS | Collapse to **one** `ease.out = [0.23, 1, 0.32, 1]` and one `--ease-out`. Keep `--ease-in-out` for on-screen movement only |
| 3 | `tapPress` 0.94, `hoverZoom` 1.08, `hoverLiftRotate` 1.06 + rotate -3 | **0.97**, **1.02**, and drop the rotate. Emil: press feedback 0.95 to 0.98 |
| 4 | `fabPopVariants` starts `scale: 0.5, rotate: -12` | **`scale: 0.96`**, no rotate. Nothing appears from nothing |
| 5 | `collapseHeightVariants` animates `height` (Navbar mobile menu) | Apply the `grid-rows: 0fr -> 1fr` technique inline in `Navbar.tsx`, carried over from the old `Accordion.tsx` before that file is replaced. Note this is still a layout animation, not a transform one. It is the least-bad option for an unknown-height collapse without JS measurement, and the Navbar menu is opened rarely enough to be within budget |
| 6 | Reduced motion nukes everything to `0.01ms !important` | Keep opacity and color transitions, drop transform-based movement only. Reduced motion means gentler, not zero |
| 7 | `components/ui/tooltip.tsx` animates via `tailwindcss-animate`'s opaque `animate-in fade-in-0 zoom-in-95` utilities, with the duration and easing baked into the plugin rather than read from our tokens | Replace with named `tooltip-in` / `tooltip-out` keyframes in `tailwind.config.ts` bound to `var(--duration-fast)` and `var(--ease-out)`, and cover `data-[state=instant-open]` too. **Keep it animation-driven, do not use a CSS transition:** Radix `Presence` detects exit only via `animationName` and `animation*` events, with no `transitionend` handling, so a transition-based tooltip unmounts before the closed state paints and pops in on open. Emil's transitions-over-keyframes rule targets elements that get re-targeted mid-animation, like stacking toasts; Radix mounts a separate tooltip per trigger and never re-targets, so it does not apply here |
| 8 | No `skipDelayDuration` on `TooltipProvider` | `skipDelayDuration={0}`. Emil: once one tooltip is open, adjacent ones open instantly. A row of adjacent logos is the canonical case. Radix has no `data-instant` equivalent, so the delay skips but a 125ms fade remains. Documented as a partial fix; base-ui would do it fully |
| 9 | Two `TooltipProvider`s: one in `app/layout.tsx`, another in `About.tsx` with `delayDuration={150}` wrapping only the Clients row | Single provider in `layout.tsx` with explicit `delayDuration` and `skipDelayDuration`. Today the stats logos fall through to Radix's 700ms default while the Clients logos use 150ms, so two logo groups on the same page have different hover feel |
| 10 | `chatWindowVariants` uses `spring.soft` for both enter and exit | Exit gets a fast duration-based transition. Every other variant in the file already exits faster than it enters; this is the outlier |
| 11 | `stagger.section = 0.2` (200ms), used by the 404 page | `stagger.base` (0.06), or drop the token. Emil's range is 30 to 80ms; 200ms is 2.5x the ceiling |
| 12 | Hover and color transitions use `ease-[--ease-out]` | `ease`. Emil's easing decision tree routes hover and color changes to `ease`, reserving `ease-out` for enter and exit |

### Already correct, do not change

Verified against the skill, so these need no work and should not be "fixed" during implementation:

- `components/ui/tooltip.tsx` already sets `origin-[--radix-tooltip-content-transform-origin]`, so tooltips are genuinely origin-aware.
- The `--ease-out` target in finding 2 is Emil's exact published value, `cubic-bezier(0.23, 1, 0.32, 1)`.
- `stagger.tight` / `base` / `loose` (40, 60, 80ms) all sit inside the 30 to 80ms range.
- `hoverOnlyWhenSupported` is already enabled in `tailwind.config.ts`.
- `transition-all` is already at zero occurrences and must stay there.

### Cohesion

Emil: "A professional dashboard should be crisp and fast. Match the motion to the mood." A portfolio built to convert has the same personality, so the 240ms entrance, the single strong ease-out, and the no-accent palette reinforce each other rather than fighting. No component should end up bouncier than the rest; `spring.hoverIn` on the chat FAB is the only spring left and should stay subtle.

### Token cleanup

Verified orphaned once the deletions land, so remove from `lib/motionVariants.ts`: `ease.expo`, `ease.modal`, `spring.soft`, `spring.pop`, `duration.ambient`, `wordCycle`.

Surviving non-obvious consumers, confirmed by grep, so do not remove these: `spring.hoverIn`, `hoverLiftRotate`, `hoverZoom`, `fabPopVariants` (all `ChatBot.tsx`), `duration.draw` (`common/Marker.tsx`), `duration.hero` (`app/not-found.tsx`), `collapseHeightVariants` (`Navbar.tsx`).

`lib/motionVariants.ts` goes from 177 lines to roughly 70. Keep it and `globals.css` in sync per the existing repo convention.

---

## 6. Part 4: Strip decorative UI

Everything here is subtraction. The test applied to each item: does a visitor deciding whether to email Shashwat benefit from this?

### The gradient divider

`components/layout/Divider.tsx` renders `bg-gradient-to-r from-transparent via-border-strong to-transparent`. A fading gradient rule, repeated **7 times between the homepage's 8 sections**, plus 3 uses on `work/[org]` and 1 on `books/[slug]`.

**Delete the component and all 11 usages.** The gradient is the conspicuous part, but even a flat rule is redundant here: every `Section` already opens with a number and label header (for example `06 / FAQ / Questions, answered`). A labeled header plus vertical rhythm is how section separation is done on a professional site. Two rules stacked on top of each other is noise.

If a boundary reads as weak after the manual sweep, add `border-t border-border` to the `Section` primitive itself rather than reintroducing a standalone element.

### The FAQ accordion

**The accordion stays.** Replace the hand-rolled `components/common/Accordion.tsx` with shadcn's accordion, which wraps `@radix-ui/react-accordion`.

shadcn is already configured in this repo (`components.json`, style `new-york`, `baseColor: neutral`, aliases pointing at `@/components/ui`), and Radix is already a dependency via `@radix-ui/react-tooltip`. So this is one command with no new primitive library:

```bash
npx shadcn@latest add accordion
```

**Why replace rather than keep.** The hand-rolled component has four genuine defects:

| # | Defect | Impact |
|---|---|---|
| 1 | Collapsed content stays in the tab order and the accessibility tree. `grid-template-rows: 0fr` plus `overflow-hidden` hides it visually only | Screen readers announce collapsed answers. Focusable children inside collapsed panels remain tabbable. The FAQ answers contain email addresses that should be links, which would make this an active keyboard-navigation bug |
| 2 | Panel has `id` and is referenced by `aria-controls`, but lacks `role="region"` and `aria-labelledby` | Incomplete WAI-ARIA accordion pattern |
| 3 | Trigger is a bare `<button>`, not wrapped in a heading | The ARIA pattern wants a heading around each trigger so screen reader users can navigate the FAQ by heading, which matters for an FAQ specifically |
| 4 | No arrow-key navigation between items | Up, Down, Home, End between headers. Radix provides this |

Radix fixes all four.

**Library choice, for the record.** Emil's `pick-ui-library` skill names [base-ui](https://base-ui.com) for unstyled accessible primitives, not Radix. But the same skill says to check what is installed first and not to churn a competitor dependency without being asked. This repo is already on Radix via the tooltip, and shadcn is already wired. Introducing base-ui alongside Radix for a single accordion would mean maintaining two primitive libraries. Radix is the correct call here. If the repo ever migrates primitives wholesale, base-ui is the documented target.

**Two adjustments to shadcn's default output:**

1. **Use a transition, not keyframes.** shadcn ships `accordion-up` / `accordion-down` `@keyframes` driven by `--radix-accordion-content-height`. Keyframes restart from zero and cannot be interrupted, so a rapidly toggled accordion stutters. Replace with `transition: height var(--duration-med) var(--ease-out)` on the content, reading the same Radix variable. Accordions do get toggled repeatedly, so interruptibility is worth having here.
2. **Retokenize the styling.** shadcn's defaults use raw Tailwind classes. Map them onto the tokens: `border-b border-border`, `text-base` for the trigger, `text-sm text-muted-foreground` for the content, and `text-subtle` for the chevron. The chevron rotation is already a `transform`, so it needs no change.

The FAQ copy itself is unchanged, and `faqLd` structured data stays. Note that the answers are the highest-intent copy on the site (two of the five contain the contact address), so keep `type="single"` `collapsible` rather than defaulting every panel closed with no way to see them, and consider `defaultValue` on the availability question so the most important answer is visible on load.

### Dead and orphaned components

Verified by grep. Delete all five, 270 lines:

| File | Lines | Status |
|---|---|---|
| `components/common/Marquee.tsx` | 68 | No consumers. Infinite scroll animation |
| `components/CurrentState.tsx` | 84 | No consumers |
| `components/NFT.tsx` | 53 | Only consumer is `CurrentState.tsx`, also dead |
| `components/AvatarWithThemeSwitch.tsx` | 37 | No consumers |
| `components/layout/Reveal.tsx` | 28 | Only consumer is `app/design/page.tsx`, which is deleted |
| `components/WorkListItem.tsx` | 109 | No consumers. `ExperienceWork.tsx` renders its own inline timeline and never imports it |

### The Clients section scroll reveal

`components/Clients.tsx:27-32` wraps the entire section in `whileInView` with a staggered card cascade (`listVariants` + `cardVariants`). Remove it, along with the orphaned variants and the `motion` import, converting each `motion.a` back to a plain anchor.

Same reasoning as the rejected-candidates list: the Clients row is homepage content seen on every visit, so a scroll reveal fails the frequency gate. It is also the last `whileInView` in the codebase, which is what gate check `C08` asserts.

### Ambient chrome

| What | Decision |
|---|---|
| `components/BottomFadeMask.tsx` (39 lines, mounted in `layout.tsx`) | **Delete.** A decorative gradient overlay on every route |
| `components/CurrentTime.tsx` (28 lines, in `Footer.tsx`) | **Delete.** A live clock on `setInterval(1000)` that re-renders forever on every page. Personal-site flourish, and a standing render cost |

### The Experience section timeline

`components/ExperienceWork.tsx` draws a vertical timeline using three coupled magic numbers:

- the rail at `left-[7px]` inside a `pl-8` wrapper,
- the nodes at `-left-8`,
- and for the last item only, a mask: `<span className="absolute -left-[25px] top-3 bottom-0 w-px bg-background" />`, a background-colored strip painted over the rail so it does not trail off past the final entry.

**Delete the rail, the nodes, and the mask.** Three reasons:

1. The mask is a latent bug in this specific revamp. It paints `bg-background` over the rail, so it only works while the rail sits directly on the page background. Any card, panel, or background change behind it exposes a rail fragment. Part 1 changes the background.
2. `-left-[25px]` has no derivable relationship to `left-[7px]` or `pl-8`. It is a hand-tuned pixel value that breaks if any of the other two change.
3. The right-aligned duration column already conveys sequence. The rail, nodes, and mask are chrome restating what the dates say.

Removing them also drops the `pl-8` wrapper offset, so the section aligns with every other `width="reading"` section on the page instead of being indented by a rail that no longer exists.

**Scope: restyle only, no data changes.** The section keeps its current content exactly: org logo and name, duration, role, employment tag, the "Currently building" badge, org links, the top two highlights, the deep-dive CTA, and the featured project cards. No new fields on `TOrganization`, no new copy.

Retokenizing needed in this file:

| Before | After |
|---|---|
| `font-serif text-lg` on the org name | `text-lg font-semibold` (serif is removed in Part 2) |
| `text-[13.5px]` on highlights | `text-sm` |
| `tracking-[0.12em]` on the Featured-projects label | `tracking-label` |
| `text-[10px]` on that label | `text-2xs` |
| `text-[9px]` on the Currently-building badge | `text-2xs` |
| `text-accent-hover` on the role | `text-muted-foreground` |
| `bg-accent/60` on highlight bullets | `bg-subtle` |
| `group-hover/orglink:text-accent` on the org name | `group-hover/orglink:text-foreground` with the base at `text-foreground/90` |
| `group-hover/orglink:ring-accent/50` on the logo | `group-hover/orglink:ring-border-strong` |
| `hover:text-accent` on the View-all link | `hover:text-foreground` |

The `emerald-500` current-role indicators stay. That is a semantic status color, consistent with the availability dot in Part 1.

### The Marker highlight

Keep, with the animation removed. After the route deletions its only real consumers are `components/About.tsx` (the email address in the lede) and `components/common/DiaryEntry.tsx`.

The static highlight wash **stays** and is worth keeping: it draws the eye to `contact@shashwa7.in`, which directly serves the goal. The 700ms `duration.draw` draw-on animation **goes**. Static wash, zero motion. This orphans `duration.draw`, so remove that token too.

---

## 7. Part 5: Routes

### Delete

| Route | Files | Reason |
|---|---|---|
| `/motion`, `/motion/principles` | `app/motion/` + `components/motion/` (26 files, 1,467 lines) | Component and animation showcase. Consumed 18 of the last 28 commits and sells nothing |
| `/design` | `app/design/page.tsx` (736 lines) | Documents a token system rather than showing work. Inward-facing, and currently contradicted by the 132 arbitrary type values it claims not to have. `docs/design-system.md` and the `design-system` skill remain in-repo for building |
| `/skills` | `app/skills/page.tsx`, `app/skills/[slug]/page.tsx`, `app/skills/[slug]/markdown/route.ts`, `lib/skillsData.ts` (256 lines) | About tooling, not work. Drops to a one-item index once `transitions-dev` is removed |

### Keep

`/markdown` plus the `middleware.ts` content negotiation. Invisible to human visitors, 102 lines, and it makes the site legible to AI crawlers and to the Truffy assistant. Real capability, not showcase.

`/books` stays. Personal-interest surface that supports the human read of the site, and it is cheap.

### Unhook

| File | Change |
|---|---|
| `components/Navbar.tsx:15` | Remove `{ label: "Design", href: "/design" }` |
| `lib/commandData.ts:17-19` | Remove `nav-design`, `nav-motion`, `nav-principles` |
| `lib/shortcutsData.ts:14-15` | Remove `d` (Design) and `m` (Motion) |
| `app/sitemap.ts:24,28` | Remove both `motion` entries |
| `middleware.ts` | Remove `skillRoute` regex, its rewrite branch, and `/skills/:path*` from the matcher |
| `public/.well-known/llms.txt` | Remove lines 30, 43, 44, 45 (skills and design references) |
| `.claude/skills/transitions-dev/` | Delete (29 files, ~3,700 lines). Competing source of truth: ~40 duplicated cubic-beziers overlapping `motionVariants.ts` |
| `CLAUDE.md:51` | Remove the `transitions-dev` mention; update the motion-token convention text |
| `CLAUDE.md` "Useful entry points" | Remove `/motion`, `/design`, `/skills` lines |
| `docs/superpowers/plans/2026-07-24-motion-polish-and-showcase.md` | Delete. Describes routes that no longer exist |

**Total removed: roughly 6,860 lines.** Breakdown: 2,705 route and component code (Part 5), 3,701 vendored `transitions-dev` skill, 455 decorative and dead components (Part 4).

The accordion is not counted as a removal. `components/common/Accordion.tsx` (48 lines) is deleted but replaced by a generated `components/ui/accordion.tsx` of comparable size, so it is a swap that buys correctness rather than a line saving.

---

## 8. Skills

Install from `emilkowalski/skills` into `.claude/skills/`, replacing the `transitions-dev` approach with a single coherent source:

- `emil-design-eng` (refresh the vendored copy; it predates the Base UI rename)
- `improve-animations` plus `AUDIT.md` and `PLAN-TEMPLATE.md`
- `review-animations` plus `STANDARDS.md`
- `animate` plus `RECIPES.md`
- `find-animation-opportunities`
- `apple-design`
- `pick-ui-library` (added after the accordion decision below proved a library choice was in scope after all)

Skipped, with reasons: `ask-sonner` (no toasts in this repo), `prototype` (multi-version switcher, not needed), `animation-vocabulary` (teaches humans to prompt, redundant given the others).

---

## 9. The agent-memory rule

`CLAUDE.md` requires updating `data/agent-memory.md` whenever portfolio facts change. This work changes the tech stack (fonts) and removes routes Truffy may reference.

Required edits to `data/agent-memory.md`:
- **Tech stack:** Inter, Fraunces, JetBrains Mono become DM Sans and IBM Plex Mono.
- Remove any reference to `/motion`, `/design`, or `/skills` as places a visitor can go.

No changes to roles, stats, projects, brands, or contact, so those sections stay as they are.

---

## 10. Verification

No test script exists in this repo, so verification is build plus manual sweep.

1. `npm run build` and `npm run lint` both clean.
2. **Grep gates**, each must return zero:
   - `text-\[[0-9.]*px\]` in `components/` and `app/`
   - `tracking-\[[0-9.]*em\]` in `components/` and `app/`
   - `font-serif` anywhere
   - `transition-all` anywhere (currently zero, must stay zero)
   - `accent` referencing a hue rather than foreground
   - `Divider`, `Marquee`, `CurrentState`, `NFT`, `AvatarWithThemeSwitch`, `Reveal`, `BottomFadeMask`, `CurrentTime`, `WorkListItem` as imports anywhere
   - `animate-in`, `animate-out`, `fade-in-0`, `zoom-in-95` anywhere (tooltip moves to transitions)
   - more than one `TooltipProvider` in the tree
   - `components/common/Accordion` as an import (the replacement lives at `components/ui/accordion`)
   - `accordion-up` / `accordion-down` keyframes in `tailwind.config.ts` (replaced by a transition)
   - `whileInView` anywhere (the last one lived in `Reveal.tsx`)
   - `setInterval` outside `components/chat/` (the FAQ clock is gone; only chat polling may remain)
3. **Route gate:** `/motion`, `/motion/principles`, `/design`, `/skills` all 404. `/markdown` still returns markdown. `curl -H "Accept: text/markdown"` on `/` and one blog post still works.
4. **Manual sweep**, both themes, desktop and mobile viewport: homepage (static hero, stats bento, Clients row, section boundaries with no dividers, FAQ as a static list), one org page, one project case study, one blog post (syntax colors), `/books`, 404 page, command palette via Cmd+K, shortcuts overlay via `?`, Navbar mobile menu collapse, chat FAB open and close, Footer with the clock gone.
5. **Motion gate:** confirm no animation exceeds 300ms (the Marker draw is removed, so the 404 sequence is the only remaining exception). Confirm the palette and shortcuts overlay appear with no transition. Sweep the pointer across the Clients logo row and confirm the second and subsequent tooltips appear without re-waiting the delay.
6. **Reduced motion:** enable it at OS level and confirm opacity transitions survive while movement stops.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Overriding Tailwind's `fontSize` defaults changes every existing `text-sm` / `text-base` / `text-lg` usage, not just the arbitrary ones | The manual sweep in step 4 is the gate. Expect to re-tune one or two steps after seeing real pages |
| 159 `--accent` sites is the largest mechanical surface, and some are `text-white`-on-accent pairs that break when accent becomes foreground | Enumerate and read each. The four known-tricky cases are called out in Part 1 |
| DM Sans has different metrics from Inter, so line lengths and wrap points shift | Sweep step 4 covers the hero, the lede at `max-w-[56ch]`, and card titles specifically |
| Deleting `/skills` removes a live URL that may have inbound links | Acceptable. It is three months old and was never promoted. Next.js returns 404, which is correct for a removed page |
| Removing the serif could make the hero feel flat, which was flagged during design review | Chosen deliberately. If it reads as too flat after the sweep, the fallback is Newsreader for `h1` only, already prototyped in the visual companion |
| Removing all 11 dividers could make homepage sections run together | Sweep step 4 checks this explicitly. Documented fallback is `border-t border-border` on the `Section` primitive, not a standalone gradient element |
| `npx shadcn@latest add accordion` may overwrite or conflict with existing `components/ui` files, and pulls a new `@radix-ui/react-accordion` version | Run it, then diff before committing. Only `components/ui/accordion.tsx` should be new. Confirm the Radix version resolves alongside the existing `@radix-ui/react-tooltip ^1.2.8` |
| shadcn's `new-york` defaults assume its own neutral palette, which may not match the Paper tokens exactly | Expected. Retokenizing the generated file is an explicit step in Part 4, not an afterthought |
| Replacing keyframes with a `height` transition on the Radix variable is slightly off the documented shadcn path, so a future `shadcn add` could revert it | Leave a short comment in `components/ui/accordion.tsx` explaining why, so the deviation survives the next regeneration |
