import { NextRequest } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { CONNECTION_TROUBLE, RECIPIENT_EMAIL } from "@/lib/chatMessages";

/**
 * Truffy's system prompt is loaded from `data/agent-memory.md` — single source
 * of truth for who Shashwat is, what he's shipping, who he's worked with,
 * etc. When any portfolio data changes, that file must be updated too (see
 * `CLAUDE.md`). Cached at module load for the lifetime of the serverless
 * function instance; cold starts re-read.
 *
 * This file also carries the scope contract (what Truffy will and won't
 * answer). It is passed to the model as `systemInstruction`, a channel
 * separate from the visitor's message, rather than concatenated into one
 * prompt string. That separation means a visitor's message is never
 * concatenated into the instructions and can't pose as a new one the way
 * it could in a single combined string. It raises the bar against a
 * visitor's text claiming to be a new instruction; it is not a guarantee
 * that no phrasing gets through, and the pre-filter below and the model's
 * own judgment are what actually carry that weight case by case.
 */
const basePrompt = fs.readFileSync(
  path.join(process.cwd(), "data", "agent-memory.md"),
  "utf8"
);

// Constants and Types
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The fixed shape of a scope refusal, used verbatim by the cheap pre-filter
 * below and described to the model (in `data/agent-memory.md`) as the shape
 * its own refusals should take. Keeping it in one place means a visitor
 * always gets a scoped-assistant answer rather than a "broken" one, whether
 * the refusal came from the regex or from the model itself.
 */
const STANDARD_REFUSAL =
  "I can't do that part. If part of your message was about Shashwat, this site, or getting in touch with him, ask me just that and I'll answer it.";

const RATE_LIMIT = {
  MAX_EMAILS_PER_HOUR: 3,
  RESET_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
};

/**
 * Budget for the general chat path (not the email flow, which has its own
 * limits above). Generous enough for a real conversation about Shashwat's
 * work, tight enough that the endpoint can't be turned into a free,
 * unmetered model.
 */
const CHAT_RATE_LIMIT = {
  MAX_MESSAGES_PER_HOUR: 20,
  RESET_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
};

// A cheap pre-filter's cap on input size. Generous for a real question about
// a person's career; not generous enough to be worth pasting an essay into.
const MAX_MESSAGE_LENGTH = 3000;

// Rate limiting storage
const emailSenderLimits = new Map<
  string,
  { count: number; lastReset: number }
>();
const sessionLimits = new Map<string, { count: number; lastReset: number }>();
const chatLimits = new Map<string, { count: number; lastReset: number }>();

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Rate limiting function. `maxCount` and `resetInterval` default to the
 * original email budget so the two existing call sites (sender email,
 * email session) keep their exact behaviour unchanged; the chat path below
 * passes its own, larger budget through the same mechanism rather than
 * reimplementing it.
 *
 * This is per-instance, in-memory state: a Map that lives only as long as
 * one serverless function instance does. It resets on cold start and does
 * not coordinate across concurrent instances, so it raises the cost of
 * casual, repeated abuse from a single warm instance. It does not stop a
 * determined attacker, who can simply trigger fresh instances or rotate
 * identifiers. It also has no eviction: an attacker who keeps rotating
 * identifiers grows these Maps for the life of the instance rather than
 * getting throttled. Bounded by the instance recycling, not by anything
 * in this function.
 */
const checkRateLimit = (
  identifier: string,
  limitsMap: Map<string, { count: number; lastReset: number }>,
  maxCount: number = RATE_LIMIT.MAX_EMAILS_PER_HOUR,
  resetInterval: number = RATE_LIMIT.RESET_INTERVAL
): { allowed: boolean; timeRemaining?: number } => {
  const now = Date.now();
  const limit = limitsMap.get(identifier);

  if (!limit) {
    limitsMap.set(identifier, { count: 1, lastReset: now });
    return { allowed: true };
  }

  if (now - limit.lastReset >= resetInterval) {
    limitsMap.set(identifier, { count: 1, lastReset: now });
    return { allowed: true };
  }

  if (limit.count >= maxCount) {
    const timeRemaining = resetInterval - (now - limit.lastReset);
    return { allowed: false, timeRemaining };
  }

  limit.count += 1;
  limitsMap.set(identifier, limit);
  return { allowed: true };
};

