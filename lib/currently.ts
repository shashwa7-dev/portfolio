import type { StackName } from "@/components/common/StackIcon";

export type StackGroup = "core" | "backend" | "testing";

/**
 * The homepage "Currently" block. Edited by hand like the other data files.
 * `building` is optional: leave it out and the row is not shown.
 * `stack` is the tools actually in use, grouped so the pills can be told
 * apart: `core` (frontend and AI) renders neutral, `backend` and `testing`
 * each get a soft tint. Order within a group is the order on the page.
 */
export const currently: { building?: string; stack: Record<StackGroup, StackName[]> } = {
  // No "Building" row between roles; add `building` back when there is one.
  stack: {
    core: ["typescript", "react", "next", "tailwind", "shadcn", "claude"],
    backend: ["node", "express", "postgres", "mongodb", "redis", "docker", "aws", "cloudflare", "vercel"],
    testing: ["vitest", "playwright", "jest", "testingLibrary"],
  },
};
