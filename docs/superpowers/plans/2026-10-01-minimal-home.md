# Minimal Home (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage as a simple, minimal, modern page: stacked intro with a body-width stats ticker, plain section labels, Work / Projects / Currently / FAQ / Closing, handwritten margin notes, no rails, and Candy switched off.

**Architecture:** Pure data and rules live in `lib/` with vitest tests (the only thing vitest runs: `lib/**/*.test.ts`, node env). Components stay presentational and read those helpers. The shared `Section` loses its band and numbering; `Band`/`PageBand` are untouched (phase 2). Candy is disabled by one flag in `lib/theme.ts`.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, `@phosphor-icons/react/ssr`, `next/font` (Caveat via `lib/card/fonts.ts`), vitest.

**Spec:** `docs/superpowers/specs/2026-09-30-minimal-home-design.md`

## Global Constraints

- No em-dashes in any user-facing copy (UI strings, data files, `data/agent-memory.md`).
- No arbitrary `text-[Npx]` or `tracking-[Nem]`; use the Tailwind scale (`text-2xs` … `text-4xl`, `tracking-label|tight|tighter`).
- No literal easings or durations in components: import from `lib/motionVariants.ts`, mirrored as CSS vars in `app/globals.css`.
- Phosphor icons only from `@phosphor-icons/react/ssr`. No `lucide-react`.
- No `transition-all`.
- No component named or imported as `Marquee` (verify check C13 bans `components/Marquee` and `common/Marquee`).
- `Band` and `PageBand` are not modified in this plan.
- `scripts/verify-simplification.sh`, `npx tsc --noEmit`, `npm run lint`, `npm test` must all pass at the end of every task.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Work on branch `feat/minimal-home` (already created from `origin/master`, spec committed).

## Review Focus

1. A visitor whose `localStorage.theme` is `"candy"` → lands in their system light/dark theme, never a half-styled Candy page. (Test: Task 1.)
2. `prefers-reduced-motion: reduce` → the ticker does not move, every stat is readable, and screen readers hear each stat once. (Test: Task 4 data test for single source list; manual check in Task 4.)
3. An org with no products and no clients (Cope.Studio) → its Work row shows no subtitle and no stray "·". (Test: Task 6.)
4. Every book marked done → the "Reading" row is omitted rather than showing an empty value. (Test: Task 9.)
5. A 1024px window with a visible scrollbar → margin notes still fit beside the column with no horizontal page scroll; a 390px phone → notes inline under their row. (Manual: Task 7.)

---

### Task 1: Disable Candy behind a flag

**Files:**
- Modify: `lib/theme.ts`
- Modify: `lib/theme.test.ts`
- Modify: `lib/commandData.ts:50`

**Interfaces:**
- Produces: `export const CANDY_ENABLED: boolean` (false), `THEMES` now `readonly ["light","dark"]` while false, `resolveTheme("candy", prefersDark)` returns the system theme, `THEME_BOOT_SCRIPT` treats `"candy"` as unset.

- [ ] **Step 1: Rewrite the theme tests for the disabled state**

Replace the whole `describe("theme names"…)`, `resolveTheme`, `nextTheme`, `themeLabel` blocks and the boot-script `cases` in `lib/theme.test.ts` with:

```ts
describe("theme names", () => {
  it("Candy is disabled for now", () => {
    expect(CANDY_ENABLED).toBe(false);
  });
  it("cycles only light and dark while Candy is off", () => {
    expect(THEMES).toEqual(["light", "dark"]);
  });
  it("uses the same storage key as before", () => {
    expect(THEME_STORAGE_KEY).toBe("theme");
  });
  it("does not recognise candy while it is off", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("candy")).toBe(false);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe("resolveTheme", () => {
  it("follows the OS when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
  it("keeps a stored light or dark regardless of the OS", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("sends a stored candy back to the system theme", () => {
    expect(resolveTheme("candy", true)).toBe("dark");
    expect(resolveTheme("candy", false)).toBe("light");
  });
  it("treats an unknown stored value like nothing stored", () => {
    expect(resolveTheme("purple", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});

describe("nextTheme", () => {
  it("toggles light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});

describe("themeLabel", () => {
  it("capitalises for people", () => {
    expect(themeLabel("light")).toBe("Light");
    expect(themeLabel("dark")).toBe("Dark");
  });
});
```

Update the import line to add `CANDY_ENABLED`. In the `applyTheme` test, replace `applyTheme(root, "candy")` and its two expects with nothing (delete those three lines). In the boot-script test keep the `cases` array as is (it still includes `["candy", true]` and `["candy", false]`, which now must resolve to the system theme in both implementations).

- [ ] **Step 2: Run the tests and watch them fail**

