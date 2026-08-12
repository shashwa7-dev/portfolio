# Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Experience section read as a credential rather than a logo strip, fix the blog index's broken-at-one-post layout, and consolidate structured data so crawlers resolve one entity instead of many.

**Architecture:** Three independent groups. Group A restructures `components/ExperienceWork.tsx` around a vertical rail and moves the brand logos inside the org that earned them, backed by a new structured employment period in `lib/workData.ts`. Group B rewrites `components/BlogPosts.tsx` as a list and adds reading time. Group C consolidates every JSON-LD emitter into `lib/seo.ts` and gives the Person and WebSite nodes stable `@id` anchors. Nothing in B or C depends on A.

**Spec:** `docs/superpowers/specs/2026-08-12-phase-2-chanhdai-pickups-design.md`. Read it before Task 1; it records why several of these choices are what they are, including one label whose exact wording is load-bearing.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind 3.4, `date-fns` 3.6 (already installed, do not add dependencies).

## Global Constraints

- No em-dashes in user-facing copy. Date ranges use the ASCII hyphen.
- No literal easings or durations in components. Use `duration-fast|base|med|slow` and `ease-out`, which resolve to the CSS custom properties, or import from `lib/motionVariants.ts`.
- Never write a bare `transition-[...]` without an accompanying `ease-out`. An arbitrary-value transition utility emits only `transition-property`, so it contributes no timing function and silently falls back to the browser default.
- No arbitrary type sizes. Use the `tailwind.config.ts` scale (`text-2xs` .. `text-4xl`).
- The brand strip's label is exactly `Worked with`. Do not strengthen it to "Shipped with", "Clients", or "Launch partners"; see spec section A2 for why that wording is a factual matter, not a style choice.
- Do not remove any entry from `lib/clients.ts`.
- `npm run build`, `npm run lint`, `npx tsc --noEmit` and `./scripts/verify-simplification.sh` must all pass before a task is done.
- `scripts/verify-simplification.sh` must be run from the repo root; it aborts otherwise.

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `components/Clients.tsx` | deleted | 1 |
| `components/MetaContent.tsx` | deleted (dead code) | 1 |
| `lib/clients.ts` | add `org` field; keep all five entries | 1 |
| `components/common/ClientStrip.tsx` | new; brand strip for one org | 1 |
| `lib/tenure.ts` | new; period formatting and tenure arithmetic | 2 |
| `lib/workData.ts` | `period` replaces `duration`; add `skills` | 2 |
| `components/ExperienceWork.tsx` | rail, `dl` metadata, tags, strip mount | 2 |
| `app/work/[org]/page.tsx` | consume `formatPeriod` | 2 |
| `app/markdown/route.ts` | consume `formatPeriod`; drop em-dashes | 2 |
| `app/work/[org]/markdown/route.ts` | consume `formatPeriod` | 2 |
| `lib/readingTime.ts` | new; code-stripped word count | 3 |
| `components/BlogPosts.tsx` | single-column list; `next/image`; motion tokens | 3 |
| `app/blogs/[slug]/page.tsx` | reading time, prev/next, call `blogPostingLd` | 4, 5 |
| `lib/seo.ts` | `@id` anchors, `blogPostingLd`, `blogLd`, `breadcrumbLd`, `profilePageLd` | 5 |
| `app/blogs/page.tsx` | `Blog` node + canonical | 5 |
| `app/page.tsx` | `ProfilePage` node | 5 |

---

## Task 1: Retire the standalone brand row

**Files:**
- Delete: `components/Clients.tsx`, `components/MetaContent.tsx`
- Modify: `lib/clients.ts`, `components/ExperienceWork.tsx`
- Create: `components/common/ClientStrip.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ClientStrip` with props `{ orgSlug: string }`, default export. Task 2 mounts it inside the rail.

- [ ] **Step 1: Prove both deletions are safe**

```bash
grep -rn "components/Clients\|<Clients\|from \"./Clients\"" app components lib
grep -rn "MetaContent" app components lib | grep -v "components/MetaContent.tsx"
```

Expected: the first prints only `components/ExperienceWork.tsx` (an import and a call) and `components/MetaContent.tsx`. The second prints nothing. If either prints anything else, stop and report: the plan's assumption is wrong.

Do **not** grep for `lib/clients` and delete it. It is load-bearing for `app/markdown/route.ts`.

- [ ] **Step 2: Add the owning org to each client**

In `lib/clients.ts`, add to the type and to all five entries. The value is an org slug from `lib/workData.ts`.

```ts
export type Client = {
  name: string;
  img: string;
  link: string;
  contribution: string;
  /** Slug of the organisation this work happened under (see lib/workData.ts). */
  org: string;
};
```

