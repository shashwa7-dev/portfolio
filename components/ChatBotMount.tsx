"use client";

import dynamic from "next/dynamic";

/**
 * Mounts the assistant on the client only.
 *
 * The wrapper exists because `ssr: false` is a client-side option and
 * `app/page.tsx` is a Server Component, so the import has to live behind a
 * `"use client"` boundary rather than in the page itself.
 *
 * Homepage only, deliberately. It used to mount from the root layout, which put
 * a fixed bubble in the bottom right corner of every route, where it competed
 * with anything else anchored to that corner.
 */
const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false });

export default function ChatBotMount() {
  return <ChatBot />;
}