Run: `npx vitest run lib/theme.test.ts`
Expected: FAIL (`CANDY_ENABLED` is not exported; `THEMES` still has `candy`).

- [ ] **Step 3: Implement the flag in `lib/theme.ts`**

Replace the `THEMES` declaration and the boot script with:

```ts
/**
 * Candy is switched off until Shashwat turns it back on. Flip this to `true`
 * and the third theme returns everywhere: the cycle, the palette action, and
 * stored preferences. Its styles never left; every `candy:` class is inert
 * while `data-theme` can never be "candy".
 */
export const CANDY_ENABLED = false;

const ALL_THEMES = ["light", "candy", "dark"] as const;
export const THEMES = (CANDY_ENABLED
  ? ALL_THEMES
  : ALL_THEMES.filter((t) => t !== "candy")) as readonly Theme[];
export type Theme = (typeof ALL_THEMES)[number];
```

and

```ts
export const THEME_BOOT_SCRIPT = `(function(){var t=localStorage.getItem("theme");var ok=t==="light"||t==="dark"${
  CANDY_ENABLED ? '||t==="candy"' : ""
};var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=ok?t:(d?"dark":"light");var r=document.documentElement;r.setAttribute("data-theme",theme);r.classList.toggle("dark",theme==="dark");})();`;
```

`isTheme`, `resolveTheme`, `nextTheme` already read `THEMES`, so they need no change.

- [ ] **Step 4: Hide the palette action while Candy is off**

In `lib/commandData.ts`, change the type-only import on line 3 to `import { CANDY_ENABLED, type Theme } from "@/lib/theme";` and replace line 50 (the `act-theme-candy` entry inside `const actions: Command[] = [...]`) with:

```ts
    ...(CANDY_ENABLED
      ? [{ id: "act-theme-candy", label: "Candy theme", group: "Actions", action: "set-theme", theme: "candy" } satisfies Command]
      : []),
```

- [ ] **Step 5: Run everything**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add lib/theme.ts lib/theme.test.ts lib/commandData.ts
git commit -m "feat(theme): disable Candy behind CANDY_ENABLED

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Remove the rails

**Files:**
- Modify: `app/layout.tsx:12, 139-145` (the `Rails` import, the comment and `<Rails />`)
- Delete: `components/layout/Rails.tsx`
- Modify: `app/globals.css` (the `/* The rails. …` block and its selectors)
- Modify: `scripts/verify-simplification.sh` (add check)

**Interfaces:**
- Produces: nothing new. The `relative` wrapper in `app/layout.tsx` may stay (harmless) but its comment must stop mentioning Rails.

- [ ] **Step 1: Add the failing gate**

In `scripts/verify-simplification.sh`, after the C15 line, add:

```bash
echo ""
echo "Minimal home"
absent C16 "Rails component gone"        components/layout/Rails.tsx
count C17 "Rails not rendered"           0 grep -rEoh "<Rails" --include=*.tsx app components
count C18 "Candy disabled"               1 grep -rEoh "CANDY_ENABLED = false" lib/theme.ts
```

- [ ] **Step 2: Run it and watch it fail**

Run: `./scripts/verify-simplification.sh`
Expected: FAIL on C16 and C17.

- [ ] **Step 3: Remove Rails**

Delete `components/layout/Rails.tsx`. In `app/layout.tsx` remove `import Rails from "@/components/layout/Rails";`, remove `<Rails />`, and replace the wrapper's comment with `{/* Navbar, page and footer share one wrapper. */}`. In `app/globals.css` delete the rails block (starts at the comment `/* The rails. A \`<span>\` is inline by default` and runs to the end of its rules); also reword the `--measure` comment (around line 38) so it names only `Container`, not the rails. Grep afterwards to confirm no `rails` selector remains:

Run: `grep -n "rail" app/globals.css`
Expected: no output, or only unrelated words.

- [ ] **Step 4: Run everything**

Run: `./scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint && npx vitest run`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A app/layout.tsx app/globals.css components/layout/Rails.tsx scripts/verify-simplification.sh
git commit -m "feat(layout): remove the rails

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Plain section labels, no numbering

**Files:**
- Modify: `components/layout/Section.tsx`
- Delete: `lib/sections.ts`
- Modify (call sites drop `number`/`of`, import of `HOMEPAGE_SECTION_TOTAL`): `components/ExperienceWork.tsx`, `components/Projects.tsx`, `components/TechStack.tsx`, `components/Activity.tsx`, `components/Faq.tsx`, `components/Socials.tsx`, `app/shelf/page.tsx`
- Modify: `scripts/verify-simplification.sh`

**Interfaces:**
- Produces: `Section` props `{ id?: string; label?: string; title?: string; action?: React.ReactNode; width?: "reading" | "wide"; className?: string; children: React.ReactNode }`. No `number`, no `of`.

