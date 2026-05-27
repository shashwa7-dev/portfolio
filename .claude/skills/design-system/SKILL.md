---
name: portfolio-design-system
description: Design system for this portfolio (graphite+indigo tokens, Fraunces/Inter/JetBrains Mono type, Container/Section/Bento/Divider primitives, usage rules). Use when building or restyling UI in this repo.
---

Full reference: `docs/design-system.md`. This skill gives you the fast rules.

## Color -- always use semantic tokens

- Background surfaces: `bg-background` > `bg-card` > `bg-elevated` > `bg-muted` (lightest to most elevated)
- Text: `text-foreground` (primary) / `text-muted-foreground` (secondary) / `text-subtle` (tertiary)
- Brand / accent: `bg-accent` for CTAs; `hover:bg-accent-hover` on hover; `text-accent` for inline highlights
- Borders: `border-border` (default hairline); `border-border-strong` (emphasis, button outlines)
- Never use raw hex. Dark mode is the default (`dark` class on `<html>`).

## Typography

- Headings: `font-serif` (Fraunces). Display: `text-[clamp(2rem,5vw,2.75rem)] font-medium tracking-[-0.02em]`. Section h2: `text-2xl md:text-[1.75rem]`.
- Body: `font-sans` (Inter). Default size `text-base`, secondary text in `text-muted-foreground`.
- Labels / eyebrows / code: `font-mono` (JetBrains Mono). Label component: `text-[11px] uppercase tracking-[0.16em] text-subtle`.
- No em-dashes in copy. Restructure sentences instead.

## Section pattern

Every major section follows this structure:

```tsx
<Section number="01" label="Label" title="Serif section title" width="reading">
  {/* content */}
</Section>
<Divider />
```

- `Section` handles `py-10 md:py-14` vertical rhythm and the `Container` wrapper.
- `Divider` goes between every section (faded hairline, matches homepage).
- Number is `text-accent-hover`; title is `font-serif text-2xl md:text-[1.75rem]`.

## Layout primitives (all in `components/layout/`)

| Primitive | When to use |
|---|---|
| `Container width="reading"` | Prose / single-column content (760px max) |
| `Container width="wide"` | Full layouts, hero sections (1080px max) |
| `Section` | Any major content block needing the numbered eyebrow + title |
| `Bento` | Grid of feature cards with hairline borders |
| `Divider` | Between every section |
| `Label` | Eyebrow text above headings |
| `Reveal` | Wrap elements for fade-up animation on scroll |

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
- **StackIcon**: `<StackIcon name="react" />` -- use for brand/tech icons; `lucide-react` for UI icons

## Motion rules

- Easing: `--ease-out` = `cubic-bezier(0.22, 1, 0.36, 1)` for entrances.
- Duration: 200ms hover micro / 300-400ms reveal / ~60ms stagger per item.
- Wrap elements in `<Reveal>` for scroll-triggered fade-up.
- Hover lift: `whileHover={{ y: -2 }}` on cards.
- Always respect `prefers-reduced-motion` (handled globally in `globals.css`).

## Icons

- UI icons: `lucide-react` (outlined).
- Brand logos: `simple-icons` via `StackIcon` component. Do not import `simple-icons` directly.

## Copy rules

- No em-dashes. Use commas, colons, or restructure.
- Section eyebrow labels are ALL CAPS via CSS -- write lowercase in JSX.
- Keep explanations short and direct.