Every entry gets `org: "dehidden"`. Do not reorder, rename, or remove entries; the order (Coinbase, Polygon, Play AI, Nodeops, Sentient) is deliberate.

- [ ] **Step 3: Create the strip**

```tsx
import Image from "next/image";
import { clients } from "@/lib/clients";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

/**
 * The brands worked with under one organisation, rendered inline on that org's
 * Experience entry. Returns null when nothing matches, so callers can mount it
 * unconditionally the way `EmploymentTag` already does.
 *
 * Three things here are deliberate and easy to get wrong:
 *
 * 1. The label is "Worked with", matching what `app/markdown/route.ts` already
 *    publishes. A stronger phrasing would assert a partner relationship, and at
 *    least one of these entries is a product line Dehidden builds rather than a
 *    third-party client. See the spec's A2 section.
 * 2. The separating ring is `ring-background`, not the `ring-card` used by the
 *    same avatar idiom in `About.tsx`. There the avatars sit on a bento tile; here
 *    they sit on the page background, and copying `ring-card` puts a faintly
 *    wrong-coloured halo around each logo.
 * 3. Greyscale by default, colour on hover. Five brand palettes at full
 *    saturation are what made four earlier ornamental treatments of this row fail
 *    on a deliberately hueless page. Removing the colour and giving it back as a
 *    hover reward solves it from the other direction.
 */
export default function ClientStrip({ orgSlug }: { orgSlug: string }) {
  const owned = clients.filter((c) => c.org === orgSlug);
  if (owned.length === 0) return null;

  return (
    <div className="group flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="font-mono text-2xs uppercase tracking-label text-subtle">
        Worked with
      </span>

      <span className="flex items-center">
        {owned.map((c, i) => (
          <Tooltip key={c.name}>
            <TooltipTrigger asChild>
              <span
                className={`relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-secondary outline outline-1 outline-border ring-2 ring-background ${
                  i > 0 ? "-ml-1" : ""
                }`}
              >
                <Image
                  src={c.img}
                  alt={c.name}
                  fill
                  sizes="20px"
                  className="object-cover grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>{c.contribution}</TooltipContent>
          </Tooltip>
        ))}
      </span>

      <span className="min-w-0 text-xs text-muted-foreground">
        {owned.map((c, i) => (
          <span key={c.name}>
            {i > 0 && <span className="text-border-strong">, </span>}
            <a
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-base ease-out hover:text-foreground"
            >
              {c.name}
            </a>
          </span>
        ))}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Unmount the old row**

Delete both files. In `components/ExperienceWork.tsx`, remove the `import Clients from "@/components/Clients"` line, the `<Clients />` call, and the block comment above it that explains the credential strip. Leave the rest of the file alone; Task 2 rewrites it.

- [ ] **Step 5: Verify**

```bash
npm run lint && npx tsc --noEmit && npm run build && ./scripts/verify-simplification.sh
```

Expected: all clean. The strip is not mounted anywhere yet, so the Experience section renders without any brand logos at this point. That is correct for this task.

Also confirm the markdown rendition is untouched:

```bash
grep -c "Worked with" app/markdown/route.ts
```

Expected: `1`.

- [ ] **Step 6: Commit**

```bash
git add -A components lib
git commit -m "refactor(experience): retire the standalone brand row"
```

---

## Task 2: Rail hierarchy, structured periods, role tags

**Files:**
- Create: `lib/tenure.ts`
- Modify: `lib/workData.ts`, `components/ExperienceWork.tsx`, `app/work/[org]/page.tsx`, `app/markdown/route.ts`, `app/work/[org]/markdown/route.ts`

**Interfaces:**
- Consumes: `ClientStrip` from Task 1.
- Produces: `TPeriod`, `formatPeriod`, `formatTenure`, `isCurrent` from `lib/tenure.ts`; `TOrganization.period` and `TOrganization.skills` in `lib/workData.ts`.

- [ ] **Step 1: Write the tenure module**

```ts
import { differenceInMonths, parse } from "date-fns";

/** An employment period. "MM.YYYY". Omit `end` to mean present. */
export type TPeriod = { start: string; end?: string };

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toDate(v: string): Date {
  return parse(v, "MM.yyyy", new Date());
}

function label(v: string): string {
  const [mm, yyyy] = v.split(".");
  return `${MONTHS[Number(mm) - 1]} ${yyyy}`;
}

export function isCurrent(period: TPeriod): boolean {
  return period.end === undefined;
}