- [ ] **Step 1: Add the failing gate**

Append to the "Minimal home" block in `scripts/verify-simplification.sh`:

```bash
count C19 "no section numbering"        0 grep -rEoh "HOMEPAGE_SECTION_TOTAL|number=\{?\"0[0-9]\"" --include=*.tsx --include=*.ts app components lib
absent C19 "sections constant gone"     lib/sections.ts
```

Run: `./scripts/verify-simplification.sh`
Expected: FAIL on C19.

- [ ] **Step 2: Rewrite `components/layout/Section.tsx`**

```tsx
import Container from "./Container";

type Props = {
  id?: string;
  /** Small muted label above the title, e.g. "Work". Plain text: no band, no number. */
  label?: string;
  title?: string;
  /** Right-aligned beside the label, e.g. a "View all" link. */
  action?: React.ReactNode;
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
};

/**
 * A homepage-style section. Whitespace is the only separator: no band, no
 * rule, no numbering. One vertical step (`py-14 md:py-20`) between sections.
 */
export default function Section({ id, label, title, action, width = "reading", className, children }: Props) {
  return (
    <section id={id} className={className}>
      <Container width={width} className="scroll-mt-16 py-14 md:py-20">
        {(label || action) && (
          <div className="mb-2 flex items-center justify-between gap-4">
            {label && <p className="text-sm text-subtle">{label}</p>}
            {action}
          </div>
        )}
        {title && <h2 className="mb-8 text-2xl font-medium tracking-tight text-foreground md:text-3xl">{title}</h2>}
        {children}
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Update every call site**

Delete `lib/sections.ts`. In each file listed above remove `import { HOMEPAGE_SECTION_TOTAL } from "@/lib/sections";` and the `number=…` / `of=…` props. Labels on the homepage become: ExperienceWork `label="Work"`, Projects `label="Projects"`, TechStack `label="Toolkit"`, Activity `label="Now"`, Faq `label="FAQ"`, Socials `label="Contact"`. In `app/shelf/page.tsx` remove the `no(...)` / `total` helpers if nothing else uses them:

Run: `grep -n "no(\|total" app/shelf/page.tsx`
Expected after edit: no remaining references to the removed helpers.

- [ ] **Step 4: Run everything**

Run: `./scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint && npx vitest run`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A components/layout/Section.tsx lib/sections.ts components app/shelf/page.tsx scripts/verify-simplification.sh
git commit -m "feat(section): plain labels, no band or numbering

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Stats ticker

**Files:**
- Modify: `lib/stats.ts`
- Create: `lib/stats.test.ts`
- Modify: `lib/motionVariants.ts` (add `duration.ticker`)
- Modify: `app/globals.css` (add `--duration-ticker`, `.ticker-*` rules)
- Create: `components/common/StatsTicker.tsx`

**Interfaces:**
- Produces: `Stat` gains `context?: string`; `export const tickerStats: Stat[]` (all five, in ticker order); `stats` (first four, unchanged order) still exported for the OG card. `StatsTicker` default export, no props.

- [ ] **Step 1: Write the failing test `lib/stats.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { stats, tickerStats } from "./stats";

describe("tickerStats", () => {
  it("lists the five highlights in ticker order", () => {
    expect(tickerStats.map((s) => s.n)).toEqual(["1M+", "12+", "30+", "10K+", "5+ yrs"]);
  });
  it("gives every item a caption and no em-dashes", () => {
    for (const s of tickerStats) {
      expect(s.c.length).toBeGreaterThan(0);
      expect(`${s.c} ${s.context ?? ""}`).not.toContain("—");
    }
  });
  it("keeps the OG card's first three stats stable", () => {
    expect(stats.slice(0, 3).map((s) => s.n)).toEqual(["1M+", "12+", "30+"]);
  });
});
```

Run: `npx vitest run lib/stats.test.ts`
Expected: FAIL (`tickerStats` not exported).

- [ ] **Step 2: Implement in `lib/stats.ts`**

Add `context?: string;` to the `Stat` type. Leave the existing `stats` entries exactly as they are (the OG card and the markdown route read them). Add after the `stats` array:

```ts
/**
 * The intro ticker's items, in order. A superset of `stats`: the ticker has
 * room for one more fact than the OG card, so "10K+ spaces" lives here only.
 */
export const tickerStats: Stat[] = [
  { ...stats[0], c: "users reached", context: "Coinbase × Polygon" },
  stats[1],
  { ...stats[2], c: "AI models in Spacelab" },
  { n: "10K+", c: "spaces created" },
  stats[3],
];
```

Run: `npx vitest run lib/stats.test.ts`
Expected: PASS.

- [ ] **Step 3: Motion token**

In `lib/motionVariants.ts` add to `duration`:

```ts
  /**
   * The intro stats ticker: one full loop. A drift, not a transition, so it is
   * far outside the UI budget on purpose. It pauses on hover and does not run
   * under reduced motion.
   */
  ticker: 40,
