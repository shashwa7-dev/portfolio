---
name: portfolio-design-system
description: Design system for this portfolio (warm paper/ink tokens, DM Sans + IBM Plex Mono type, Container/Section/Band/Rails/Bento primitives, usage rules). Use when building or restyling UI in this repo.
---

Full reference: `docs/design-system.md`. This skill gives you the fast rules.

## Color -- always use semantic tokens

- Background surfaces: `bg-background` > `bg-card` > `bg-elevated` > `bg-muted` (lightest to most elevated)
- Text: `text-foreground` (primary) / `text-muted-foreground` (secondary) / `text-subtle` (tertiary)
- Brand / accent: `bg-accent` for CTAs; `hover:bg-accent-hover` on hover; `text-accent` for inline highlights
- Borders: `border-border` (default hairline); `border-border-strong` (emphasis, button outlines)
- Never use raw hex. Dark mode is the default (`dark` class on `<html>`).

## Typography

- Headings: `font-sans` (DM Sans). There is NO serif face in this repo and `font-serif` fails `scripts/verify-simplification.sh` (C03). Display: `text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]`. Section h2: `text-2xl md:text-3xl`.
- Body: `font-sans` (Inter). Default size `text-base`, secondary text in `text-muted-foreground`.
- Labels / eyebrows / code: `font-mono` (JetBrains Mono). Label component: `text-[11px] uppercase tracking-[0.16em] text-subtle`.
- No em-dashes in copy. Restructure sentences instead.

## Section pattern

Every major section follows this structure:

```tsx
<Section number="01" of="06" label="Label" title="Section title" width="reading">
  {/* content */}
</Section>
```

- `Section` opens with a full-bleed `Band` carrying `[ 01 / 06 ] · LABEL`, then a `Container` holding the title and content at `py-10 md:py-14`.
- The band IS the divider. There is no `Divider` component, and importing one fails the gate (C13).
- `of` is opt-in: pass it only where the route really is a sequence of known length (homepage, `/shelf`). A blog post is not a sequence.
- Secondary routes open with `<PageBand id="Blog" name="12 posts" />` as the first child of `<main>`, which carries `pb-8 md:pb-12`.
- Never draw a band by hand. It means "a labelled division starts here" and stops meaning it the moment it is used for emphasis.

## Layout primitives (all in `components/layout/`)

| Primitive | When to use |
|---|---|
| `Container width="reading"` | Prose / single-column content (760px max) |
| `Container width="wide"` | Full layouts, hero sections (1080px max) |
| `Section` | Any major content block needing the numbered eyebrow + title |
| `Bento` | Grid of feature cards with hairline borders |
| `Band` | The full-bleed labelled row that crosses the page rails |
| `PageBand` | A secondary route's opening band, flush under the navbar |
| `Rails` | The two page hairlines. Rendered ONCE from `app/layout.tsx`, never per page |
| `Label` | Eyebrow text above headings |

## Bento pattern

```tsx
<Bento className="grid-cols-1 md:grid-cols-3">
  <div className="bg-card p-6">Cell</div>
  <div className="bg-card p-6">Cell</div>
</Bento>
```

Each cell needs `bg-card` so the 1px `bg-border` gap is visible as a hairline separator.

## Component patterns

- **Primary button**: `rounded-full bg-accent text-accent-foreground hover:bg-accent-hover`
- **Ghost button**: `rounded-full border border-border-strong hover:bg-muted`
- **Card**: `rounded-2xl border border-border bg-card p-6`
- **Badge**: `rounded-full bg-accent/15 text-accent font-mono text-[11px] uppercase tracking-[0.12em]`
- **Inline link**: `underline decoration-accent/50 underline-offset-4 hover:decoration-accent`
- **StackIcon**: `<StackIcon name="react" />` -- use for brand/tech icons; `@phosphor-icons/react/ssr` for UI icons

## Motion rules

- Easing: `--ease-out` = `cubic-bezier(0.22, 1, 0.36, 1)` for entrances.
- Duration: 200ms hover micro / 300-400ms reveal / ~60ms stagger per item.
- Hover lift: `whileHover={{ y: -2 }}` on cards.
- Always respect `prefers-reduced-motion` (handled globally in `globals.css`).

## Icons

- UI icons: `@phosphor-icons/react/ssr` (outlined). Weight, not stroke width: Phosphor has no `strokeWidth` prop, it has `weight`.
- Brand logos: `simple-icons` via `StackIcon` component. Do not import `simple-icons` directly.

## Copy rules

- No em-dashes. Use commas, colons, or restructure.
- Section eyebrow labels are ALL CAPS via CSS -- write lowercase in JSX.
- Keep explanations short and direct.
