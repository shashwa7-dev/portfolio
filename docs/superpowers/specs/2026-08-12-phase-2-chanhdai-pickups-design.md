# Phase 2: experience hierarchy, blog list, structured data

**Date:** 2026-08-12
**Supersedes:** `docs/superpowers/specs/phase-2-backlog.md` (that file's rejections still bind; see "Still rejected")

**Goal:** Make the Experience section read as a credential rather than a logo strip, fix the blog index's broken-at-one-post layout, and consolidate structured data so search engines resolve one entity instead of many.

**Reference:** `github.com/ncdai/chanhdai.com`, read at commit depth 1 on 2026-08-12. Reference only. Every item below cites the file it came from so a reviewer can check the original intent. Nothing here is a copy-the-design task.

**Tech stack:** Next.js 14 App Router, TypeScript, Tailwind 3.4, `motion`, `date-fns` 3.6 (already a dependency).

---

## Global Constraints

- No em-dashes in user-facing copy. Date ranges use the ASCII hyphen, matching the existing `"Jan 2026 - Present"` strings.
- No literal easings or durations in components. Import from `lib/motionVariants.ts`, or use the Tailwind motion scales (`duration-fast|base|med|slow`, `ease-out`) that resolve to the CSS custom properties.
- No arbitrary `text-[Npx]`. Use the `tailwind.config.ts` type scale (`text-2xs` .. `text-4xl`).
- `scripts/verify-simplification.sh` must exit 0. `npm run build`, `npm run lint` and `npx tsc --noEmit` must all pass.
- Any change to a portfolio fact requires the same-change update to `data/agent-memory.md` (see the agent-memory rule in `CLAUDE.md`). Group A changes structure, not facts, so no memory update falls out of it. Confirm this rather than assuming it.
- Page padding on any `<main>` stays `py-8 md:py-12`.
- Motion added by this spec must clear the frequency gate in `.claude/skills/emil-design-eng`: under 300ms, `ease-out`, no ambient loops.

---

## Group A: the Experience section

### The problem

Five distinct faults, only two of them cosmetic.

1. **`components/Clients.tsx` is logo soup.** Five equal-weight 84px cards, each a `bg-card` box containing a `ring-1` tile, so it is a box inside a box: ten hairlines in a row. It reads as a SaaS "our partners" footer strip.
2. **Those logos are full colour** on a page whose premise is hueless. This is the root cause of the four ornamental treatments that were tried and reverted (vinyl, brass plaques, gallery frames, postage stamps): each needed fixed non-palette colour to read as a physical object. Meanwhile `components/About.tsx:118` already greyscales the same brand avatars, so the big row contradicts its own site.
3. **The strongest fact is trapped in a hover.** `client.contribution` exists only inside a `TooltipContent`, which is unreachable on touch and undiscoverable on desktop.
4. **Org entries have no hierarchy.** Each emits seven stacked blocks (identity, role and tags, links, bullets, deep-dive CTA, a "Featured projects" header, a card grid) separated from the next org by nothing but `pb-12`. Nothing marks where ShopOS ends and Dehidden begins.
5. **The proof line repeats the hero.** "Shipped for 5 brands · 100K day-one mints · 1M+ users reached" restates two numbers already in the About bento two sections above.

### A1. Delete the standalone brand row

- Delete `components/Clients.tsx`.
- Delete `components/MetaContent.tsx`. It is dead code: nothing imports it, and it was the only other mount point for `<Clients />`. Verify with a repo-wide search before deleting, not from this spec's word.
- Remove the import and the `<Clients />` call from `components/ExperienceWork.tsx`.
- **`lib/clients.ts` stays.** `app/markdown/route.ts:78` composes the "## Worked with" section of the homepage's `text/markdown` rendition from it. Deleting the data would silently drop a section from the agent-facing rendition.
- The proof line goes with the component. Both figures survive in the About bento.

### A2. Brands attach to the org that earned them

Add `org: string` to the `Client` type, holding the owning organisation's slug.

Direction matters. Pointing the brand at the org (rather than listing brand names on the org) keeps one source of truth per brand and makes a typo a type error at the call site instead of a silently empty list.

**Blocked on a factual question before any copy is written.** The strip's label makes a claim about a relationship, and two of the five entries in `lib/clients.ts` do not survive checking:

- **Coinbase, Polygon, Sentient: confirmed.** `lib/workData.ts` states "Partnered with Coinbase, Polygon & Sentient on high-profile launches."
- **Play AI is not a third-party brand.** It is a product line Dehidden builds. Four Dehidden projects are PlayAI products (`playai-hub`, `madrims` titled "MadRims by PlayAI", `playai-network`, `node-explorer`), they live on `playai.network` subdomains, and Dehidden's own canonical `link` in `workData.ts` is the PlayAI X account. It is currently double-counted: once as a brand in `clients.ts` and four times as projects in `workData.ts`. Listing it under a "Shipped with" label would present Dehidden's own product as an external partner, and anyone who clicks through sees that.
- **Nodeops is unverified.** Nothing in `workData.ts` supports it. Note that `node-explorer` is *not* evidence: that project is `nodeexplorer.playai.network`, a PlayAI product, and is unrelated to `x.com/NodeOpsHQ`.

**Resolution: the label was the defect, not the data.** An earlier draft of this spec proposed the label "Shipped with", which asserts a partner relationship and is what Play AI fails. The site already publishes these same five names under **"Worked with"** at `app/markdown/route.ts:76`, and that phrasing is true of Play AI whether it is a client or a product line Dehidden builds, and true of Nodeops at exactly the strength the published site already claims.

So: **the strip's label is "Worked with", all five entries stay, and no data changes.** This introduces no claim the site does not already make, which is the bar for a restructuring change. Two consequences the implementer must respect:

- Do not invent a stronger label. Not "Shipped with", not "Launch partners", not "Clients". If a future change wants a stronger claim for the three confirmed brands, that is a content decision for Shashwat and needs its own `workData.ts` support.
- Do not drop Play AI or Nodeops from `lib/clients.ts` as a cleanup. Removing a brand from the published list is Shashwat's content call, it changes the `/markdown` rendition, and it would require the matching edit to `data/agent-memory.md:86`.

New component `components/common/ClientStrip.tsx`:

- Props: `{ orgSlug: string }`. Returns `null` when no client matches, so `ExperienceWork` can drop it in unconditionally, the same contract `EmploymentTag` already uses.
- Renders a mono `text-2xs uppercase tracking-label text-subtle` label reading `Worked with` (see the resolution above; the wording is load-bearing), then the overlapping avatars, then the names as a comma-separated list where each name links to that client's `link`.
- Avatars reuse the idiom from `components/About.tsx:104-124`: `rounded-full`, `outline outline-1 outline-border`, and `-ml-1` on every avatar after the first. Note that the About version is responsive (`h-4 w-4 sm:h-5 sm:w-5`), so pick one size deliberately here rather than copying the pair by reflex.
- **The ring colour must change from the About version.** There the avatars sit on a `bg-card` bento tile and use `ring-2 ring-card`. Here they sit on the page background, so the separating ring is `ring-2 ring-background`. Copying `ring-card` would put a faintly wrong-coloured halo around each avatar.
- Greyscale by default, full colour on hover of the strip, via a `group` on the strip and `grayscale group-hover:grayscale-0` on the images, with `transition-[filter] duration-base ease-out`. Taken from `experience-item.tsx:24`.
- Each avatar keeps a `Tooltip` carrying `contribution`. With the section gone, that copy is deliberately secondary; the visible sell is the name list.

Placement: inside the Dehidden entry, after the role metadata line and before the highlight bullets. It is a fact about the engagement, so it belongs with the engagement metadata and above the outcomes.

### A3. The vertical rail

Adopted from `experience-item.tsx:76`. The org logo and name stay at the top level; everything else hangs off a hairline rail so the org visibly owns its content.

- Org logo becomes `h-6 w-6` (down from `h-7 w-7`) so the rail geometry matches the reference exactly: a 24px logo centres at 12px, the rail sits at `left-3`, and content indents `pl-9`. The logo reads as an anchor on a rail rather than a card, so the smaller size is correct here.
- **The identity row's gap must change to `gap-3` at the same time.** It is `gap-2.5` today, so a 24px logo would start the org name at 34px while the rail's children indent to 36px, leaving the name two pixels out of alignment with everything hanging below it. 24px logo plus a 12px gap is what makes `pl-9` land exactly under the name.
- The rail is a `before:absolute before:left-3 before:h-full before:w-px before:bg-border` pseudo-element on the content wrapper.
- **The elbow at the bottom needs the masking trick**, not a shortened border: you cannot shorten a `border-l` or a full-height pseudo-element. Follow `experience-position-item.tsx:34-36` — overlay a `size-4 bg-background` box at the rail's tail to cover the straight line, and draw the curve inside it with a span carrying `rounded-bl-sm border-b border-l`. A reviewer should check this renders correctly in both themes, since the mask depends on the box's background exactly matching the page's.
- The org logo also gets the greyscale-to-colour treatment, so one idiom covers every logo on the page.

### A4. Structured employment period, computed tenure

`org.duration` is a hand-typed display string, and `org.duration.includes("Present")` is used as the current-role test in two places (`components/ExperienceWork.tsx:29`, `app/markdown/route.ts:40`). A string search deciding a boolean is fragile; a structured period removes both problems at once.

- Add `period: { start: string; end?: string }` to `TOrganization`, in `"MM.YYYY"` form. Omitting `end` means present.
- Remove the `duration` field. It has eight call sites across four files, all of which need updating: `components/ExperienceWork.tsx` (lines 29 and 47), `app/work/[org]/page.tsx:55`, `app/markdown/route.ts` (lines 40, 44 and 61), and `app/work/[org]/markdown/route.ts` (lines 24 and 30).
- New `lib/tenure.ts` exporting three functions, using `date-fns` (`parse`, `differenceInMonths`), which is already installed:
  - `formatPeriod(period)` gives `"Jan 2022 - Dec 2025"` or `"Jan 2026 - Present"`.
  - `formatTenure(period)` gives `"4y"`, `"3y 11m"`, or `"8m"`. Count months inclusively of both endpoints, and return an empty string for a non-positive span so a data-entry mistake renders as nothing rather than as `"-1y"`.
  - `isCurrent(period)` is `period.end === undefined`.
- The Experience row renders `formatPeriod` and `formatTenure` together in the metadata line. The reference renders tenure because a reader should not have to do arithmetic to see that four years is four years.
- **`About.tsx`'s `"4+ yrs"` stat stays a hand-written string.** An earlier draft of this spec proposed deriving it from the earliest org's `period.start`, which was wrong: that stat claims years *building frontend*, and the org list claims years *at these organisations*. The earliest entry is Jan 2022, so deriving it would silently cap the claim at whatever `workData` happens to contain and would understate the truth for any work predating Cope.Studio. If drift is worth solving, the fix is an explicit career-start constant that says what it means, not a derivation from a list that means something else. Out of scope here either way.

### A5. Per-role tech tags and description-list semantics

- Add `skills?: string[]` to `TOrganization` and render it as a wrapped row of small pills below the role metadata. Reuse the existing pill shape from `components/common/OrgChips.tsx` rather than inventing a third one; extract a shared `Tag` if the two shapes turn out identical, and leave them separate if they do not. A recruiter should see the stack per engagement without opening the org page.
- Role metadata (employment type, period, tenure) becomes a real `dl` with `sr-only` `dt` labels, per `experience-position-item.tsx:56-99`. This is cheap accessibility craft and it makes the metadata self-describing for the markdown renditions.

---

## Group B: the blog

### B1. Index becomes a single-column list

`components/BlogPosts.tsx:11` is `grid gap-4 sm:grid-cols-2`. With exactly one post in `app/blogs/posts/`, that renders one card beside a large empty column, which reads as a broken page. A list is correct at one post, five, or fifty. This is the highest-leverage change on the route and it is structural, not cosmetic.

Each row keeps the thumbnail, title, date, summary and tags, laid out horizontally with the thumbnail at a fixed width so rows stay uniform regardless of title length.

### B2. Reading time

No reading-time helper exists in the repo. Add one and render it beside the date.

**Strip fenced code blocks and inline code before counting.** The single post is 696 raw words across eight `##` sections, much of it code. Counting code inflates the estimate for exactly the posts where a reader skims rather than reads. Divide the remaining word count by 200 words per minute and clamp to a minimum of one minute.

### B3. Greyscale thumbnails

Apply the same greyscale-to-colour-on-hover treatment as the brand and org logos, from `post-item.tsx:26`, so the idiom is one site-wide decision rather than three local ones.

### B4. Two real defects in the same file

Fix both while the file is open, and mention them in the commit body so they are not mistaken for incidental churn:

- It renders a raw `<img>` (line 22) with an `@next/next/no-img-element` suppression above it, bypassing `next/image` for a thumbnail that is a good candidate for optimisation. Convert it and delete the suppression.
- **The card's transition never uses our easing curve.** Line 16 is `transition-[transform,border-color] duration-300` with no `ease-*` class. An arbitrary-value `transition-[...]` utility emits only `transition-property`, so unlike `transition-colors` it contributes no timing function, and the card falls back to the browser's default `ease` over 300ms. Line 24 in the same component uses `duration-base`, so the file is internally inconsistent too. Give both `duration-base ease-out`.

  To be precise about a claim it would be easy to overstate: `duration-300` is **not** dead CSS. `transitionDuration` in `tailwind.config.ts:104` sits inside `theme.extend`, so Tailwind's default numeric scale survives alongside the named tokens. The literal is a convention violation under the motion-token rule in `CLAUDE.md`, not a broken class.

- The same missing-easing problem exists in `components/ExperienceWork.tsx` at lines 37, 39 and 42, which carry bare `transition-colors` and `transition-[box-shadow]` with no duration or easing, so they run at Tailwind's stock 150ms and stock curve. Group A is already rewriting that file, so fix them there rather than here.

### B5. Prev/next at the end of a post

Order posts by `publishedAt` and link the neighbours, rendering nothing where a neighbour does not exist.

**State plainly in the commit body that this renders nothing today.** With one post there is no previous and no next. It is cheap, correct, and pays off from the second post onward, but it is not a visible improvement now and should not be described as one.

---

## Group C: structured data

### C1. Correction to the earlier backlog

`phase-2-backlog.md:18` claims posts have no article schema. That is wrong. `app/blogs/[slug]/page.tsx:65-86` already emits a complete `BlogPosting` block inline. The real gaps are that it lives inline instead of in `lib/seo.ts` beside every other schema helper, and that the index has no schema at all.

### C2. Move `BlogPosting` into `lib/seo.ts`, add `Blog` to the index

- Add `blogPostingLd(post)` to `lib/seo.ts` and have the post page call it, so all structured data is built in one module. Preserve the existing output; this is a move, not a redesign.
- `app/blogs/page.tsx` currently emits no JSON-LD and declares no canonical. Add a `Blog` node whose `blogPost` array lists the posts, plus `alternates: { canonical }`, which every other route already sets.

### C3. `BreadcrumbList` on nested routes

Add a shared `breadcrumbLd(trail)` helper in `lib/seo.ts` and emit it from `/blogs/[slug]`, `/books/[slug]`, `/work/[org]`, `/work/[org]/[project]` and `/project/[slug]`. Verified absent: `BreadcrumbList` appears nowhere in the repo.

Worth knowing while doing this, because it changes how much the work is worth: only four files emit JSON-LD at all (`app/layout.tsx`, `app/blogs/[slug]/page.tsx`, `app/project/[slug]/page.tsx`, `components/Faq.tsx`). The `/work/[org]` and `/work/[org]/[project]` pages have none, so breadcrumbs there are a thin win on the pages that carry the most selling weight. Giving those routes a real `Organization` or `Article` node would be the larger prize; it is deliberately left out to keep this PR bounded, and it belongs in the same follow-up as testimonials.

### C4. Stable `@id` anchors so nodes consolidate

From `config/json-ld.ts`. This is the best small idea in the reference and we do not do it.

`personLd()` and `websiteLd()` currently emit `Person` and `WebSite` with no `@id`, so a crawler sees each page's blocks as unrelated objects instead of repeated references to one entity. Give them stable fragment ids (`${baseUrl}#person`, `${baseUrl}#website`), have `WebSite` reference the person by `@id`, and have per-page nodes reference the same anchors rather than restating the author inline.

Add a `ProfilePage` node on the homepage whose `mainEntity` is the person `@id`. The homepage is the entity page for a portfolio and currently does not say so.

---

## Out of scope

Deliberate omissions, with reasons, so nobody re-adds them by accident.

- **Table of contents on post pages.** The reference has one. Our single post is 696 words with eight headings, so a TOC would be nearly as long as the reading is short, and it would read as padding. Revisit when a post is long enough to need navigation.
- **Blog search and filter.** A search box above one result is worse than no search box. Revisit around ten posts.
- **Testimonials.** The highest-value asset missing from the site, and the one thing that cannot be built from the codebase: it needs real quotes from real people, as the reference's do, each linked to the post it came from. Next PR, once quotes exist. Do not fabricate placeholder testimonials, not even as scaffolding.
- **`/vcard`.** Small, but unrelated to anything else here, and it would widen an already broad PR.

## Still rejected

Carried forward from `phase-2-backlog.md` and reconfirmed against the source on 2026-08-12:

- The `screen-line-top` / `screen-line-bottom` ruled-grid aesthetic, and the `Panel` `border-x border-line` framing that goes with it. Section separation stays as whitespace.
- The `/sponsors`, `/components`, `/game` and `/timeline` routes. They serve the reference author's positioning as a component-registry author, not a frontend engineer selling availability.
- `animate-ping` on the current-employer dot (`experience-item.tsx:65`). A permanent ambient loop on a page you scroll past is what the motion audit rejected. The static dot stays.
- Collapsible role descriptions. `/work/<org>` already carries the full diary inline, so a collapsible on the homepage duplicates a surface that exists.
- UTM parameters on outbound company links. The reference uses them to attribute referral traffic it sends to partners; that has no analogue here.
- The `(llms)/*.md` per-section endpoints. `/markdown` plus `middleware.ts` content negotiation already covers this more generally.

## Noticed but not folded in

Found while reviewing this spec against the code. Recorded so they are not rediscovered as if new, and excluded so they do not widen the PR.

- **`components/layout/Section.tsx:40` uses `text-[1.75rem]`.** That is an arbitrary type size on the primitive every section heading flows through, and the Global Constraints above forbid exactly that. 28px sits between `text-2xl` (24px) and `text-3xl` (30px), so closing it means either picking one or adding a scale step, which is a typography decision rather than a cleanup.
- **Structured data on the `/work` routes**, as described in C3.

## Verification

No test runner exists in this repo, so the gates are mechanical:

0. The strip's label reads exactly `Worked with`, matching `app/markdown/route.ts:76`, and `lib/clients.ts` still holds all five entries.
1. `npm run build`, `npm run lint`, `npx tsc --noEmit`, `./scripts/verify-simplification.sh` all clean.
2. Grep proves `Clients.tsx` and `MetaContent.tsx` have no remaining referrers before deletion.
3. Every `org.duration` consumer listed in A4 is updated; grep for `.duration` returns no `workData` hits.
4. `/markdown` and `/work/<org>/markdown` still emit their full sections, including "Worked with".
5. Every JSON-LD block still parses as JSON and the `@id` anchors match across the homepage and per-page nodes.
6. Reading time on the existing post is a plausible small number, not a code-inflated one.

## Commit shape

Three commits, one per group, so the diff stays reviewable: Experience, blog, structured data.
