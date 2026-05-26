# Design System Reference

A standalone reference for the graphite + indigo design system powering [shashwa7.in](https://www.shashwa7.in/).

---

## Color Tokens

All colors are CSS custom properties (defined in `app/globals.css`) mapped to Tailwind utility classes via `tailwind.config.ts`. Dark mode (graphite) is the **default**; the site sets the `dark` class on `<html>` at load. Light mode uses the `:root` values.

### Semantic tokens

| Token | Tailwind class | Dark hex (approx) | Light hex (approx) | Use for |
|---|---|---|---|---|
| `--background` | `bg-background` / `text-background` | `#0B0B0F` | `#FAFAFF` | Page background |
| `--foreground` | `text-foreground` / `bg-foreground` | `#EDEDEF` | `#17171A` | Primary text, headings |
| `--card` | `bg-card` / `text-card-foreground` | `#15151B` | `#FFFFFF` | Card / panel surfaces |
| `--elevated` | `bg-elevated` | `#1C1C24` | `#F3F3F9` | Elevated overlays, popovers |
| `--muted` | `bg-muted` | `#232330` | `#F3F3F9` | Low-emphasis backgrounds |
| `--muted-foreground` | `text-muted-foreground` | `#9A99A8` | `#5C5C6E` | Secondary / helper text |
| `--subtle` | `text-subtle` | `#6D6C7A` | `#8A8A9A` | Tertiary text, placeholders |
| `--border` | `border-border` / `bg-border` | `#232330` | `#E5E5F0` | Default hairline borders |
| `--border-strong` | `border-border-strong` / `bg-border-strong` | `#2E2E3C` | `#D0D0E0` | Emphasized borders |
| `--accent` | `bg-accent` / `text-accent` | `#6E6BF2` | `#5B58DD` | Brand CTAs, highlights, links |
| `--accent-hover` | `bg-accent-hover` / `text-accent-hover` | `#807DF5` | `#6E6BF2` | Accent on hover |
| `--accent-foreground` | `text-accent-foreground` | `#FFFFFF` | `#FFFFFF` | Text on accent backgrounds |
| `--secondary` | `bg-secondary` / `text-secondary-foreground` | `#1C1C24` | `#F3F3F9` | Chip backgrounds, secondary buttons |
| `--ring` | `ring-ring` | matches accent | matches accent | Focus rings |
| `--destructive` | `bg-destructive` / `text-destructive` | `#E05555` | `#CC4444` | Error, danger states |

### Rules

- Always use semantic tokens, never raw hex values in components.
- Dark mode is the default theme; the `dark` class is managed by `useDarkMode` hook in `app/hooks/useDarkMode.ts`.
- For opacity variants use Tailwind's slash notation: `bg-accent/15`, `decoration-accent/50`.

---

## Typography

### Font families

| Family | CSS var | Tailwind class | Use |
|---|---|---|---|
| Fraunces (variable serif) | `--font-fraunces` | `font-serif` | Headings, display, section titles |
| Inter | `--font-inter` | `font-sans` | Body copy, UI labels, navigation |
| JetBrains Mono | `--font-mono` | `font-mono` | Code blocks, eyebrow labels, monospace UI |

Fonts are loaded via Next.js font optimization in `app/layout.tsx`. `font-display: swap` is implicit.

All heading elements (`h1`-`h6`) default to `font-serif` via the global base styles in `globals.css`.

### Type scale

| Role | Tailwind classes | Notes |
|---|---|---|
| Display / H1 | `font-serif text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]` | Page titles, hero headings |
| H2 / Section title | `font-serif text-2xl md:text-[1.75rem]` | Section headers (used inside `Section` component) |
| H3 | `font-serif text-xl` | Sub-section headers |
| Body lede | `text-lg text-muted-foreground leading-relaxed` | Intro paragraphs |
| Body | `text-base text-muted-foreground` | Regular prose, 16px, line-height 1.65 |
| Small | `text-sm text-muted-foreground` | Captions, helper text, timestamps |
| Mono label / eyebrow | `font-mono text-[11px] uppercase tracking-[0.16em] text-subtle` | Section eyebrows (the `Label` component) |

### Global typography settings

- `line-height: 1.65` on `body`
- `-webkit-font-smoothing: antialiased`
- `font-feature-settings: "cv11", "ss01"` for Inter optical features
- `text-rendering: optimizeLegibility`
- Headings: `line-height: 1.1`, `letter-spacing: -0.015em`, `font-weight: 500`

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

| Class | Value | Use |
|---|---|---|
| `rounded` | 4px | Tiny UI elements |
| `rounded-md` | `calc(0.75rem - 2px)` | Small cards, inputs |
| `rounded-lg` | `0.75rem` (CSS `--radius`) | Standard cards |
| `rounded-xl` | 12px | Larger panels |
| `rounded-2xl` | 16px | Bento cells, feature cards |
| `rounded-full` | 9999px | Buttons (pill), badges |

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
  title="Graphite + Indigo"
  width="reading"
  action={<SomeButton />}
>
  {/* content */}
</Section>
```

- Renders a `<section>` with `py-10 md:py-14` rhythm.
- The numbered eyebrow is rendered via the `Label` component. Number shows in `text-accent-hover`, separator ` / `, then label text.
- Title is a `font-serif text-2xl md:text-[1.75rem]` h2.
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

### Divider

```tsx
import Divider from "@/components/layout/Divider";

<Divider />
```

A full-width faded horizontal rule: `h-px bg-gradient-to-r from-transparent via-border-strong to-transparent`, constrained to `max-w-[760px]`. Use between every major section, matching the homepage pattern.

### Label

```tsx
import Label from "@/components/layout/Label";

<Label>Section eyebrow</Label>
<Label className="mb-3 block">With extra class</Label>
```

Renders a `<span>` with `font-mono text-[11px] uppercase tracking-[0.16em] text-subtle`.

### Reveal

```tsx
import Reveal from "@/components/layout/Reveal";

<Reveal>
  <p>Fades up on first viewport entry.</p>
</Reveal>
```

A client component wrapping Motion's `motion.div` with a fade-up animation triggered by `whileInView`. Uses `--ease-out` easing.

---

## Component Patterns

### Primary button

```tsx
<button className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover">
  Label
</button>
```

### Ghost button

```tsx
<button className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-transparent px-5 py-2 text-sm text-foreground transition-colors hover:bg-muted">
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
<span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
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
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances, reveals |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | State transitions |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions |

### Duration guidelines

- Hover / micro: `200ms`
- Layout / reveal: `300-400ms`
- Stagger per item: `~60ms`

### Common animation patterns

- **Fade-up on enter**: `opacity: 0 -> 1`, `translateY(12px) -> 0`, triggered by `whileInView`. Use the `Reveal` primitive.
- **Hover lift**: `whileHover={{ y: -2 }}` on cards.
- **Scale tap**: `whileTap={{ scale: 0.97 }}` on buttons.
- **Mobile menu**: `AnimatePresence` + height + opacity.

### Reduced motion

All CSS animations and transitions are collapsed to `0.01ms` when `prefers-reduced-motion: reduce` is set (handled globally in `globals.css`). Motion (Framer Motion) respects this automatically via `useReducedMotion` in the `Reveal` component.

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
| `app/layout.tsx` | Font loading (Fraunces, Inter, JetBrains Mono) |
| `components/layout/Container.tsx` | Width-constrained wrapper |
| `components/layout/Section.tsx` | Numbered section with eyebrow + title |
| `components/layout/Bento.tsx` | Hairline-grid card layout |
| `components/layout/Divider.tsx` | Faded horizontal separator |
| `components/layout/Label.tsx` | Mono eyebrow label |
| `components/layout/Reveal.tsx` | Fade-up on viewport entry |
| `components/common/StackIcon.tsx` | Brand icon chips (simple-icons) |
| `lib/seo.ts` | `ogUrl()`, structured data helpers |
| `app/sitemap.ts` | `baseUrl` export + sitemap generation |
