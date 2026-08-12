# Phase 2 backlog

Deferred until the simplification plan (`docs/superpowers/plans/2026-08-12-portfolio-simplification.md`) is fully landed. Do not start any of this while that run is in flight.

Source of inspiration: `github.com/ncdai/chanhdai.com`. Reference only. Nothing here is a copy-the-design task.

## Explicitly rejected

- **The `screen-line-top` / `screen-line-bottom` ruled-grid aesthetic.** Shashwat reviewed it and does not want full-bleed side-of-screen rules. Do not propose it again. Section separation stays as whitespace, with `border-t border-border` on the `Section` primitive as the only fallback if the homepage reads as loose.
- `/sponsors`, `/components`, `/game`, `/timeline` routes. Those serve chanhdai's positioning as a component-library author and open-source maintainer, not a frontend engineer selling contract and full-time availability.

## Blog, highest priority

The blog's dominant problem is content volume, not styling: `app/blogs/posts/` contains exactly one post (`truffy-agent.mdx`).

1. **Switch the index from a 2-column image-card grid to a single-column list.** `components/BlogPosts.tsx` currently renders `grid gap-4 sm:grid-cols-2`, so at one post you get a card plus a large empty column, which reads as broken. A list is correct at 1, 5, or 50 posts. This is the single highest-leverage change and it is structural, not cosmetic.
2. **Reading time.** Nothing in the repo computes it. Cheap, and readers use it to decide whether to start.
3. **`BlogPosting` JSON-LD on post pages, `Blog` on the index.** `lib/seo.ts` exports `personLd`, `websiteLd`, `faqLd`, `softwareAppLd` but has no Article or BlogPosting schema, so posts currently get no rich results. chanhdai emits `Blog` on the index with a `blogPost` array.
4. **`BreadcrumbList` JSON-LD** per page. Cheap SEO, currently absent.
5. **Prev/next at the end of a post.** Currently a dead end. Moot at one post; it is what makes the second post onward worth having.
6. **Table of contents on post pages.** Half-built already: `app/globals.css` ships `.prose .anchor` styling, so headings already have anchor targets.
7. **Search / filter on the index. Deferred deliberately.** chanhdai has it, but a search box above a single result is worse than no search box. Revisit at roughly ten posts.

## Sell-focused additions

Both of these serve the "why would someone contact me" question, which is the site's stated goal.

- **`/testimonials`.** Named humans vouching for the work. The site currently has brand logos (Coinbase, Polygon, ShopOS, Dehidden) but no personal endorsement. This is the strongest missing sell asset.
- **`/vcard`.** A downloadable `.vcf`. Small, and it is a conversion aid on a page whose job is getting contacted.

## Not a gap

chanhdai's `(llms)/*.md` per-section endpoints are a more granular version of what this repo already does with `/markdown` plus `middleware.ts` content negotiation. No work needed.
