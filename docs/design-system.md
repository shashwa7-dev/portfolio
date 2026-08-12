# Design System Reference

A standalone reference for the Paper design system powering [shashwa7.in](https://www.shashwa7.in/).

---

## Color Tokens

All colors are CSS custom properties (defined in `app/globals.css`, HSL triples consumed via `hsl(var(--token))`) mapped to Tailwind utility classes via `tailwind.config.ts`. The `:root` block holds Paper light values; the `.dark` class swaps in Paper dark. Values below are read directly from `app/globals.css`; treat that file as the source of truth if it and this table ever disagree.

### Semantic tokens

| Token | Tailwind class | Light (HSL) | Dark (HSL) | Use for |
|---|---|---|---|---|
| `--background` | `bg-background` / `text-background` | `40 33% 98.5%` | `30 7% 5%` | Page background |
| `--foreground` | `text-foreground` / `bg-foreground` | `35 9% 11%` | `35 6% 94%` | Primary text, headings |
| `--card` | `bg-card` / `text-card-foreground` | `0 0% 100%` | `30 7% 8.5%` | Card / panel surfaces |
| `--elevated` | `bg-elevated` | `38 20% 95.5%` | `30 7% 12%` | Elevated overlays, popovers |
| `--muted` | `bg-muted` | `38 20% 95.5%` | `30 6% 15%` | Low-emphasis backgrounds |
| `--muted-foreground` | `text-muted-foreground` | `35 7% 39%` | `35 6% 63%` | Secondary / helper text |
| `--subtle` | `text-subtle` | `35 6% 44%` | `30 5% 50%` | Tertiary text, placeholders (raised to pass WCAG AA contrast) |
| `--border` | `border-border` / `bg-border` | `36 16% 89.5%` | `30 6% 16%` | Default hairline borders |
| `--border-strong` | `border-border-strong` / `bg-border-strong` | `36 14% 81%` | `30 6% 24%` | Emphasized borders |
| `--accent` | `bg-accent` / `text-accent` | `35 9% 11%` | `35 8% 94%` | CTAs, highlights, links (no separate accent hue: matches foreground) |
| `--accent-hover` | `bg-accent-hover` / `text-accent-hover` | `35 9% 22%` | `35 8% 84%` | Accent on hover |
| `--accent-foreground` | `text-accent-foreground` | `40 33% 99%` | `30 7% 6%` | Text on accent backgrounds |
| `--secondary` | `bg-secondary` / `text-secondary-foreground` | `38 20% 95.5%` | `30 6% 15%` | Chip backgrounds, secondary buttons |
| `--ring` | `ring-ring` | `35 9% 30%` | `35 6% 70%` | Focus rings |
| `--destructive` | `bg-destructive` / `text-destructive` | `0 65% 48%` | `0 60% 55%` | Error, danger states |

The palette is a warm, near-neutral ramp (low saturation, warm hue around 30-40 degrees). There is no separate brand hue: `--accent` sits at (or very near) `--foreground`, so emphasis comes from weight and contrast, not color.

### Rules

- Always use semantic tokens, never raw hex or HSL literals in components.
- Theme follows the `dark` class on `<html>`, toggled by the inline theme script in `app/layout.tsx` and by the `useDarkMode` hook in `app/hooks/useDarkMode.tsx`. The `:root` block is Paper light; `.dark` is Paper dark.
- For opacity variants use Tailwind's slash notation: `bg-accent/15`, `decoration-accent/50`.

---

## Typography

### Font families

| Family | CSS var | Tailwind class | Use |
|---|---|---|---|
| DM Sans | `--font-sans` | `font-sans` | Headings, body copy, UI labels, navigation |
| IBM Plex Mono | `--font-mono` | `font-mono` | Code blocks, eyebrow labels, monospace UI |

Fonts are loaded via Next.js font optimization (`next/font/google`) in `app/layout.tsx`. `font-display: swap` is implicit. There is no serif family and no `font-serif` Tailwind key: headings use `font-sans` like everything else, distinguished by weight and size, not typeface.

All heading elements (`h1`-`h6`) default to the sans stack via the global base styles in `globals.css` (`font-weight: 600`, `line-height: 1.1`, `letter-spacing: -0.02em`).

### Type scale

Sizes and tracking come from `tailwind.config.ts` (`fontSize`, `letterSpacing`). Arbitrary `text-[Npx]` and `tracking-[Nem]` are forbidden: use the scale.

| Tailwind class | Size | Line height | Typical use |
|---|---|---|---|
| `text-2xs` | 10px | 1.4 | Mono labels |
| `text-xs` | 11px | 1.45 | Eyebrows, fine print |
| `text-sm` | 13px | 1.55 | Captions, helper text, timestamps |
| `text-base` | 15px | 1.65 | Body copy (default) |
| `text-lg` | 17px | 1.5 | Lede / intro paragraphs |
| `text-xl` | 20px | 1.4 | Sub-section headers (H3) |
| `text-2xl` | 24px | 1.25 | Section titles (H2) |
| `text-3xl` | 30px | 1.15 | Large headings |
| `text-4xl` | 36px | 1.08 | Display / H1 |

| Tracking class | Value | Typical use |
|---|---|---|
| `tracking-label` | `0.1em` | Uppercase eyebrow labels |
| `tracking-normal` | `0` | Default |
| `tracking-tight` | `-0.02em` | Headings |
| `tracking-tighter` | `-0.03em` | Display / large headings |

### Global typography settings

- `line-height: 1.65` on `body`
- `-webkit-font-smoothing: antialiased`
- `text-rendering: optimizeLegibility`
- Headings (`h1`-`h6`): `font-weight: 600`, `line-height: 1.1`, `letter-spacing: -0.02em`

---

## Spacing and Layout

### Base grid

Tailwind's default 4px base unit. All spacing in the system uses multiples of 4.

### Section vertical rhythm

Sections use `py-10 md:py-14` (~40px / 56px). This is baked into the `Section` component.

### Common gap values

| Class | Value | Common use |
|---|---|---|
| `gap-2` | 8px | Tight inline gaps (icon + label) |
| `gap-3` | 12px | Chip rows, button groups |
| `gap-4` | 16px | Standard grid gaps |
| `gap-6` | 24px | Card grids, form fields |
| `gap-8` | 32px | Section-level spacing |
| `gap-12` | 48px | Large section dividers |

### Border radius

Five steps. Nothing else, and no arbitrary values.

| Class | Value | Use |
|---|---|---|
| `rounded-full` | 9999px | **Circles only**: status dots, circular avatars, and the capsule ends of thin progress bars |
| `rounded-2xl` | 16px | Outermost surfaces: modals, the chat window, the command palette, bento cells |
| `rounded-lg` | `0.75rem` = 12px (CSS `--radius`) | The default box: cards, panels, thumbnails, inputs |
| `rounded-md` | `calc(0.75rem - 2px)` = 10px | Elements roughly 24–40px tall |
| `rounded-sm` | `calc(0.75rem - 4px)` = 8px | Text tags and badges, roughly 20px tall |

Nesting goes larger outside, smaller inside: a `rounded-2xl` container holds
`rounded-lg` children, which hold `rounded-md` or `rounded-sm` ones.

**Nothing rectangular is a capsule.** If it has straight edges, it takes a step
from the box scale; `rounded-full` is for shapes that are actually round.

- **Buttons and CTAs use `rounded-md`.** Every one of them: the hero's two CTAs,
  the Socials CTA, the project filter chips, the video play button, the
  case-study link buttons. An earlier version of this document prescribed
  `rounded-full` here, which is why they drifted into pills twice.
- **Text badges use `rounded-sm`** (`StackIcon` labels, `EmploymentTag`, `Tag`,
  `OrgLinkChip`, `ActiveBadge`, post tags, project `Recent`/`Live` flags).
- **Card-shaped clickable surfaces keep `rounded-lg`**, like any other card: the
  launch nudge, the chat's full-width prompt rows. The test is whether it reads
  as a surface or as a control.

`rounded-sm` exists because of arithmetic, not taste. A tag is about 20px tall, so
a 10px `rounded-md` corner is half its height and renders as a capsule, meaning
`rounded-md` and `rounded-full` are the same shape at that size. 8px leaves about
4px of straight edge, which is what makes it read as a rounded rectangle.

**Retired, do not reintroduce:**

- **`rounded-xl`.** It is Tailwind's default 12px, which is *the same value* as the
  tokenised `rounded-lg`. Having both meant 38 call sites split across two names
  for one result, and only half of them would have moved if `--radius` ever
  changed. An earlier version of this table listed them as separate steps, which
  is how the drift got sanctioned in the first place.
- **Bare `rounded`.** Tailwind's 4px default, off the token scale entirely.
- **`rounded-sm`** and any `rounded-[Npx]`. Four `rounded-[9px]` call sites existed,
  sitting one pixel off `rounded-md` for no reason.

---

## Layout Primitives

All primitives live in `components/layout/` and are server-safe (no hooks).

### Container

```tsx
import Container from "@/components/layout/Container";

<Container width="reading">  {/* max-w-[760px], centered */}
<Container width="wide">     {/* max-w-[1080px], centered */}
```

Props: `as` (HTML tag, default `div`), `width` (`"reading"` | `"wide"`, default `"reading"`), `className`, `id`, `children`.

Both variants use `mx-auto w-full px-6`.

### Section

```tsx
import Section from "@/components/layout/Section";

<Section
  number="01"
  label="Color"
  title="Paper"
  width="reading"
  action={<SomeButton />}
>
  {/* content */}
</Section>
```

- Renders a `<section>` with `py-10 md:py-14` rhythm.
- The numbered eyebrow is rendered via the `Label` component. Number shows in `text-foreground`, separator ` / `, then label text.
- Title is a `text-2xl md:text-[1.75rem] text-foreground` h2.
- `width` is passed to the inner `Container`.

### Bento

```tsx
import Bento from "@/components/layout/Bento";

<Bento className="grid-cols-1 md:grid-cols-3">
  <div className="bg-card p-6">Cell A</div>
  <div className="bg-card p-6">Cell B</div>
  <div className="bg-card p-6">Cell C</div>
</Bento>
```

- Wraps a grid with `overflow-hidden rounded-2xl border border-border`.
- Inner div uses `grid gap-px bg-border` -- the `gap-px` on the `bg-border` parent creates 1px hairline separators between cells.
- Each cell should have `bg-card` (or `bg-background`) so the border background peeks through as the hairline.

There is no standalone divider primitive. Sections are separated by vertical
rhythm alone (`py-10 md:py-14` on `Section`), not by a rule element. If a
section boundary ever reads as too weak, the documented fallback is
`border-t border-border` on the `Section` primitive itself, not a new
standalone separator component.

### Label

```tsx
import Label from "@/components/layout/Label";

<Label>Section eyebrow</Label>
<Label className="mb-3 block">With extra class</Label>
```

Renders a `<span>` with `font-mono text-xs uppercase tracking-label text-subtle`.

---

## Component Patterns

### Primary button

```tsx
<button className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors duration-fast ease-out hover:bg-accent-hover">
  Label
</button>
```

### Ghost button

```tsx
<button className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-transparent px-5 py-2 text-sm text-foreground transition-colors duration-fast ease-out hover:bg-muted">
  Label
</button>
```

### Inline link (prose style)

```tsx
<a className="text-foreground underline decoration-accent/50 underline-offset-4 transition-all hover:decoration-accent">
  Link text
</a>
```

### Badge / pill

```tsx
<span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-xs uppercase tracking-label text-accent">
  Badge
</span>
```

### StackIcon chip

```tsx
import StackIcon from "@/components/common/StackIcon";

<StackIcon name="react" />                    // icon + label chip
<StackIcon name="typescript" showLabel={false} />  // icon only
<StackIcon name="figma" showLabel={false} showTooltip />  // icon + tooltip
```

Supported names: `html`, `css`, `typescript`, `react`, `next`, `tailwind`, `motion`, `gsap`, `node`, `graphql`, `postgres`, `mongodb`, `firebase`, `docker`, `figma`, `vercel`, `git`, `github`, `supabase`, `shadcn`, `bun`, and more -- see `StackName` type in `components/common/StackIcon.tsx`.

Icons use `simple-icons` for brand logos. UI icons use `lucide-react`.

### Card surface

```tsx
<div className="rounded-2xl border border-border bg-card p-6">
  content
</div>
```

### Elevated card

```tsx
<div className="rounded-2xl border border-border bg-card p-6 card-elevated">
  content
</div>
```

(`card-elevated` is a utility class defined in `globals.css` that adds a subtle drop shadow.)

---

## Icons

- **UI icons**: `lucide-react` (outlined, consistent weight).
- **Brand / tech logos**: `simple-icons` accessed via the `StackIcon` component abstraction.
- Do not use emoji as icons in components.

---

## Motion Guidelines

All animation is powered by **Motion** (Framer Motion, imported as `motion/react`).

### Easing curves (CSS custom properties)

| Variable | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | The single UI curve: entrances, exits, hovers, reveals |

There is no spring easing curve. The one Motion `spring` transition left in the app (`spring.hoverIn` in `lib/motionVariants.ts`) is for the chat FAB hover only.

### Duration guidelines

Durations live in `lib/motionVariants.ts` as the `duration` export and are mirrored as CSS custom properties in `globals.css`. No literal durations or easing curves outside that file.

- `duration.fast` (`150ms`): hovers, exits, tooltips
- `duration.base` (`200ms`): popovers, dropdowns, modals
- `duration.med` (`300ms`): crossfades, opacity beats
- `duration.slow` (`240ms`): reveals, page-level entrances
- `duration.hero` (`500ms`): the 404 page sequence, the one sanctioned exception

### Common animation patterns

- **Hover lift**: `whileHover={{ y: -2 }}` on cards.
- **Scale tap**: `whileTap={{ scale: 0.97 }}` on buttons.
- **Mobile menu**: CSS grid-template-rows collapse (`0fr` → `1fr`) plus `visibility`, so the closed panel is removed from tab order and the accessibility tree instead of relying on `overflow: hidden` alone.

Rules: exits animate faster than enters; keyboard surfaces (command palette, shortcuts overlay) are near-instant.

### Reduced motion

`app/layout.tsx` wraps the app in `<MotionConfig reducedMotion="user">`, so every Motion animation respects the visitor's OS-level `prefers-reduced-motion` setting automatically. CSS animations and transitions are separately collapsed under `@media (prefers-reduced-motion: reduce)` in `globals.css`: movement (transforms) is dropped, opacity and color transitions are kept because they aid comprehension without triggering motion sickness.

---

## Copywriting Rules

- No em-dashes ( -- ) in UI copy. Use commas, colons, or restructure the sentence.
- Favor short, direct sentences.
- Section labels (eyebrows) are ALL CAPS via CSS -- write them in lowercase in JSX.
- Avoid filler words: "just", "simply", "very", "really".

---

## File Map

| File | Purpose |
|---|---|
| `app/globals.css` | CSS custom properties (color tokens, easing, animations) |
| `tailwind.config.ts` | Token mapping to Tailwind classes, font families, custom screens |
| `app/layout.tsx` | Font loading (DM Sans, IBM Plex Mono), `MotionConfig reducedMotion="user"` |
| `components/layout/Container.tsx` | Width-constrained wrapper |
| `components/layout/Section.tsx` | Numbered section with eyebrow + title |
| `components/layout/Bento.tsx` | Hairline-grid card layout |
| `components/layout/Label.tsx` | Mono eyebrow label |
| `components/common/StackIcon.tsx` | Brand icon chips (simple-icons) |
| `lib/seo.ts` | `ogUrl()`, structured data helpers |
| `app/sitemap.ts` | `baseUrl` export + sitemap generation |
