import type { StackName } from "@/components/common/StackIcon";

export type StackGroup = "core" | "backend" | "testing";

/**
 * The homepage "Currently" block. Edited by hand like the other data files.
 * `stack` is the tools actually in use, grouped so the pills can be told
 * apart: `core` (frontend and AI) renders neutral, `backend` and `testing`
 * each get a soft tint. Order within a group is the order on the page.
 */
export const currently: { building: string; stack: Record<StackGroup, StackName[]> } = {
  building: "Sloosh, ShopOS's creator app",
  stack: {
    core: ["typescript", "react", "next", "tailwind", "shadcn", "claude"],
    backend: ["node", "express", "postgres", "mongodb", "redis", "docker", "aws", "cloudflare", "vercel"],
    testing: ["vitest", "playwright", "jest", "testingLibrary"],
  },
};