/**
 * Identifies a visitor for the chat rate limit. Reads the same "sessionId"
 * cookie the email flow reads, then falls back to the client IP from
 * standard proxy headers, then to a single shared bucket if neither is
 * present. Nothing in this app currently sets that cookie, so in practice
 * most requests fall through to the IP (or the shared bucket behind a proxy
 * that strips forwarding headers): documented here rather than glossed
 * over, because a rate limit keyed on an identifier that rarely resolves is
 * weaker than it sounds. `x-forwarded-for` specifically is client-supplied
 * on any setup that does not have a trusted proxy rewriting it, so a
 * visitor who wants a fresh bucket can usually just set the header.
 */
const getChatIdentifier = (request: NextRequest): string => {
  const sessionId = request.cookies.get("sessionId")?.value;
  if (sessionId) return sessionId;
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "shared-bucket";
};

/**
 * Cheap regex screen for the blatant cases, run before any API call so
 * obvious abuse never costs a token or a round trip. This is a cost
 * optimisation, not the security boundary: it catches messages that are
 * too long, transparent prompt-injection phrasing, and explicit requests
 * for generated code. It does nothing against paraphrase, typos, a
 * request split across turns, or anything even mildly disguised. The
 * `systemInstruction` sent to the model on every request is the actual
 * scope enforcement; this only saves money on the cases too obvious to
 * need it.
 *
 * Deliberately does NOT match language names on their own (e.g. "is he
 * any good in Python?" or "What has he built using Rust?"). Asking which
 * languages someone works in is core in-scope content about the owner.
 * Explicit code-generation requests are already caught by the patterns
 * that match "write me a script", "generate code", etc., which do not
 * require the language name to trigger. A narrower regex would save nothing
 * while refusing legitimate visitor questions about the owner's stack.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(?:(?:all|the)\s+)*(previous|prior|above)\s+instructions?/i,
  /disregard\s+(?:(?:the|all)\s+)*(above|previous|prior)/i,
  /system\s*prompt/i,
  /you\s+are\s+now\b/i,
  /new\s+instructions?\s*:/i,
  /reveal\s+(your\s+)?(instructions|prompt|rules)/i,
];

/**
 * Both verb patterns below (write / generate / create / give me) share a
 * failure mode: "write", "create" and "generate" are also the bare verb
 * form used right after a question auxiliary ("did he write...", "does he
 * create..."), so an ungated pattern flags a real question about existing
 * work ("Did Shashwat write the visitor card app?") as a request to
 * produce new code. This lookbehind stands the pattern down when a
 * question word leads into the verb with a few words of slack ("did he",
 * "does Shashwat", "who wrote" already misses it on tense alone). A
 * question about what he already built is in-scope content; only the
 * imperative form ("write me a script") is the thing being screened for.
 */
const QUESTION_LEAD =
  "(?:did|does|do|has|have|had|was|were|is|are|who|what|when|where|why|how)";
const NOT_A_QUESTION = `(?<!\\b${QUESTION_LEAD}\\b(?:\\s+\\S+){0,3}\\s+)`;

