import { CONNECTION_TROUBLE } from "@/lib/chatMessages";

/**
 * The pure half of reading the chat endpoint's SSE stream.
 *
 * This lives in `lib/` rather than inline in `components/ChatBot.tsx` because
 * both functions here are exactly where the widget used to show an empty
 * bubble, and `npm test` covers `lib/**` only. Inline in the component, the
 * two bugs below were unreachable by any test.
 */

/** One decoded `data: {...}` frame. Every field is optional: the route sends
 *  whichever ones apply to that frame. */
export type ChatFrame = {
  text?: string;
  error?: string;
  emailState?: unknown;
  done?: boolean;
};

/**
 * Decode one line of the stream, or return null if the line is not a frame.
 *
 * Separating this from acting on the frame is the point. The widget used to
 * do both inside one `try`, whose `catch` existed to swallow a malformed
 * `JSON.parse`. The server's error frame was handled in that same block with
 * `throw new Error(data.error)`, intending to reach the outer catch and show
 * the message. It never got there: the throw landed in the parse guard two
 * lines below, which logged it and carried on, so a real failure reached the
 * visitor as an assistant bubble containing nothing at all.
 *
 * With parsing split out, a caller can act on the frame outside the guard,
 * and only genuinely unparseable lines are swallowed.
 */
export function parseChatFrame(line: string): ChatFrame | null {
  if (!line.startsWith("data: ")) return null;
  try {
    const parsed: unknown = JSON.parse(line.slice(6));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ChatFrame;
  } catch {
    // A partial or malformed frame is not worth failing the whole reply
    // over: the stream keeps going and the next frame may well be fine.
    return null;
  }
}

/**
 * What the assistant's bubble should say once the stream has ended.
 *
 * A bubble is created empty the moment a visitor sends a message, and is
 * filled as text arrives. Nothing guaranteed text ever arrived. Three
 * different endings left it empty and the visitor staring at a blank
 * rounded rectangle:
 *
 * 1. the route sent an `error` frame (the case described in
 *    `parseChatFrame`), which the widget dropped
 * 2. the model streamed frames whose text was the empty string, which the
 *    widget correctly skipped but had nothing to fall back to. `text()` in
 *    `@google/generative-ai` returns "" rather than throwing when a
 *    generation stops without producing any, which a token ceiling low
 *    enough to be spent on reasoning alone will do
 * 3. the stream ended after no frames at all
 *
 * All three are the same thing to a visitor: they asked a question and got
 * silence. So the rule is a floor, not a diagnosis. Whatever the reason,
 * say something. Real text always wins; the server's own explanation is
 * preferred over ours when it sent one, since it knows more than we do.
 */
export function resolveReply({
  accumulated,
  errorText,
}: {
  accumulated: string;
  errorText?: string | null;
}): string {
  if (accumulated.trim()) return accumulated;
  if (errorText && errorText.trim()) return errorText;
  return CONNECTION_TROUBLE;
}
