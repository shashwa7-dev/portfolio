import { describe, expect, it } from "vitest";
import {
  parseChatFrame,
  resolveReply,
  takeCompleteLines,
} from "@/lib/chatStream";
import { CONNECTION_TROUBLE } from "@/lib/chatMessages";

/** Build a frame the way `app/api/chat/route.ts` writes one. */
const frame = (payload: Record<string, unknown>) =>
  `data: ${JSON.stringify(payload)}`;

/**
 * Replays a whole stream through the same two functions the widget uses, so
 * these assert the end state a visitor actually sees rather than one call in
 * isolation.
 */
function replay(lines: string[]): string {
  let accumulated = "";
  let errorText: string | null = null;
  for (const line of lines) {
    const parsed = parseChatFrame(line);
    if (!parsed) continue;
    if (parsed.done) break;
    if (parsed.error) {
      errorText = parsed.error;
      continue;
    }
    if (parsed.text) accumulated += parsed.text;
  }
  return resolveReply({ accumulated, errorText });
}

describe("parseChatFrame", () => {
  it("decodes a data frame", () => {
    expect(parseChatFrame(frame({ text: "hello" }))).toEqual({ text: "hello" });
  });

  it("ignores the blank lines between frames", () => {
    expect(parseChatFrame("")).toBeNull();
  });

  it("returns null rather than throwing on a malformed frame", () => {
    expect(parseChatFrame("data: {not json")).toBeNull();
  });

  it("returns null for a frame whose payload is not an object", () => {
    expect(parseChatFrame("data: null")).toBeNull();
    expect(parseChatFrame('data: "text"')).toBeNull();
  });
});

describe("resolveReply", () => {
  it("returns the streamed text when there is any", () => {
    expect(resolveReply({ accumulated: "He built Dehidden." })).toBe(
      "He built Dehidden."
    );
  });

  it("prefers streamed text over an error that arrived alongside it", () => {
    expect(
      resolveReply({ accumulated: "Partial answer.", errorText: "boom" })
    ).toBe("Partial answer.");
  });

  it("falls back to the server's message when nothing streamed", () => {
    expect(resolveReply({ accumulated: "", errorText: "Upstream is down." })).toBe(
      "Upstream is down."
    );
  });

  it("falls back to shared copy when there is no text and no message", () => {
    expect(resolveReply({ accumulated: "" })).toBe(CONNECTION_TROUBLE);
  });

  it("treats whitespace-only output as nothing", () => {
    expect(resolveReply({ accumulated: "  \n " })).toBe(CONNECTION_TROUBLE);
  });
});

/**
 * The regression suite. Every case here rendered an empty assistant bubble
 * before this module existed.
 */
describe("a stream never ends in an empty bubble", () => {
  it("shows the error when the route sends an error frame", () => {
    expect(
      replay([
        frame({ error: CONNECTION_TROUBLE }),
        frame({ done: true }),
      ])
    ).toBe(CONNECTION_TROUBLE);
  });

  it("shows the fallback when the model streams only empty text", () => {
    expect(
      replay([frame({ text: "" }), frame({ text: "" }), frame({ done: true })])
    ).toBe(CONNECTION_TROUBLE);
  });

  it("shows the fallback when the stream ends with no frames at all", () => {
    expect(replay([])).toBe(CONNECTION_TROUBLE);
  });

  it("shows the fallback when the stream is only a done frame", () => {
    expect(replay([frame({ done: true })])).toBe(CONNECTION_TROUBLE);
  });

  it("still renders a normal multi-chunk answer unchanged", () => {
    expect(
      replay([
        frame({ text: "He built " }),
        frame({ text: "Dehidden " }),
        frame({ text: "and Mehfil." }),
        frame({ done: true }),
      ])
    ).toBe("He built Dehidden and Mehfil.");
  });

  it("renders a refusal, which arrives as ordinary text", () => {
    const refusal = "I can't do that part.";
    expect(replay([frame({ text: refusal }), frame({ done: true })])).toBe(
      refusal
    );
  });

  it("does not let a malformed frame mid-stream lose the reply", () => {
    expect(
      replay([
        frame({ text: "Half " }),
        "data: {broken",
        frame({ text: "an answer." }),
        frame({ done: true }),
      ])
    ).toBe("Half an answer.");
  });
});

describe("takeCompleteLines", () => {
  it("holds back the tail after the last newline", () => {
    expect(takeCompleteLines('data: {"text":"a"}\n\ndata: {"te')).toEqual({
      lines: ['data: {"text":"a"}', ""],
      rest: 'data: {"te',
    });
  });

  it("takes everything once no more reads are coming", () => {
    expect(takeCompleteLines('data: {"text":"a"}', true)).toEqual({
      lines: ['data: {"text":"a"}'],
      rest: "",
    });
  });

  it("holds back a whole buffer that contains no newline yet", () => {
    expect(takeCompleteLines("data: {")).toEqual({ lines: [], rest: "data: {" });
  });

  it("leaves nothing behind when the buffer ends on a newline", () => {
    expect(takeCompleteLines("a\nb\n")).toEqual({ lines: ["a", "b"], rest: "" });
  });

  it("handles an empty buffer at the end of a stream", () => {
    expect(takeCompleteLines("", true)).toEqual({ lines: [""], rest: "" });
  });
});

/**
 * Replays a stream the way the widget reads one: in arbitrary network-sized
 * pieces rather than one frame at a time, since that is the shape the split
 * bug hides in.
 */
function replayChunks(chunks: string[]): string {
  let accumulated = "";
  let errorText: string | null = null;
  let buffer = "";

  outer: for (let i = 0; i < chunks.length; i++) {
    buffer += chunks[i];
    const atEnd = i === chunks.length - 1;
    const { lines, rest } = takeCompleteLines(buffer, atEnd);
    buffer = rest;
    for (const line of lines) {
      const parsed = parseChatFrame(line);
      if (!parsed) continue;
      if (parsed.done) break outer;
      if (parsed.error) {
        errorText = parsed.error;
        continue;
      }
      if (parsed.text) accumulated += parsed.text;
    }
  }
  return resolveReply({ accumulated, errorText });
}

describe("frames split across reads", () => {
  it("keeps text whose frame straddles two reads", () => {
    // The frame for " Dehidden" is cut in half by the read boundary.
    expect(
      replayChunks([
        'data: {"text":"He built"}\n\ndata: {"te',
        'xt":" Dehidden."}\n\ndata: {"done":true}\n\n',
      ])
    ).toBe("He built Dehidden.");
  });

  it("keeps text when a frame is split into three reads", () => {
    expect(
      replayChunks(['data: {"te', 'xt":"who', 'le"}\n\ndata: {"done":true}\n\n'])
    ).toBe("whole");
  });

  it("keeps a frame that only completes on the very last read", () => {
    expect(
      replayChunks(['data: {"text":"tail"}', "\n\n"])
    ).toBe("tail");
  });

  it("still falls back when the split frames amount to no text", () => {
    expect(replayChunks(['data: {"te', 'xt":""}\n\n'])).toBe(CONNECTION_TROUBLE);
  });

  it("delivers an error frame that arrived in two pieces", () => {
    expect(
      replayChunks(['data: {"error":"Upstr', 'eam is down."}\n\n'])
    ).toBe("Upstream is down.");
  });
});