const CODE_GEN_PATTERNS = [
  new RegExp(
    `${NOT_A_QUESTION}\\bwrite\\s+(?:me\\s+|us\\s+)?(?:\\S+\\s+){0,3}?(script|program|function|app|component|algorithm)\\b`,
    "i"
  ),
  new RegExp(
    `${NOT_A_QUESTION}\\b(generate|create|give\\s+me)\\s+(?:\\S+\\s+){0,3}?(script|program|function|app|component|algorithm|code|snippet)\\b`,
    "i"
  ),
  /\bwrite\s+(?:some\s+)?code\b/i,
  /```/,
];

const isBlatantAbuse = (message: string): boolean => {
  if (message.length > MAX_MESSAGE_LENGTH) return true;
  return [...INJECTION_PATTERNS, ...CODE_GEN_PATTERNS].some((pattern) =>
    pattern.test(message)
  );
};

// Email content validation
const validateEmailContent = (subject: string, body: string): boolean => {
  if (!subject || !body) return false;
  if (subject.length < 2 || body.length < 10) return false;

  const suspiciousPatterns = [
    /<script>/i,
    /javascript:/i,
    /onclick/i,
    /http:\/\/|https:\/\//i,
  ];

  return !suspiciousPatterns.some(
    (pattern) => pattern.test(subject) || pattern.test(body)
  );
};

const initializeGoogleAI = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Google AI API key is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Send email with rate limiting
const sendEmail = async (
  fromEmail: string,
  subject: string,
  body: string,
  sessionId: string
): Promise<{ success: boolean; message?: string }> => {
  // Check sender email rate limit
  const senderCheck = checkRateLimit(fromEmail, emailSenderLimits);
  if (!senderCheck.allowed) {
    const minutesRemaining = Math.ceil(
      senderCheck.timeRemaining! / (60 * 1000)
    );
    return {
      success: false,
      message: `Rate limit exceeded. Please try again in ${minutesRemaining} minutes. Only ${RATE_LIMIT.MAX_EMAILS_PER_HOUR} emails allowed per hour per sender.`,
    };
  }

  // Check session rate limit
  const sessionCheck = checkRateLimit(sessionId, sessionLimits);
  if (!sessionCheck.allowed) {
    const minutesRemaining = Math.ceil(
      sessionCheck.timeRemaining! / (60 * 1000)
    );
    return {
      success: false,
      message: `Session rate limit exceeded. Please try again in ${minutesRemaining} minutes. Only ${RATE_LIMIT.MAX_EMAILS_PER_HOUR} emails allowed per hour per session.`,
    };
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: RECIPIENT_EMAIL,
      subject: subject,
      text: `From: ${fromEmail}\n\n${body}`,
      html: `<p><strong>From:</strong> ${fromEmail}</p><br/><p>${body.replace(
        /\n/g,
        "<br/>"
      )}</p>`,
    });
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      message: "Failed to send email. Please try again later.",
    };
  }
};
// Function to detect email intent from user message
const detectEmailIntent = (message: string): boolean => {
  const emailTriggers = [
    "message for shashwat",
    "write mail",
    "write email",
    "send email",
    "send a mail",
    "send mail",
    "mail him",
    "email him",
    "message him",
    "message shashwat",
    "write to shashwat",
    "contact shashwat",
    "email to shashwat",
    "mail to shashwat",
  ];

  return emailTriggers.some((trigger) =>
    message.toLowerCase().includes(trigger.toLowerCase())
  );
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { message, emailState } = await request.json();

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    (async () => {
      try {
        const genAI = initializeGoogleAI();
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          // The scope contract lives here, not in the prompt text sent per
          // request: `systemInstruction` is a separate channel the SDK keeps
          // apart from user content, so a visitor's message cannot pose as a
          // new instruction the way it could when the two were concatenated
          // into one string.
          systemInstruction: basePrompt,
          generationConfig: {
            // Was 400, on the reasoning that a question about someone's
            // career does not need more than a few hundred tokens to answer.
            // That reasoning counted the answer and forgot what else comes
            // out of a 2.5 model: reasoning tokens are billed against this
            // same ceiling, so a budget sized for the reply alone can be
            // spent before the reply starts. The generation then stops at
            // MAX_TOKENS, which is not a "bad" finish reason, so `text()`
            // returns "" instead of throwing and the visitor gets silence.
            // 1200 leaves room for both. The cap is still here to bound cost
            // and to limit how much room a jailbreak attempt has to work in,
            // and the guard below means running out can no longer show a
            // visitor nothing.
            maxOutputTokens: 1200,
            // Low rather than zero: this is factual recall from a memory
            // file, not creative writing, but some phrasing variety keeps
            // replies from reading like a lookup table.
            temperature: 0.3,
          },
          // Explicit rather than left at SDK defaults, so the choice is
          // visible and won't silently change under us on a package update.
          // Standard "block medium and above" across all four categories:
          // this is a public-facing chat widget, not a content-moderation
          // product, so the default moderation posture is what we want.
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        });
        // Handle email collection flow
        if (emailState || detectEmailIntent(message)) {
          const state = emailState || { step: "email", data: {} };

          switch (state.step) {
            case "email":
              if (emailState) {
                if (EMAIL_REGEX.test(message)) {
                  state.data.email = message;
                  state.data.sessionId =
                    request.cookies.get("sessionId")?.value ||
                    crypto.randomUUID();
                  state.step = "subject";
                  await writer.write(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        text: "Great! Now, what would you like the subject of your email to be?",
                        emailState: state,
                      })}\n\n`
                    )
                  );
                } else {
                  await writer.write(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        text: "That doesn't look like a valid email address. Please provide a valid email address.",
                        emailState: state,
                      })}\n\n`
                    )
                  );
                }
              } else {
                await writer.write(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      text: "I'll help you send an email to Shashwat. First, please provide your email address:",
                      emailState: state,
                    })}\n\n`
                  )
                );
              }
              break;

            case "subject":
              state.data.subject = message;
              state.step = "body";
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    text: "Perfect! Now, what message would you like to send?",
                    emailState: state,
                  })}\n\n`
                )
              );
              break;

            case "body":
              state.data.body = message;
              state.step = "verify";
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    text: `Here's what I'm going to send:\n\nFrom: ${state.data.email}\nSubject: ${state.data.subject}\nMessage: ${state.data.body}\n\nShould I send this email? (Please respond with yes or no)`,
                    emailState: state,
                  })}\n\n`
                )
              );
              break;

            case "verify":
              if (message.toLowerCase() === "yes") {
                if (validateEmailContent(state.data.subject, state.data.body)) {
                  const { success, message: resultMessage } = await sendEmail(
                    state.data.email,
                    state.data.subject,
                    state.data.body,
                    state.data.sessionId
                  );

                  if (success) {
                    await writer.write(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          text: "Email sent successfully! Is there anything else I can help you with?",
                          emailState: null,
                        })}\n\n`
                      )
                    );
                  } else {
                    await writer.write(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          text: resultMessage,
                          emailState: null,
                        })}\n\n`
                      )
                    );
                  }
                } else {
                  await writer.write(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        text: "Invalid email or content might be malicious. Please try again with appropriate content.",
                        emailState: null,
                      })}\n\n`
                    )
                  );
                }
              } else {
                await writer.write(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      text: "Email cancelled. Is there anything else I can help you with?",
                      emailState: null,
                    })}\n\n`
                  )
                );
              }
              break;
          }
        } else if (isBlatantAbuse(message)) {
          // Cost optimisation, not the boundary: refuses the obvious cases
          // (see isBlatantAbuse above) without spending a token. Everything
          // that gets past this still has to clear systemInstruction.
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ text: STANDARD_REFUSAL })}\n\n`
            )
          );
        } else {
          const chatCheck = checkRateLimit(
            getChatIdentifier(request),
            chatLimits,
            CHAT_RATE_LIMIT.MAX_MESSAGES_PER_HOUR,
            CHAT_RATE_LIMIT.RESET_INTERVAL
          );

          if (!chatCheck.allowed) {
            const minutesRemaining = Math.ceil(
              chatCheck.timeRemaining! / (60 * 1000)
            );
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({
                  text: `You've reached the chat limit for now. Try again in ${minutesRemaining} minutes, or email Shashwat directly at ${RECIPIENT_EMAIL} if it's urgent.`,
                })}\n\n`
              )
            );
          } else {
            // The visitor's message is sent as-is, as the user turn: the
            // scope rules live in systemInstruction above, not folded into
            // this text, so there is nothing here for an injection attempt
            // to append itself to.
            const result = await model.generateContentStream(message);
            let streamed = "";
            for await (const chunk of result.stream) {
              const text = chunk.text();
              // Empty chunks carry nothing and the client skips them anyway.
              if (!text) continue;
              streamed += text;
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
            // A generation can succeed and still produce no text: it stops at
            // MAX_TOKENS having spent the budget on reasoning, or returns no
            // candidates at all. Neither throws, so without this the stream
            // would close having said nothing and the visitor would be left
            // looking at an empty bubble. The client has its own floor for
            // the same reason; this one keeps the endpoint honest for any
            // caller, not just the widget.
            if (!streamed.trim()) {
              console.error(
                "Chat generation produced no text",
                await result.response.then((r) => r.candidates?.[0]?.finishReason)
              );
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({ text: CONNECTION_TROUBLE })}\n\n`
                )
              );
            }
          }
        }
      } catch (error) {
        // Never stream error.message to the client: it can carry SDK or API
        // detail (quota errors, model identifiers, upstream text) that has no
        // business reaching a visitor. Log the real error server-side and
        // send a generic, friendly line over SSE instead.
        console.error("Chat generation failed:", error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              error: CONNECTION_TROUBLE,
            })}\n\n`
          )
        );
      } finally {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
        );
        await writer.close();
      }
    })();

    return response;
  } catch (error) {
    // Same rule as above: log the detail, tell the client nothing specific.
    console.error("Chat request failed:", error);
    return new Response(
      JSON.stringify({
        error: CONNECTION_TROUBLE,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