/** "Jan 2022 - Dec 2025" or "Jan 2026 - Present". ASCII hyphen, no em-dash. */
export function formatPeriod(period: TPeriod): string {
  return `${label(period.start)} - ${period.end ? label(period.end) : "Present"}`;
}

/**
 * "4y", "3y 11m", "8m", or "" when the span is not positive.
 *
 * Months are counted inclusively of both endpoints, so Jan 2022 to Dec 2025 is
 * 48 months rather than 47. The empty-string return is deliberate: a
 * transposed date in `workData.ts` then renders as nothing instead of as
 * "-1y", which would look like a bug on the page rather than in the data.
 */
export function formatTenure(period: TPeriod): string {
  const months =
    differenceInMonths(
      period.end ? toDate(period.end) : new Date(),
      toDate(period.start)
    ) + 1;

  if (months <= 0) return "";
  if (months < 12) return `${months}m`;

  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years}y` : `${years}y ${rest}m`;
}
```

- [ ] **Step 2: Migrate the data**

In `lib/workData.ts`, replace `duration: string` on `TOrganization` with `period: TPeriod` (import the type), and add `skills?: string[]`. Then convert the three orgs:

- ShopOS: `period: { start: "01.2026" }`
- Dehidden: `period: { start: "01.2022", end: "12.2025" }`
- Cope.Studio: `period: { start: "01.2022", end: "03.2022" }`

Give each org a `skills` array drawn from the stacks its own projects already declare, so the tags are supported by data rather than invented. Keep each list to at most six entries; a tag row longer than one line stops being scannable.

- [ ] **Step 3: Run the type checker to find every consumer**

```bash
npx tsc --noEmit
```

Expected: FAIL, with errors at `components/ExperienceWork.tsx` (2), `app/work/[org]/page.tsx` (1), `app/markdown/route.ts` (3), `app/work/[org]/markdown/route.ts` (2). Eight call sites in four files. If the count differs, reconcile before continuing rather than fixing errors one at a time.

- [ ] **Step 4: Fix the non-component consumers**

Replace each `org.duration` with `formatPeriod(org.period)`, and replace both `duration.includes("Present")` tests with `isCurrent(org.period)`. In `app/work/[org]/markdown/route.ts`, the `serializeOrg` parameter stays a plain `string`; pass `formatPeriod(org.period)` at the call site.

While in `app/markdown/route.ts`, replace the two em-dashes with a colon and a period respectively (lines 44 and 79 today). They violate the repo's no-em-dash rule and this is the one commit that already touches the file.

- [ ] **Step 5: Rebuild the org entry around a rail**

Rewrite the `organizations.map` body in `components/ExperienceWork.tsx`. The structure is: identity row at the top level, everything else inside a rail wrapper.

```tsx
<div key={org.id} className="pb-12 last:pb-0">
  {/* Identity. gap-3 is required, not cosmetic: a 24px logo plus a 12px gap
      puts the org name at 36px, which is exactly where the rail's `pl-9`
      children land. At the previous gap-2.5 the name sat two pixels left of
      everything hanging below it. */}
  <div className="flex items-center gap-3">
    <Link href={`/work/${org.slug}`} className="group/orglink flex min-w-0 items-center gap-3">
      <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-elevated ring-1 ring-border">
        <Image
          src={org.logo}
          alt={org.name}
          fill
          sizes="24px"
          className="object-cover grayscale transition-[filter] duration-base ease-out group-hover/orglink:grayscale-0"
        />
      </span>
      <h3 className="truncate text-lg font-semibold text-foreground/90 transition-colors duration-base ease-out group-hover/orglink:text-foreground">
        {org.name}
      </h3>
    </Link>
    {current && <CurrentDot />}
  </div>

  {/* Rail. The line is a pseudo-element because it has to span whatever the
      content turns out to be tall. */}
  <div className="relative pl-9 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border">
    {/* ...metadata, tags, strip, highlights, links, CTA, projects... */}

    {/* The elbow. You cannot shorten a full-height pseudo-element, so the
        straight tail is masked by a box painted in the page background and the
        curve is drawn inside it. This depends on the mask matching the page
        exactly, so check both themes. */}
    <span aria-hidden className="pointer-events-none absolute bottom-0 left-3 flex h-4 w-4 bg-background">
      <span className="h-full w-full -translate-y-2 -translate-x-px rounded-bl-md border-b border-l border-border" />
    </span>
  </div>
</div>
```

Inside the rail, in this order: the `dl` metadata row, the tag row, `<ClientStrip orgSlug={org.slug} />`, the highlight bullets, the org link chips, the deep-dive `MarkerLink`, then the featured-projects block. The strip sits above the bullets because it is a fact about the engagement, not an outcome.

