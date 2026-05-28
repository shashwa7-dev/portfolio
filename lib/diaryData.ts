import { StackName } from "@/components/common/StackIcon";

export type TDiaryEntry = {
  id: string;
  title: string;
  summary: string;
  /** Exact substring of `summary` to underline with the Marker SVG. Keep short — 3-6 words. */
  summaryHighlight?: string;
  date: string;
  context?: string;
  contributions: string[];
  impact?: string;
  /** Exact substring of `impact` to underline. */
  impactHighlight?: string;
  stack?: StackName[];
};

export type TOrgDiary = {
  org: string;
  overview?: string;
  /** Optional substring of `overview` to underline. */
  overviewHighlight?: string;
  featured: TDiaryEntry[];
  other?: { title: string; summary: string; date?: string }[];
};

export const diaries: TOrgDiary[] = [
  {
    org: "shopos",
    overview:
      "Frontend consultant at ShopOS, an AI-native commerce platform. I owned merchant-facing surfaces across the AI agents, workflow authoring, and chat experience used to create, manage, market, and sell. Worked across the main app, the admin console, and the shared design-system package.",
    overviewHighlight: "AI-native commerce platform",
    featured: [
      {
        id: "enterprise-migration",
        title: "Enterprise dashboard in-app migration",
        summary:
          "Brought the Enterprise UI out of a separate iframe-hosted repo and into the main app as native routes.",
        summaryHighlight: "into the main app as native routes",
        date: "Apr 2026",
        context:
          "The Enterprise dashboard was a standalone project served inside the main product through an iframe. That meant separate auth, separate theme, separate deploy cadence, and a cross-origin wall that blocked any deeper UX integration.",
        contributions: [
          "Migrated routes and components from the standalone repo into the main Next.js app.",
          "Unified auth so Enterprise inherits the same session and workspace context as the rest of the product.",
          "Re-platformed the UI on the shared design system, removing a parallel set of styles and primitives.",
          "Wired enterprise-aware routing so admins land on the right shell without per-feature flags.",
        ],
        impact:
          "One auth layer, one design system, no cross-origin tax. Faster loads and a real path to deeper UX for enterprise clients.",
        impactHighlight: "no cross-origin tax",
        stack: ["next", "react", "typescript", "tailwind", "reactQuery"],
      },
      {
        id: "canvas-builder",
        title: "Canvas Builder for visual workflow authoring",
        summary:
          "Drawer-based visual editor that lets non-engineers compose workflow templates without writing code.",
        summaryHighlight: "without writing code",
        date: "May 2026",
        context:
          "Workflow templates power large chunks of the product, but authoring them was an engineering-only task. Canvas Builder turns that into a visual surface.",
        contributions: [
          "Shipped v2: drawer-based form editor architecture, unified field schema across the form and the canvas.",
          "Performance pass on the canvas runtime and a theme overhaul to bring it under the shared design system.",
          "Reusable form-editor primitives now shared across the canvas and the admin console.",
        ],
        impact:
          "Non-engineers can author and iterate on workflow templates directly. Unified schema removed a class of drift between the canvas and the form editor.",
        impactHighlight: "Non-engineers can author and iterate",
        stack: ["next", "react", "typescript", "tailwind", "zustand"],
      },
      {
        id: "content-rich-chat-input",
        title: "Content-rich chat input",
        summary:
          "Rebuilt the chat input on tiptap with slash commands, skill mentions, and structured serialization.",
        summaryHighlight: "slash commands, skill mentions",
        date: "May 2026",
        context:
          "The previous chat input was a fragile contenteditable that could not express anything richer than plain text. New flows (skills, structured commands, mentions) demanded a real editor.",
        contributions: [
          "Built a tiptap-based editor from the core extensions up: custom skill-tag node, slash-command extension, placeholder, serializer.",
          "Wired it behind a feature flag, then enabled it by default after a stabilization pass.",
          "Hardened keyboard handling (IME, accessibility), file validation, filename sanitization, and a toggle-race fix surfaced during code review.",
        ],
        impact:
          "Agent invocations and skill workflows are now first-class inside chat. Replaced a fragile editor with a structured one the team can extend.",
        impactHighlight: "first-class inside chat",
        stack: ["react", "typescript", "tailwind"],
      },
      {
        id: "media-carousel",
        title: "Media carousel for AI asset review",
        summary:
          "Editing and reconciliation surface for AI-generated images, with a refine modal and hash-routed deep-linking.",
        summaryHighlight: "hash-routed deep-linking",
        date: "Jan 2026",
        context:
          "Merchants review and refine AI-generated assets every day. The surface had to support comments, refinements, and shareable deep links into a specific asset.",
        contributions: [
          "Built the media carousel: navigation, asset preview, refine modal, comment overlay.",
          "Hash-routed deep-linking so a specific asset and modal state survives a reload or a shared link.",
          "Wired the refine flow end-to-end with the modal lifecycle and the cleanup paths it required.",
        ],
        impact:
          "Core to the review-and-publish loop merchants run daily. Stable deep-linking made the surface easy to share and embed in other flows.",
        impactHighlight: "merchants run daily",
        stack: ["react", "typescript", "tailwind"],
      },
      {
        id: "skills-library",
        title: "Skills Library across two apps",
        summary:
          "End-to-end Skills Library in both the main app and the admin console.",
        summaryHighlight: "End-to-end Skills Library",
        date: "May 2026",
        context:
          "Skills extend agent capability. The product needed an authenticated surface to upload, preview, manage, and toggle skill packs in both the merchant app and the admin tooling, sharing as much as possible.",
        contributions: [
          "Types, API client, React Query hooks with optimistic updates.",
          "Dialogs for upload, preview (with markdown + syntax highlighting), overwrite confirmation, delete.",
          "Settings page integration in the main app; standalone Skills Library page in the admin console.",
          "Hardened error handling, mobile layout, and a feature-flagged rollout.",
        ],
        impact:
          "A new product capability surface delivered end-to-end across two apps in one pass. Users can extend agent capability through uploaded skill packs.",
        impactHighlight: "across two apps in one pass",
        stack: ["next", "react", "typescript", "tailwind", "reactQuery"],
      },
    ],
    other: [
      {
        title: "Spaces module redesign",
        summary:
          "Three-tab layout, ownership-based view/edit, publish dialog improvements, mobile-responsive tabs, PostHog event coverage.",
        date: "May 2026",
      },
      {
        title: "Modernized Playwright E2E suite",
        summary:
          "Testid-first locator strategy, page-object fixtures, agents test coverage, CI hardening.",
        date: "May 2026",
      },
      {
        title: "Brand Memory preview",
        summary:
          "Preview surface for the workspace-level brand kit consumed by generation flows.",
        date: "Feb 2026",
      },
      {
        title: "Onboarding V3 fixes",
        summary: "Fail-status logic, scroll bug, input-bug.",
        date: "Apr 2026",
      },
      {
        title: "Pricing UI iteration",
        summary:
          "Multiple rounds of refinements and a cancellation-plan flow.",
        date: "Jan – Mar 2026",
      },
    ],
  },
];

export function getDiary(slug: string): TOrgDiary | undefined {
  return diaries.find((d) => d.org === slug);
}