```

In `app/globals.css`, next to the other `--duration-*` vars, add `--duration-ticker: 40s;` and, at the end of the components layer:

```css
  .ticker-mask {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  }
  .ticker-track {
    display: flex;
    width: max-content;
    animation: ticker-drift var(--duration-ticker) linear infinite;
  }
  .ticker-mask:hover .ticker-track,
  .ticker-mask:focus-within .ticker-track {
    animation-play-state: paused;
  }
  @keyframes ticker-drift {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ticker-track { animation: none; width: auto; flex-wrap: wrap; }
    .ticker-track [data-ticker-copy] { display: none; }
  }
```

- [ ] **Step 4: Create `components/common/StatsTicker.tsx`**

```tsx
import { tickerStats } from "@/lib/stats";

function Items({ copy }: { copy?: boolean }) {
  return (
    <ul
      aria-label={copy ? undefined : "Highlights"}
      aria-hidden={copy || undefined}
      data-ticker-copy={copy ? "" : undefined}
      className="flex shrink-0 items-center gap-7 pr-7"
    >
      {tickerStats.map((s) => (
        <li key={s.n} className="flex items-center gap-7 whitespace-nowrap text-sm text-muted-foreground">
          <span>
            <strong className="font-semibold text-foreground">{s.n}</strong> {s.c}
            {s.context && <span className="text-subtle"> · {s.context}</span>}
          </span>
          <span aria-hidden className="text-border-strong">✦</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The intro's proof points as one slow line, clipped to the reading column and
 * faded at both edges. Rendered twice so the -50% loop is seamless; the copy is
 * hidden from assistive tech and removed entirely under reduced motion.
 */
export default function StatsTicker() {
  return (
    <div className="ticker-mask">
      <div className="ticker-track">
        <Items />
        <Items copy />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run everything**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add lib/stats.ts lib/stats.test.ts lib/motionVariants.ts app/globals.css components/common/StatsTicker.tsx
git commit -m "feat(intro): stats ticker component and data

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Intro

**Files:**
- Modify: `components/About.tsx:205-230` (headline spacing, lede), `:351-376` (stat band)

**Interfaces:**
- Consumes: `StatsTicker` (Task 4).

- [ ] **Step 1: Lede copy**

In the lede `<p>` replace `. I ship fast, polished interfaces for agentic and generative AI\n            products, 12+ so far with top AI and Web3 teams. Reach me at{" "}` with:

```tsx
            . I ship fast, polished interfaces for agentic and generative AI
            products with top AI and Web3 teams. Reach me at{" "}
```

- [ ] **Step 2: Spacing**

Change the stack wrapper `className="relative space-y-5 sm:space-y-6 candy:space-y-4 candy:sm:space-y-5"` to `className="relative space-y-6 sm:space-y-7"`, and add `mt-6 sm:mt-10` to the headline `<p>` so the headline gets more room above it than the other gaps.

- [ ] **Step 3: Replace the stat band with the ticker**

Delete the whole stat band block (the comment `{/* The proof points, as a band rather than a box.` through its closing `</div>` before `</header>`) and, inside the first `Container` directly after the buttons row, add:

```tsx
          <div className="pt-4">
            <StatsTicker />
          </div>
```

Add `import StatsTicker from "@/components/common/StatsTicker";`. Remove now-unused imports (`stats`, `tint`, `tilt`, `cn` if unused). Remove `candy:` classes only where the line is being edited anyway.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh && npx vitest run`
Expected: all pass.

Run the dev server (`npx next dev -p 3001`) and check `/` at 1440px and 390px, light and dark: identity row, headline, lede, two buttons, ticker clipped to the column with faded edges, pausing on hover. Then enable reduced motion (DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce): ticker is static, wraps, each stat appears once.

- [ ] **Step 5: Commit**

```bash
git add components/About.tsx
git commit -m "feat(intro): stacked intro with the stats ticker

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Work section as rows

**Files:**
- Create: `lib/home.ts`
- Create: `lib/home.test.ts`
- Modify: `components/ExperienceWork.tsx` (rewrite body)

**Interfaces:**
- Produces: `export function orgSubtitle(org: TOrganization): string` in `lib/home.ts`. Later tasks add `currentBook` to the same file.

- [ ] **Step 1: Write the failing test `lib/home.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { organizations } from "./workData";
import { orgSubtitle } from "./home";

const org = (slug: string) => organizations.find((o) => o.slug === slug)!;

describe("orgSubtitle", () => {
  it("lists a company's products when it has them", () => {
    expect(orgSubtitle(org("shopos"))).toBe("Sloosh · Spacelab · ShopOS");
  });
  it("falls back to the brands worked with", () => {
    expect(orgSubtitle(org("dehidden"))).toBe("Coinbase · Polygon · Play AI");
  });
  it("is empty when there is neither, with no stray separator", () => {
    expect(orgSubtitle(org("copestudio"))).toBe("");
  });
});
```

Run: `npx vitest run lib/home.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 2: Implement `lib/home.ts`**

```ts
import type { TOrganization } from "./workData";
import { clients } from "./clients";

/**
 * The one line beside an org's name on the homepage Work row: what was built
 * there (its products) or, failing that, who it was built for. Empty when
 * neither is known, so the row renders no separator.
 */
export function orgSubtitle(org: TOrganization): string {
  const names = org.products?.length
    ? org.products.map((p) => p.name)
    : clients
        .filter((c) => c.org === org.slug && c.name.toLowerCase().replace(/\s+/g, "") !== org.slug)
        .map((c) => c.name);
  return names.join(" · ");
}
```

Run: `npx vitest run lib/home.test.ts`
Expected: PASS.

- [ ] **Step 3: Rewrite `components/ExperienceWork.tsx`**

Keep `Section` with `id="experience" label="Work" title="Where I've worked, and what I shipped"`. For each org render one row, then Dehidden's featured cards:

```tsx
<ul className="space-y-1">
  {organizations.map((org) => {
    const featured = org.projects.filter((p) => p.featured);
    const subtitle = orgSubtitle(org);
    return (
      <li key={org.id} className="relative">
        <Link
          href={`/work/${org.slug}`}
          className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-base ease-out hover:bg-muted"
        >
          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md ring-1 ring-border">
            <Image src={org.logo} alt="" fill sizes="28px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-foreground">{org.name}</span>
            {subtitle && <span className="block truncate text-sm text-muted-foreground">{subtitle}</span>}
          </span>
          <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">{formatPeriod(org.period)}</span>
        </Link>
        <MarginNote id={org.slug} />
        {featured.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2.5 pb-4 sm:grid-cols-2 sm:pl-10">
            {featured.map((p, i) => (
              <ProjectPreviewCard key={p.id} project={workProjectToCard(org.slug, p)} index={i} />
            ))}
          </div>
        )}
      </li>
    );
  })}
</ul>
```

`MarginNote` is created in Task 7; until then leave the `<MarginNote id={org.slug} />` line out and add it in Task 7. Remove imports that are no longer used (`ArrowRight`, `formatTenure`, `ProductStrip`, `ClientStrip`, `EmploymentTag`, `OrgLinkChip`, `Tag`, `ViewAllLink`), add `import { orgSubtitle } from "@/lib/home";`.

- [ ] **Step 4: Verify**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh`
Expected: all pass. Check `/` in the browser: three rows, Dehidden's two cards under it, each row links to its `/work/<org>`.

- [ ] **Step 5: Commit**

```bash
git add lib/home.ts lib/home.test.ts components/ExperienceWork.tsx
git commit -m "feat(home): Work as one row per company

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Margin notes

**Files:**
- Create: `lib/marginNotes.ts`
- Create: `lib/marginNotes.test.ts`
- Create: `components/common/MarginNote.tsx`
- Modify: `components/ExperienceWork.tsx` (add `<MarginNote id={org.slug} />` where Task 6 marked it)

**Interfaces:**
- Produces: `export const marginNotes: Record<string, { text: string; rotate: number }>`; `MarginNote({ id }: { id: string })` renders nothing for an unknown id.

- [ ] **Step 1: Write the failing test `lib/marginNotes.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { marginNotes } from "./marginNotes";

describe("marginNotes", () => {
  it("has at most three notes", () => {
    expect(Object.keys(marginNotes).length).toBeLessThanOrEqual(3);
  });
  it("keys notes by the row they annotate", () => {
    expect(Object.keys(marginNotes).sort()).toEqual(["dehidden", "mehfil", "shopos"]);
  });
  it("keeps notes short, gently rotated and free of em-dashes", () => {
    for (const n of Object.values(marginNotes)) {
      expect(n.text.length).toBeLessThanOrEqual(32);
      expect(Math.abs(n.rotate)).toBeLessThanOrEqual(4);
      expect(n.text).not.toContain("—");
    }
  });
});
```

Run: `npx vitest run lib/marginNotes.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 2: Implement `lib/marginNotes.ts`**

```ts
/**
 * Handwritten notes in the homepage margin, keyed by the id of the row they
 * comment on (an org slug or a side-project slug). Three at most: past that
 * they stop reading as a voice and start reading as decoration.
 * `rotate` is fixed per note, in degrees, so the page never reflows between
 * renders.
 */
export const marginNotes: Record<string, { text: string; rotate: number }> = {
  shopos: { text: "three apps, one canvas", rotate: -4 },
  dehidden: { text: "1M users on launch day!", rotate: 3 },
  mehfil: { text: "3,916 songs, all playable", rotate: -3 },
};
```

Run: `npx vitest run lib/marginNotes.test.ts`
Expected: PASS.

- [ ] **Step 3: Create `components/common/MarginNote.tsx`**

```tsx
import { cardHand } from "@/lib/card/fonts";
import { marginNotes } from "@/lib/marginNotes";

/**
 * A handwritten aside beside a homepage row. In the right margin, rotated, from
 * `lg` (1024px). The note is 96px wide plus a 16px gap (112px), which fits the
 * ~124px margin left at 1024px even with a classic scrollbar; the few words
 * wrap to two or three lines. Inline under the row, upright, below `lg`. Real content, so it
 * is read by assistive tech after the row it annotates.
 */
export default function MarginNote({ id }: { id: string }) {
  const note = marginNotes[id];
  if (!note) return null;
  return (
    <p
      className={`${cardHand.variable} pl-10 text-lg leading-none text-amber-600 dark:text-amber-300/90 lg:absolute lg:left-full lg:top-2 lg:ml-4 lg:w-24 lg:pl-0 lg:[transform:rotate(var(--note-rotate))]`}
      style={{ fontFamily: "var(--font-hand)", ["--note-rotate" as string]: `${note.rotate}deg` }}
    >
      {note.text}
    </p>
  );
}
```

- [ ] **Step 4: Place the Work notes**

In `components/ExperienceWork.tsx` add `import MarginNote from "@/components/common/MarginNote";` and the `<MarginNote id={org.slug} />` line directly after the row's `</Link>` (as shown in Task 6 Step 3).

- [ ] **Step 5: Verify**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh`
Expected: all pass. In the browser at 1440px: notes sit in the right margin beside ShopOS and Dehidden, rotated. At 1024px (Chrome window 1024 wide, scrollbar showing): notes sit in the margin and the page does not scroll sideways. At 390px: notes sit under their rows, upright, and `document.documentElement.scrollWidth === window.innerWidth` (no horizontal scroll).

- [ ] **Step 6: Commit**

```bash
git add lib/marginNotes.ts lib/marginNotes.test.ts components/common/MarginNote.tsx components/ExperienceWork.tsx
git commit -m "feat(home): handwritten margin notes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Projects as rows

**Files:**
- Modify: `components/Projects.tsx`

**Interfaces:**
- Consumes: `MarginNote` (Task 7), `sideProjects` (`slug`, `title`, `thumbnail`, `date`, `isRecent`).

- [ ] **Step 1: Rewrite the body**

Keep `Section` with `id="projects" label="Projects" title="Things I build for fun" action={<ViewAllLink href="/projects">View all</ViewAllLink>}`. Replace the card grid with:

```tsx
<ul className="space-y-1">
  {sideProjects.map((p) => (
    <li key={p.id} className="relative">
      <Link
        href={`/project/${p.slug}`}
        className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-base ease-out hover:bg-muted"
      >
        <span className="relative h-8 w-12 shrink-0 overflow-hidden rounded ring-1 ring-border">
          <Image src={p.thumbnail} alt="" fill sizes="48px" className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0" />
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-foreground">
          {p.title}
          {p.isRecent && <span className="ml-2 rounded-full border border-border px-1.5 py-px font-mono text-2xs uppercase tracking-label text-subtle">New</span>}
        </span>
        {p.date && <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">{p.date}</span>}
      </Link>
      <MarginNote id={p.slug} />
    </li>
  ))}
</ul>
```

Imports: `Link` from `next/link`, `Image` from `next/image`, `MarginNote`. Remove `sideProjectToCard` and `ProjectPreviewCard` imports.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh && npx vitest run`
Expected: all pass. Browser: rows with thumbnails, "New" on Ganapati, Mehfil's note in the margin (inline on mobile), each row opens `/project/<slug>`.

- [ ] **Step 3: Commit**

```bash
git add components/Projects.tsx
git commit -m "feat(home): Projects as thumbnail rows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Currently (replaces Toolkit and Now)

**Files:**
- Create: `lib/currently.ts`
- Modify: `lib/home.ts` (add `currentBook`)
- Modify: `lib/home.test.ts`
- Create: `components/Currently.tsx`
- Delete: `components/Activity.tsx`, `components/TechStack.tsx`
- Modify: `app/page.tsx`
- Modify: `data/agent-memory.md` (the "Grouped the same four ways the site's Toolkit section groups them" sentence)

**Interfaces:**
- Produces: `export const currently: { building: string; stack: StackName[] }` in `lib/currently.ts`; `export function currentBook(list: Book[]): Book | undefined` in `lib/home.ts`.

- [ ] **Step 1: Failing tests (append to `lib/home.test.ts`)**

```ts
import { currentBook } from "./home";
import type { Book } from "./books";

const book = (slug: string, isDone: boolean): Book =>
  ({ slug, name: slug, link: "", author: "", cover: "", isDone, chapters: [] });

describe("currentBook", () => {
  it("is the first unfinished book", () => {
    expect(currentBook([book("a", true), book("b", false), book("c", false)])?.slug).toBe("b");
  });
  it("is undefined when every book is finished", () => {
    expect(currentBook([book("a", true)])).toBeUndefined();
  });
});
```

Run: `npx vitest run lib/home.test.ts`
Expected: FAIL (`currentBook` not exported).

- [ ] **Step 2: Implement**

In `lib/home.ts`:

```ts
import type { Book } from "./books";

/** The book in progress: the first one not marked done. */
export function currentBook(list: Book[]): Book | undefined {
  return list.find((b) => !b.isDone);
}
```

Create `lib/currently.ts`:

```ts
import type { StackName } from "@/components/common/StackIcon";

/**
 * The homepage "Currently" block. Edited by hand like the other data files.
 * `stack` is the old Toolkit's "Every day" tier, the tools actually in use.
 */
export const currently: { building: string; stack: StackName[] } = {
  building: "Sloosh, ShopOS's creator app",
  stack: ["typescript", "react", "next", "tailwind", "shadcn", "claude", "vercel", "cloudflare", "aws"],
};
```

Run: `npx vitest run lib/home.test.ts`
Expected: PASS.

- [ ] **Step 3: Create `components/Currently.tsx`**

```tsx
import Link from "next/link";
import Section from "@/components/layout/Section";
import StackIcon from "@/components/common/StackIcon";
import { books } from "@/lib/books";
import { currently } from "@/lib/currently";
import { currentBook } from "@/lib/home";

export default function Currently() {
  const book = currentBook(books);
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Building", value: currently.building },
    ...(book ? [{ label: "Reading", value: <Link href={`/books/${book.slug}`} className="underline decoration-border-strong underline-offset-4 hover:decoration-foreground">{book.name}</Link> }] : []),
  ];
  return (
    <Section id="currently" label="Currently" title="What I'm building, reading and using">
      <dl className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[6rem_1fr] gap-4 text-base">
            <dt className="text-subtle">{r.label}</dt>
            <dd className="text-foreground">{r.value}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[6rem_1fr] gap-4 text-base">
          <dt className="text-subtle">Stack</dt>
          <dd className="flex flex-wrap gap-1.5">
            {currently.stack.map((name) => <StackIcon key={name} name={name} size={12} />)}
          </dd>
        </div>
      </dl>
    </Section>
  );
}
```

- [ ] **Step 4: Swap it in**

Delete `components/Activity.tsx` and `components/TechStack.tsx`. In `app/page.tsx` replace `import TechStack…` and `import Activity…` with `import Currently from "@/components/Currently";` and replace `<TechStack />` and `<Activity />` with `<Currently />`. In `data/agent-memory.md` change "Grouped the same four ways the site's Toolkit section groups them, so an answer here matches what a visitor is looking at." to "Grouped four ways for answers; the homepage shows the everyday stack under Currently."

Run: `grep -rn "TechStack\|Activity" app components lib | grep -v node_modules`
Expected: no imports of the deleted components remain (a comment in `stackLabels.ts` may mention TechStack; update it to say "the Currently stack row").

- [ ] **Step 5: Verify**

Run: `npx vitest run && npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh`
Expected: all pass. Browser: Building, Reading (linked), Stack chips.

- [ ] **Step 6: Commit**

```bash
git add -A lib/currently.ts lib/home.ts lib/home.test.ts components/Currently.tsx components/Activity.tsx components/TechStack.tsx app/page.tsx data/agent-memory.md components/common/stackLabels.ts
git commit -m "feat(home): Currently replaces Toolkit and Now

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: FAQ, minimal

**Files:**
- Modify: `components/Faq.tsx`

- [ ] **Step 1: Restyle, keep behaviour and JSON-LD**

Keep the `<script type="application/ld+json">` exactly as is. Replace the `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` class names with:

```tsx
<Accordion type="single" collapsible defaultValue="faq-0" className="space-y-1">
  {faqs.map((f, i) => (
    <AccordionItem key={f.q} value={`faq-${i}`} className="border-0">
      <AccordionTrigger className="py-3 text-left text-base font-medium text-foreground hover:no-underline">
        {f.q}
      </AccordionTrigger>
      <AccordionContent className="pb-4 text-base leading-relaxed text-muted-foreground">
        {f.a}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

Remove the now-unused `tiltMd, tint` import.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh && npx vitest run`
Expected: all pass. Browser: first answer open, others expand on click, no card border. `curl -s http://localhost:3001/ | grep -c FAQPage` returns `1`.

- [ ] **Step 3: Commit**

```bash
git add components/Faq.tsx
git commit -m "feat(home): minimal FAQ rows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Closing (replaces Contact)

**Files:**
- Create: `components/Closing.tsx`
- Delete: `components/Socials.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Closing.tsx`**

```tsx
import Container from "@/components/layout/Container";
import CardNudge from "@/components/CardNudge";
import { SOCIAL_ICONS } from "@/components/common/socialIcons";
import { socialLinks, contactEmail } from "@/lib/siteLinks";

/** The page's last word: one line, the address, the three profiles. */
export default function Closing() {
  return (
    <section id="contact">
      <Container width="reading" className="py-14 md:py-20">
        <p className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">Let&apos;s build something good.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity duration-base ease-out hover:opacity-90"
          >
            {contactEmail}
          </a>
          <CardNudge />
        </div>
        <ul className="mt-6 flex gap-5 text-sm text-muted-foreground">
          {socialLinks.map(({ name, href }) => {
            const Icon = SOCIAL_ICONS[name];
            return (
              <li key={name}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors duration-fast ease-out hover:text-foreground">
                  <Icon aria-hidden className="h-4 w-4" /> {name}
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Swap it in**

Delete `components/Socials.tsx`. In `app/page.tsx` replace the `Socials` import and `<Socials />` with `Closing`; keep its preceding comment but reword "Last section on the page" to "The closing line". Confirm the final order in `app/page.tsx` is `About, ExperienceWork, Projects, Currently, Faq, Closing, LaunchNudge, ChatBotMount`.

Run: `grep -rn "Socials" app components | grep -v node_modules`
Expected: no remaining imports.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint && ./scripts/verify-simplification.sh && npx vitest run`
Expected: all pass. Anything linking to `/#contact` still lands on the closing block.

- [ ] **Step 4: Commit**

```bash
git add -A components/Closing.tsx components/Socials.tsx app/page.tsx
git commit -m "feat(home): closing line replaces Contact

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Docs, rules and final check

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/design-system.md`
- Modify: `.claude/skills/design-system/SKILL.md`

- [ ] **Step 1: CLAUDE.md**

- In "Rails and bands": delete every sentence about `Rails` (the component, "rendered ONCE", the per-page ban). Keep the `Band`/`PageBand` sentences, prefixed with "Until phase 2 (see docs/superpowers/specs/2026-09-30-minimal-home-design.md):".
- In "Useful entry points": replace the homepage composition sentence with: "Homepage layout composition: `app/page.tsx` → `<About>`, `<ExperienceWork>`, `<Projects>`, `<Currently>`, `<Faq>`, `<Closing>`. Sections use `Section` with a plain `label` and `title`, separated by whitespace only: no bands, no rules, no numbering."
- Add under "Other conventions": "**Candy is disabled** by `CANDY_ENABLED = false` in `lib/theme.ts`. Its styles stay; flip the flag (and update verify check C18) to bring it back." and "**Intro ticker**: `components/common/StatsTicker.tsx` reads `tickerStats` from `lib/stats.ts`; its loop length is `duration.ticker` / `--duration-ticker`." and "**Margin notes**: `lib/marginNotes.ts`, three at most, keyed by the row id."

- [ ] **Step 2: Design-system doc and skill**

In both `docs/design-system.md` and `.claude/skills/design-system/SKILL.md`: remove `Rails` from the layout-primitives table; change the "Section pattern" example to `<Section label="Work" title="…">` with the note "No `number`/`of`; no band"; add one line each for `StatsTicker` and `MarginNote`; note Candy is disabled.

- [ ] **Step 3: Final verification**

Run: `./scripts/verify-simplification.sh && npx tsc --noEmit && npm run lint && npx vitest run`
Expected: all pass.

In the browser (dev server), light and dark, 1440px and 390px: `/` top to bottom, `/shelf` (uses `Section`), `/work/shopos` (rails gone, nothing misaligned). Reduced motion: ticker static. Theme toggle cycles light ↔ dark only; set `localStorage.theme = "candy"`, reload: system theme applies.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/design-system.md .claude/skills/design-system/SKILL.md
git commit -m "docs: minimal home conventions, Candy flag, no rails

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
