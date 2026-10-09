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

### Candy

**Disabled for now** (`CANDY_ENABLED = false` in `lib/theme.ts`): the styles below stay, but nothing can select the theme. A third theme, opt-in via `data-theme="candy"` on `<html>`. It redefines the same semantic tokens above under `:root[data-theme="candy"]`: paper `45 100% 98%`, ink `0 0% 10%`, sticker white `0 0% 100%` for `--card`, and an ink `--ring` at `0 0% 10%`. `--radius` becomes `1rem`, so `rounded-lg` is 16px, `rounded-md` 14px, `rounded-sm` 12px. A `--grid-line` / `--grid-size` pair (`45 34% 89%`, `40px`) draws graph paper behind every page.

Five candy-only tints, exposed as `bg-candy-*`:

| Token | Tailwind class | HSL | Hue |
|---|---|---|---|
| `--candy-pink` | `bg-candy-pink` | `348 100% 86%` | 348 |
| `--candy-mint` | `bg-candy-mint` | `154 65% 83%` | 154 |
| `--candy-butter` | `bg-candy-butter` | `50 100% 82%` | 50 |
| `--candy-sky` | `bg-candy-sky` | `203 100% 87%` | 203 |
| `--candy-lavender` | `bg-candy-lavender` | `263 100% 92%` | 263 |

None sits at hue 241 or 242 (verify gate C14, no indigo). Ink on every tint holds 4.5:1 contrast or better.

Sticker shadow and radius scale, both Candy-only:

| Token | Tailwind class | Value | Used by |
|---|---|---|---|
| `--sticker-shadow-1` | `shadow-sticker-1` | `2px 2px 0 ink` | chips, org link chips |
| `--sticker-shadow-2` | `shadow-sticker-2` | `3px 3px 0 ink` | small pills, nav controls, tags |
| `--sticker-shadow-3` | `shadow-sticker-3` | `4px 4px 0 ink` | buttons, preview cards |
| `--sticker-shadow-4` | `shadow-sticker-4` | `7px 7px 0 ink` | showcase cards, bento, FAQ open item, hero image |
| `--sticker-shadow-press` | `shadow-sticker-press` | `1px 1px 0 ink` | pressed state |
| `--sticker-radius-card` | `rounded-sticker` | `22px` | showcase, bento, FAQ, shelf |
| `--sticker-radius-tile` | `rounded-tile` | `16px` | preview cards, code block, table |
| `--sticker-radius-tag` | `rounded-tag` | `8px` | rectangular tags, org link chips |

Pill radius stays `rounded-full`, unchanged from Paper.

Two rules:

- Every Candy-specific utility (`bg-candy-*`, `rounded-sticker`, `rounded-tile`, `rounded-tag`, `shadow-sticker-*`, and every other Candy class) is written behind the `candy:` variant, never bare, so it stays harmless in Paper and dark. The one exception is `sticker`, `sticker-sm`, `sticker-flat`, `sticker-hover`, `tilt-*` and `tilt-md-*`: those are written without the `candy:` prefix because they are scoped by their own `[data-theme="candy"]` selector in `globals.css`, so they are already no-ops outside Candy.
- No dividers in Candy: no rails, bands, ticks, dot gutters, or row hairlines (`divide-y`). Sections separate on whitespace alone.
- Images are always in colour in Candy; Paper keeps thumbnails and photography greyscale until hover. Logos (org, client, product marks) are always in colour, in every theme.

### Rules

- Always use semantic tokens, never raw hex or HSL literals in components.
- The theme is the `data-theme` attribute on `<html>` (`light`, `dark`, `candy`), applied on load by the inline script from `lib/theme.ts` and changed by the `useTheme` hook in `app/hooks/useTheme.tsx`; `.dark` is still toggled for dark only. The `:root` block is Paper light; `.dark` is Paper dark.
- For opacity variants use Tailwind's slash notation: `bg-accent/15`, `decoration-accent/50`.

---

## Typography

### Font families

| Family | CSS var | Tailwind class | Use |
|---|---|---|---|
| DM Sans | `--font-sans` | `font-sans` | Body: headings, body copy, UI labels, navigation in Paper and dark |
| IBM Plex Mono | `--font-mono` | `font-mono` | Code: code blocks, eyebrow labels, monospace UI |
| Fredoka | `--font-display` | `font-display` | Display, Candy only: headings, section titles, page titles, card titles, stat numbers, the footer wordmark |

Fonts are loaded via Next.js font optimization (`next/font/google`) in `app/layout.tsx`. `font-display: swap` is implicit. There is no serif family and no `font-serif` Tailwind key: in Paper and dark, headings use `font-sans` like everything else, distinguished by weight and size, not typeface. In Candy, the same heading elements switch to `font-display` (Fredoka 700); body, lede and prose stay on DM Sans.

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

<Container width="reading">  {/* max-w-[var(--measure)], 760px, centered */}
<Container width="wide">     {/* max-w-[1080px], centered */}
```

The reading width is the token, never the literal: write `--measure`, never
`760px`.

Props: `as` (HTML tag, default `div`), `width` (`"reading"` | `"wide"`, default `"reading"`), `className`, `id`, `children`.

Both variants use `mx-auto w-full px-6`.

### Section

```tsx
import Section from "@/components/layout/Section";