The metadata row becomes a real description list:

```tsx
<dl className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
  <dt className="sr-only">Role</dt>
  <dd>{org.role}</dd>
  <dd><EmploymentTag employment={org.employment} /></dd>
  <dt className="sr-only">Employment period</dt>
  <dd className="font-mono text-xs tabular-nums text-subtle">{formatPeriod(org.period)}</dd>
  <dt className="sr-only">Duration</dt>
  <dd className="font-mono text-xs tabular-nums text-subtle">{formatTenure(org.period)}</dd>
</dl>
```

Render a separator between the period and the tenure only when `formatTenure` returns a non-empty string, so an empty tenure does not leave a dangling middot.

Keep the "Currently building" badge exactly as it is today, including the emerald dot and its comment. Do not add `animate-ping`; the spec records why.

Reuse `OrgLinkChip`'s pill shape for the skill tags. If the two end up identical, extract a shared `Tag` in `components/common/OrgChips.tsx` and have both call it; if they differ, leave them separate rather than forcing a shared abstraction.

- [ ] **Step 6: Verify**

```bash
npm run lint && npx tsc --noEmit && npm run build && ./scripts/verify-simplification.sh
grep -rn "\.duration" app components lib | grep -v "duration-\|--duration\|motionVariants\|transition"
curl -s -H "Accept: text/markdown" localhost:3000/ | grep -A6 "## Experience"
```

Expected: gates clean; the grep returns nothing; the markdown rendition still shows each org with a period. Confirm the tenure on Dehidden reads `3y 12m` or `4y` and not something absurd, and that the elbow renders in both light and dark.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(experience): rail hierarchy, computed tenure, role tags"
```

---

## Task 3: Blog index as a list

**Files:**
- Create: `lib/readingTime.ts`
- Modify: `components/BlogPosts.tsx`

**Interfaces:**
- Produces: `readingTime(content: string): number` returning whole minutes, minimum 1.

- [ ] **Step 1: Write the reading-time helper**

```ts
/**
 * Whole minutes to read, at 200 words per minute, minimum 1.
 *
 * Fenced and inline code are stripped before counting. The one post in the repo
 * is 696 raw words across eight sections, much of it code samples, and counting
 * code inflates the estimate for exactly the posts a reader skims rather than
 * reads word by word.
 */
export function readingTime(content: string): number {
  const prose = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]*`/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
```

- [ ] **Step 2: Rewrite the index as a list**

Replace `grid gap-4 sm:grid-cols-2` with a single-column list. At one post the grid renders a card beside an empty column, which reads as a broken page; a list is correct at one post or fifty.

Each row is horizontal: a fixed-width thumbnail on the left, then title, then a metadata line of date and reading time, then the summary, then the tags. Fixing the thumbnail width keeps rows uniform regardless of title length. Stack to vertical below `sm`.

Three fixes carried in the same rewrite:

1. Convert the raw `<img>` to `next/image` with a `sizes` matching the thumbnail's real rendered width, and delete the `@next/next/no-img-element` suppression above it.
2. Give every transition `duration-base ease-out`. The current card has `transition-[transform,border-color] duration-300` with no easing class at all, so it runs on the browser's default curve.
3. Apply `grayscale transition-[filter] duration-base ease-out group-hover:grayscale-0` to the thumbnail, matching the treatment Task 1 gives the brand logos and Task 2 gives the org logos.

- [ ] **Step 3: Verify**

```bash
npm run lint && npx tsc --noEmit && npm run build && ./scripts/verify-simplification.sh
grep -c "no-img-element" components/BlogPosts.tsx
grep -c "duration-300" components/BlogPosts.tsx
```

Expected: gates clean, both greps return `0`. Confirm the reading time on the existing post is a small plausible number and not a code-inflated one.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refine(blog): single-column index, reading time, next/image"
```

---

## Task 4: Reading time and neighbours on a post

**Files:**
- Modify: `app/blogs/[slug]/page.tsx`

**Interfaces:**
- Consumes: `readingTime` from Task 3.

- [ ] **Step 1: Add reading time to the post header**

Render it beside the existing `formatDate` line, separated by a middot in `text-border-strong`, matching the separator idiom used elsewhere in the app.

- [ ] **Step 2: Add prev/next**

Sort posts by `publishedAt` descending, find the current index, and render links to the neighbours at the end of the article. Render nothing where a neighbour does not exist, and render the whole block conditionally so a single-post blog emits no empty container.

- [ ] **Step 3: Verify**

```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: clean. **At one post this renders nothing visible.** That is correct, not a failure. Confirm the post page has no empty bordered block at the bottom.

