# Org Diary / Log Page Design

**Date:** 2026-05-28
**Status:** Approved (pending user review of this written spec)
**Scope:** ShopOS-first, designed to be reused for any org

---

## Goal

Replace the boilerplate 3-bullet ShopOS entry in `#experience` with **3 punchy one-liners + a "Read the diary →" CTA**, and add a new route `/work/[org]/log` that hosts the long-form contributions log ("Diary"). The page is org-agnostic so other orgs (Dehidden, future) can adopt it by adding a record to a new data file — no code changes required.

## Non-goals

- Monthly changelog format. Entries are ordered by importance, with a loose date anchor per entry for context.
- Real business metrics. Impact statements are qualitative. No %, no counts, no revenue language. The author is bound by contract and treats ShopOS internal numbers as confidential.
- Project cards under ShopOS. `TOrganization.projects` stays `[]`. The diary is the depth surface.
- Public listing index (`/work` or `/diary` root). Out of scope for this iteration.

## Disclosure constraints (NDA)

Public surface area for ShopOS work:
- ✅ User-facing features in the live product (Skills Library, Canvas Builder, Spaces, Brand Memory, chat, media carousel, Enterprise dashboard).
- ✅ Public tech stack (Next.js, React, TypeScript, Tailwind, shadcn, Playwright, React Query, Zustand, Turborepo, tiptap, Clerk, PostHog).
- ❌ Internal agent codenames (e.g. "Gavin", "Monica" / "Performance Marketing" + "Creative Director" agent split).
- ❌ Orchestration / runtime internals (Mastra, NDJSON streaming patterns, monotonic execution counters, bridge cards, fatigue detection, catalog overlay slot mechanics).
- ❌ Unreleased PRDs or pre-launch features.
- ❌ Business KPIs, customer names, internal team metrics.

All copy below has been written against this rule. Any future addition to `diaryData.ts` must pass the same check.

---

## Route map (after this change)

| Route | Owner | Purpose |
|---|---|---|
| `/#experience` | `components/ExperienceWork.tsx` | 3 short bullets per org + diary CTA when a diary exists |
| `/work/[org]` | `app/work/[org]/page.tsx` (existing) | Header, key contributions = `org.highlights`, projects grid. Adds a "Read the diary →" CTA at the bottom when a diary exists. |
| `/work/[org]/log` | `app/work/[org]/log/page.tsx` (new) | Long-form contributions log ("Diary"). 404s if no diary record exists for the org. |

