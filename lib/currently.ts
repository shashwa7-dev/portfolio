import type { StackName } from "@/components/common/StackIcon";

/**
 * The homepage "Currently" block. Edited by hand like the other data files.
 * `stack` is the old Toolkit's "Every day" tier, the tools actually in use.
 */
export const currently: { building: string; stack: StackName[] } = {
  building: "Sloosh, ShopOS's creator app",
  stack: ["typescript", "react", "next", "tailwind", "shadcn", "claude", "vercel", "cloudflare", "aws"],
};