- [ ] **Step 4: Commit**

The commit body must state that prev/next renders nothing today so a reviewer does not read it as a visible improvement.

```bash
git add -A
git commit -m "feat(blog): reading time and post neighbours"
```

---

## Task 5: Consolidate structured data

**Files:**
- Modify: `lib/seo.ts`, `app/blogs/[slug]/page.tsx`, `app/blogs/page.tsx`, `app/page.tsx`, `app/books/[slug]/page.tsx`, `app/work/[org]/page.tsx`, `app/work/[org]/[project]/page.tsx`, `app/project/[slug]/page.tsx`

**Interfaces:**
- Produces: `JSON_LD_ID`, `blogPostingLd`, `blogLd`, `breadcrumbLd`, `profilePageLd` from `lib/seo.ts`.

- [ ] **Step 1: Add stable `@id` anchors**

```ts
/**
 * Stable fragment ids so a crawler can merge nodes emitted from separate
 * <script> blocks and separate pages into one entity. Without them, each
 * page's Person block is an unrelated object rather than another reference to
 * the same person.
 */
export const JSON_LD_ID = {
  person: `${baseUrl}#person`,
  website: `${baseUrl}#website`,
} as const;
```

Give `personLd()` its `@id`, give `websiteLd()` its `@id` plus a `publisher` referencing `{ "@id": JSON_LD_ID.person }`, and replace the inline `author: { "@type": "Person", name: ... }` objects in `softwareAppLd` and the new `blogPostingLd` with `{ "@id": JSON_LD_ID.person }`.

- [ ] **Step 2: Move `BlogPosting` into `lib/seo.ts`**

Add `blogPostingLd(post)` reproducing the block currently inlined at `app/blogs/[slug]/page.tsx:65-86` exactly, apart from the author reference from Step 1. Have the page call it. This is a move, not a redesign: the emitted JSON should be unchanged except for `author`.

- [ ] **Step 3: Add `blogLd` and wire the index**

`app/blogs/page.tsx` currently emits no JSON-LD and declares no canonical. Add a `Blog` node whose `blogPost` array lists the posts, and add `alternates: { canonical }` to its metadata, which every other route already sets.

- [ ] **Step 4: Add `breadcrumbLd` and emit it**

```ts
export function breadcrumbLd(trail: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
```

Emit it from `/blogs/[slug]`, `/books/[slug]`, `/work/[org]`, `/work/[org]/[project]` and `/project/[slug]`, following the `<script type="application/ld+json" suppressHydrationWarning>` pattern already in `app/blogs/[slug]/page.tsx`. Each trail starts at the site root and ends at the current page.

- [ ] **Step 5: Add `ProfilePage` to the homepage**

A `ProfilePage` node whose `mainEntity` is `{ "@id": JSON_LD_ID.person }`. The homepage is the entity page for a portfolio and currently does not say so.

- [ ] **Step 6: Verify every block still parses**

```bash
npm run build && npm run lint && npx tsc --noEmit && ./scripts/verify-simplification.sh
npm run dev &
for u in / /blogs /blogs/truffy-agent /books /projects /work/shopos; do
  echo "--- $u"
  curl -s "localhost:3000$u" | grep -o '<script type="application/ld+json"[^>]*>[^<]*' | sed 's/.*>//' | while read -r j; do
    echo "$j" | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8")); console.log("ok")'
  done
done
```

Expected: every block prints `ok`. Then confirm by eye that the `@id` values on the homepage's Person node and a post page's author reference are the same string.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(seo): consolidate structured data, stable entity ids, breadcrumbs"
```

---

## Self-review notes

Checked against the spec before handing this over:

- **Spec coverage.** A1 and A2 are Task 1; A3, A4 and A5 are Task 2; B1 to B4 are Task 3; B5 is Task 4; C1 to C4 are Task 5. The spec's "Noticed but not folded in" items are correctly absent.
- **The one deliberate deviation.** The spec proposed three commits, one per group. This plan produces five, because Group A splits cleanly at a point where the tree still builds and Group B's post-page changes are independently reviewable. Five small commits is easier to review than three large ones; if a single commit per group is wanted, squash at the end rather than deferring the verification gates.
- **Ordering constraint.** Task 2 must follow Task 1, because it mounts `ClientStrip`. Task 4 must follow Task 3, because it imports `readingTime`. Tasks 3 and 5 are independent of Group A entirely.
- **Known-fragile step.** The rail elbow in Task 2 Step 5 is the only piece whose correctness cannot be established from the diff, because it depends on a masking box matching the page background in both themes. It needs a real look in light and dark.
