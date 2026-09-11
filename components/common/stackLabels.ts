/**
 * Stack names and their display labels.
 *
 * Separate from `StackIcon.tsx` for one hard reason: that file is `"use
 * client"`, and a server component importing a function across that boundary
 * receives a client-reference object rather than the function. `TechStack`
 * renders its third tier as running text and calls `stackLabel` during the
 * server render, which failed with "object is not a function" until this moved
 * out here.
 *
 * So the rule is: anything a server component needs to CALL lives in this file.
 * `StackIcon` still re-exports `StackName`, because a type crosses the boundary
 * fine and six callers already import it from there.
 */

export type StackName =
  | "python"
  | "sqlite"
  | "html"
  | "css"
  | "typescript"
  | "react"
  | "next"
  | "tailwind"
  | "express"
  | "shadcn"
  | "gsap"
  | "motion"
  | "reactQuery"
  | "apollo"
  | "zustand"
  | "node"
  | "graphql"
  | "websocket"
  | "webrtc"
  | "postgres"
  | "mongodb"
  | "firebase"
  | "aws"
  | "docker"
  | "solana"
  | "web3js"
  | "wagmi"
  | "styledComponents"
  | "chakraui"
  | "electron"
  | "googleGemini"
  | "javascript"
  | "bun"
  | "vercel"
  | "cloudflare"
  | "supabase"
  | "postgress"
  | "vscode"
  | "notion"
  | "git"
  | "github"
  | "postman"
  | "figma"
  | "canva"
  | "openai"
  | "claude"
  | "spotify"
  | "youtube"
  | "restAPI"
  | "playstation"
  | "coffee"
  | "opensea"
  | "playwright"
  | "vitest"
  | "posthog"
  | "sentry"
  | "googleAnalytics"
  | "vercelAnalytics";

const labelMap: Record<StackName, string> = {
  vscode: "VS Code",
  restAPI: "REST API",
  figma: "Figma",
  playstation: "PlayStation",
  canva: "Canva",
  coffee: "Coffee",
  openai: "OpenAI",
  claude: "Claude",
  postman: "Postman",
  notion: "Notion",
  html: "HTML5",
  github: "GitHub",
  spotify: "Spotify",
  youtube: "YouTube",
  python: "Python",
  sqlite: "SQLite",
  git: "Git",
  css: "CSS3",
  bun: "Bun",
  javascript: "JavaScript",
  typescript: "TypeScript",
  googleGemini: "Google Gemini",
  vercel: "Vercel",
  zustand: "Zustand",
  supabase: "Supabase",
  mongodb: "MongoDB",
  opensea: "OpenSea",
  postgress: "PostgreSQL",
  cloudflare: "Cloudflare",
  chakraui: "Chakra UI",
  electron: "Electron",
  wagmi: "Wagmi",
  solana: "Solana",
  shadcn: "shadcn/ui",
  react: "React",
  express: "Express",
  web3js: "Web3.js",
  next: "Next.js",
  styledComponents: "Styled Components",
  tailwind: "Tailwind CSS",
  gsap: "GSAP",
  motion: "Framer Motion",
  reactQuery: "React Query",
  apollo: "Apollo GraphQL",
  node: "Node.js",
  graphql: "GraphQL",
  websocket: "WebSocket",
  webrtc: "WebRTC",
  postgres: "PostgreSQL",
  firebase: "Firebase",
  aws: "AWS",
  docker: "Docker",
  playwright: "Playwright",
  vitest: "Vitest",
  posthog: "PostHog",
  sentry: "Sentry",
  googleAnalytics: "Google Analytics",
  vercelAnalytics: "Vercel Analytics",
};

/**
 * The display name for a stack entry, without the pill around it.
 *
 * `labelMap` is the one place a tool's rendered name is decided, and the
 * toolkit's third tier prints names as running text rather than as icons. This
 * exists so that tier does not keep a second, hand-typed copy of the same
 * fifteen strings, which is exactly how a list drifts from the thing it
 * mirrors.
 */
export function stackLabel(name: StackName): string {
  return labelMap[name];
}