URL is `/log` (engineer's term, short, scannable). UI label everywhere is **"Diary"** (narrative, personal) — heading reads "Diary at ShopOS", CTAs read "Read the diary →". The URL/UI mismatch is intentional and matches common patterns (`/about` → "Our Team", `/blog` → "Writing").

---

## Data shape — `lib/diaryData.ts` (new)

```ts
import { StackName } from "@/components/common/StackIcon";

export type TDiaryEntry = {
  id: string;                  // slug, e.g. "enterprise-migration"
  title: string;               // "Enterprise dashboard in-app migration"
  summary: string;             // one-line elevator pitch
  date: string;                // "Apr 2026"  (required — every entry shows a date)
  context?: string;            // why it was needed (1-2 sentences, optional)
  contributions: string[];     // bullets of substance (3-6 per entry)
  impact?: string;             // qualitative outcome
  stack?: StackName[];         // tech chips reused from StackIcon
};

export type TOrgDiary = {
  org: string;                                          // slug — must match TOrganization.slug
  overview?: string;                                    // 1-2 paragraph intro
  featured: TDiaryEntry[];                              // 4-6 deep entries (full structure)
  other?: { title: string; summary: string; date?: string }[];  // lighter mentions
};

export const diaries: TOrgDiary[] = [ /* shopos record, see below */ ];

export function getDiary(slug: string): TOrgDiary | undefined {
  return diaries.find((d) => d.org === slug);
}
```

Why a separate file and not a `diary` field on `TOrganization`:
- Diary records are long; bundling them into `workData.ts` bloats the file used by every page.
- Diary is optional per org; the orthogonal split keeps both files focused.
- Importing `diaryData` only where needed keeps the home page lean.

---

## ShopOS diary content (the actual entries)

> All copy is final-draft, NDA-reviewed. The implementer should paste these verbatim unless the user requests edits during spec review.

### Overview

> Frontend consultant at ShopOS, an AI-native commerce platform. I owned merchant-facing surfaces across the AI agents, workflow authoring, and chat experience used to create, manage, market, and sell. Worked across the main app, the admin console, and the shared design-system package.

### Featured entries (5)

#### 01 · Enterprise dashboard in-app migration
- **date:** Apr 2026
- **summary:** Brought the Enterprise UI out of a separate iframe-hosted repo and into the main app as native routes.
- **context:** The Enterprise dashboard was a standalone project served inside the main product through an iframe. That meant separate auth, separate theme, separate deploy cadence, and a cross-origin wall that blocked any deeper UX integration.
- **contributions:**
  - Migrated routes and components from the standalone repo into the main Next.js app.
  - Unified auth so Enterprise inherits the same session and workspace context as the rest of the product.
  - Re-platformed the UI on the shared design system, removing a parallel set of styles and primitives.
  - Wired enterprise-aware routing so admins land on the right shell without per-feature flags.
- **impact:** One auth layer, one design system, no cross-origin tax. Faster loads and a real path to deeper UX for enterprise clients.
- **stack:** next.js, react, typescript, tailwind, react-query

#### 02 · Canvas Builder for visual workflow authoring
- **date:** May 2026
- **summary:** Drawer-based visual editor that lets non-engineers compose workflow templates without writing code.
- **context:** Workflow templates power large chunks of the product, but authoring them was an engineering-only task. Canvas Builder turns that into a visual surface.
- **contributions:**
  - Shipped v2 of the Canvas Builder: drawer-based form editor architecture, unified field schema across the form and the canvas.
  - Performance pass on the canvas runtime and a theme overhaul to bring it under the shared design system.
  - Reusable form-editor primitives now shared across the canvas and the admin console.
- **impact:** Non-engineers can author and iterate on workflow templates directly. Unified schema removed a class of drift between the canvas and the form editor.
- **stack:** next.js, react, typescript, tailwind, zustand

#### 03 · Content-rich chat input
- **date:** May 2026
- **summary:** Rebuilt the chat input on tiptap with slash commands, skill mentions, and structured serialization.
- **context:** The previous chat input was a fragile contenteditable that could not express anything richer than plain text. New flows (skills, structured commands, mentions) demanded a real editor.
- **contributions:**
  - Built a tiptap-based editor from the core extensions up: custom skill-tag node, slash-command extension, placeholder, serializer.
  - Wired it behind a feature flag, then enabled it by default after a stabilization pass.
  - Hardened keyboard handling (IME, accessibility), file validation, filename sanitization, and a toggle-race fix surfaced during code review.
- **impact:** Agent invocations and skill workflows are now first-class inside chat. Replaced a fragile editor with a structured one the team can extend.
- **stack:** react, typescript, tailwind, tiptap

#### 04 · Media carousel for AI asset review
- **date:** Jan 2026
- **summary:** Editing and reconciliation surface for AI-generated images, with a refine modal and hash-routed deep-linking.
- **context:** Merchants review and refine AI-generated assets every day. The surface had to support comments, refinements, and shareable deep links into a specific asset.
- **contributions:**
  - Built the media carousel: navigation, asset preview, refine modal, comment overlay.
  - Hash-routed deep-linking so a specific asset and modal state survives a reload or a shared link.
  - Wired the refine flow end-to-end with the modal lifecycle and the cleanup paths it required.
- **impact:** Core to the review-and-publish loop merchants run daily. Stable deep-linking made the surface easy to share and embed in other flows.
- **stack:** react, typescript, tailwind

#### 05 · Skills Library across two apps
- **date:** May 2026
- **summary:** End-to-end Skills Library in both the main app and the admin console.
- **context:** Skills extend agent capability. The product needed an authenticated surface to upload, preview, manage, and toggle skill packs in both the merchant app and the admin tooling, sharing as much as possible.
- **contributions:**
  - Types, API client, React Query hooks with optimistic updates.
  - Dialogs for upload, preview (with markdown + syntax highlighting), overwrite confirmation, delete.
  - Settings page integration in the main app; standalone Skills Library page in the admin console.
  - Hardened error handling, mobile layout, and a feature-flagged rollout.
- **impact:** A new product capability surface delivered end-to-end across two apps in one pass. Users can extend agent capability through uploaded skill packs.
- **stack:** next.js, react, typescript, tailwind, react-query

### Also shipped (lighter list)

- **Spaces module redesign** — three-tab layout, ownership-based view/edit, publish dialog improvements, mobile-responsive tabs, PostHog event coverage. *(May 2026)*
- **Modernized Playwright E2E suite** — testid-first locator strategy, page-object fixtures, agents test coverage, CI hardening. *(May 2026)*
- **Brand Memory preview** — preview surface for the workspace-level brand kit consumed by generation. *(Feb 2026)*
- **Onboarding V3 fixes** — fail-status logic, scroll bug, input-bug. *(Apr 2026)*
- **Pricing UI iteration** — multiple rounds of refinements and a cancellation-plan flow. *(Jan-Mar 2026)*
- **Pro-Admin Skills environment dropdown + chat-input slash-command dropdown fixes.** *(May 2026)*

---

## Inline change to `#experience` — `components/ExperienceWork.tsx`

Replace the current 3 boilerplate highlights for ShopOS in `lib/workData.ts` with:

```ts
highlights: [
  "Migrated the Enterprise dashboard from a separate iframe-hosted repo into the main app.",
  "Built Canvas Builder for visual workflow authoring and the content-rich tiptap chat input.",
  "Shipped the media carousel for AI asset review and the Skills Library across two apps.",
],
```

Below the highlights list (and above the "Featured projects" block when present), render a "Read the diary →" CTA, gated on `getDiary(org.slug)` being defined:

```tsx
{getDiary(org.slug) && (
  <div className="mt-3">
    <Link
      href={`/work/${org.slug}/log`}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-accent"
    >
      Read the diary <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
)}
```

The CTA only renders for orgs that have a diary, so this is a no-op for Dehidden until a diary is added for it.

## Inline change to `/work/[org]` — `app/work/[org]/page.tsx`

After the projects grid (or after Key contributions if there are no projects), render the same diary CTA when `getDiary(orgSlug)` is defined. Keeps the surfaces consistent.

---

## New page — `app/work/[org]/log/page.tsx`

### Structure

```tsx
export async function generateStaticParams() {
  // emit one slug per org that has a diary entry
  return diaries.map((d) => ({ org: d.org }));
}

export async function generateMetadata({ params }) {
  // "<Org> · Diary" + description "Long-form contributions log at <Org>"
}

export default async function OrgLogPage({ params }) {
  const { org: orgSlug } = await params;
  const org = getOrganization(orgSlug);
  const diary = getDiary(orgSlug);
  if (!org || !diary) notFound();

  return (
    <main className="py-16 md:py-24">
      <Container width="reading" className="space-y-12">
        <BackLink href={`/work/${orgSlug}`} label={`Back to ${org.name}`} />

        <Header org={org} />

        {diary.overview && <Overview text={diary.overview} />}

        <FeaturedSection entries={diary.featured} />

        {diary.other?.length ? <OtherShippedSection items={diary.other} /> : null}
      </Container>
    </main>
  );
}
```

### Header

Mirrors `/work/[org]` for visual continuity:

- 12×12 rounded logo
- `font-serif` h1 with org name + optional external-link icon
- `text-muted-foreground` line: role · duration
- `<h2>Diary</h2>` directly under, in mono uppercase tracking (matches the `Label` primitive used elsewhere)

### Overview

`Container width="reading"` paragraph in `text-muted-foreground`.

### Featured entry card

Reuses the design-system tokens. Visual chrome similar to the timeline cards in `ExperienceWork.tsx` so the page feels native to the rest of the portfolio.

```
┌─────────────────────────────────────────────────────────────┐
│  01 · Enterprise dashboard in-app migration   [Apr 2026]    │  ← mono numbered prefix, h3 serif title, mono date pill on the right
│  Summary line (one sentence, slightly larger, accent-hover) │
│                                                             │
│  Context                                                    │  ← only if `context` present
│  Plain paragraph in muted-foreground.                       │
│                                                             │
│  Contributions                                              │
│  • bullet                                                   │
│  • bullet                                                   │
│  • bullet                                                   │
│                                                             │
│  Impact                                                     │  ← only if `impact` present
│  Accent-tinted paragraph (`text-accent-hover`) for emphasis.│
│                                                             │
│  [next.js] [react] [typescript] …                           │  ← StackIcon row, optional
└─────────────────────────────────────────────────────────────┘
```

- The numbered prefix (`01 ·`, `02 ·`, …) is computed from array index, so reordering entries doesn't desync numbers.
- The date pill uses the same `font-mono text-xs tabular-nums text-subtle` style as the timeline durations.
- "Context", "Contributions", "Impact" labels use the existing `Label` primitive (mono, uppercase, tracking-wide).

### "Also shipped" section

Lighter visual weight: no card chrome. A vertical list, each row = title + optional date + summary. Same accent-dot bullet motif as `org.highlights`.

---

## Visual tokens (reuses design system)

- `Container width="reading"` for the page width.
- `Label` for section heads and field labels inside cards.
- Bullet dot: `mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60` (matches `/work/[org]`).
- Card surface: `rounded-2xl border border-border bg-elevated/40 p-6` (consistent with other cards in the portfolio).
- Mono date pill: `font-mono text-[10px] uppercase tracking-[0.12em] text-subtle` (matches the "Featured projects" label in the timeline).
- StackIcon for tech chips.

No new primitives required.

---

## Reusability

The whole feature is org-agnostic:

- `/work/[org]/log` reads from `getDiary(slug)`. Any org slug that has a diary record renders.
- The CTA in `#experience` and in `/work/[org]` is gated on `getDiary(slug)`. Orgs without a diary see no CTA.
- Adding a diary for Dehidden later = append a `TOrgDiary` to `diaries[]`. Zero code changes.

---

## Out of scope (future)

- Per-entry screenshot / media gallery.
- Filtering / search on the log page.
- A top-level `/work` or `/diary` index listing all org diaries.
- RSS or JSON feed for the diary.

---

## File changes summary

| File | Change |
|---|---|
| `lib/diaryData.ts` | **New.** Types + `diaries[]` + `getDiary()`. Seed with ShopOS record from this spec. |
| `lib/workData.ts` | Rewrite the `highlights` array for the `shopos` org (3 one-liners). |
| `components/ExperienceWork.tsx` | Render diary CTA below highlights when `getDiary(org.slug)` exists. |
| `app/work/[org]/page.tsx` | Render diary CTA at the bottom when `getDiary(orgSlug)` exists. |
| `app/work/[org]/log/page.tsx` | **New.** Page component as described above. |
| `app/work/[org]/log/components/*` | Small, focused per-section components (`Header`, `Overview`, `FeaturedEntryCard`, `OtherShippedList`). Keep each ≤ 100 LOC. |

## Open questions

None. All design choices have been confirmed during brainstorming:
- Route: `/work/[org]/log`
- UI label: "Diary"
- Date anchors: on every entry
- Disclosure level: public features only
- Inline scope: 3 one-liner bullets