<Section label="Work" title="Where I've worked" action={<ViewAllLink href="/projects">View all</ViewAllLink>}>
  {/* content */}
</Section>
```

- A small muted `label` above an h2 `title` (`text-2xl md:text-3xl`), then the
  content, in a reading `Container` at `py-14 md:py-20`.
- No band, no rule, no numbering: whitespace is the only separator between
  homepage sections. `number` / `of` and `HOMEPAGE_SECTION_TOTAL` are gone.
- `action` sits on the right of the label row.
- `width` is passed to the inner `Container`.

### Secondary routes

- No header row: `Band`, `BandLabel` and `PageBand` are deleted. A route opens
  directly with its own heading.
- Every secondary route's `<main>` carries `pt-8 md:pt-12 pb-8 md:pb-12`.

### StatsTicker, MarginNote

- `StatsTicker` (`components/common/`): the intro's proof points as one slow
  line at the reading column's width, faded at both edges. Reads `tickerStats`;
  loop length `--duration-ticker`. Pauses on hover; static and wrapped under
  reduced motion.
- `MarginNote` (`components/common/`): a short handwritten note in Caveat
  beside a homepage row, from `lib/marginNotes.ts`. Five at most. Right margin
  from `lg`, inline below it.

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

Candy: a pink sticker pill, shadow 3; a hand-rolled CTA, so it keeps its Paper padding (shadcn buttons are `h-9`/36px by default, `sm` is `h-8`/32px).

### Ghost button

```tsx
<button className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-transparent px-5 py-2 text-sm text-foreground transition-colors duration-fast ease-out hover:bg-muted">
  Label
</button>
```

Candy: a white sticker pill, shadow 3; a hand-rolled CTA, so it keeps its Paper padding (shadcn buttons are `h-9`/36px by default, `sm` is `h-8`/32px).

### Inline link (prose style)

```tsx
<a className="text-foreground underline decoration-accent/50 underline-offset-4 transition-all hover:decoration-accent">
  Link text
</a>
```

Candy: a butter highlight link, no underline; a butter `linear-gradient` block under the text that fills pink on hover.

### Badge / pill

```tsx
<span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-xs uppercase tracking-label text-accent">
  Badge
</span>
```

Candy: a tinted tag, one of the five candy tints by index, no shadow.

### StackIcon chip

```tsx
import StackIcon from "@/components/common/StackIcon";

<StackIcon name="react" />                    // icon + label chip
<StackIcon name="typescript" showLabel={false} />  // icon only
<StackIcon name="figma" showLabel={false} showTooltip />  // icon + tooltip
```

Supported names: `html`, `css`, `typescript`, `react`, `next`, `tailwind`, `motion`, `gsap`, `node`, `graphql`, `postgres`, `mongodb`, `firebase`, `docker`, `figma`, `vercel`, `git`, `github`, `supabase`, `shadcn`, `bun`, and more -- see `StackName` type in `components/common/StackIcon.tsx`.

Icons use `simple-icons` for brand and technology marks. UI icons use
`@phosphor-icons/react`, imported from its `/ssr` entry.

### Card surface

```tsx
<div className="rounded-2xl border border-border bg-card p-6">
  content
</div>
```

Candy: a sticker card, white with a 3px ink cut, shadow scaled to the card's role.

### Elevated card

```tsx
<div className="rounded-2xl border border-border bg-card p-6 card-elevated">
  content
</div>
```

(`card-elevated` is a utility class defined in `globals.css` that adds a subtle drop shadow.)

---

## Icons

- **UI icons**: `@phosphor-icons/react/ssr` (outlined, `regular` weight by
  default; pass `weight="bold"` where lucide used `strokeWidth`).
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

### Candy tilt

`lib/candy.ts` exports deterministic pickers so the server and client always
agree, keeping hydration safe:

- `tilt(i)` cycles `tilt-a` through `tilt-g` by `index % 7`, max 2 degrees.
  Used for chips, tags, badges and decorative stickers.
- `tiltMd(i)` cycles only `tilt-md-f` and `tilt-md-g` by `index % 2`, at 0.8
  degrees. Used for cards.
- `tilt-h` (4deg) and `tilt-i` (-4deg) are not part of either cycle; they are
  written as literal classes on the avatar and the brand marks only.
- `sticker`, `sticker-sm`, `sticker-flat`, `sticker-hover`, `tilt-*` and
  `tilt-md-*` are the one exception to the `candy:` convention (see Color
  Tokens, Candy): they carry no `candy:` prefix because they are scoped by
  their own `[data-theme="candy"]` selector in `globals.css`, so they are
  already inert in Paper and dark.
- Hover on a tilted card or button removes the tilt (`rotate(0)`), lifts by
  1px and steps the shadow up one size, on `duration.fast` and `--ease-out`.
  Press collapses the shadow to `--sticker-shadow-press` and translates by the
  difference.
- Under 640px, cards and buttons stop tilting; stat stickers and tags keep
  theirs.
- Under `prefers-reduced-motion`, tilts stay static (they are not animated
  in the first place); the hover lift's shadow and colour step still run
  because they carry no motion; the press translate is dropped.

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
