import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";

const basePrompt = `You are Truffy, an AI assistant created by Shashwat. You are helpful, creative, clever, and very friendly.
Your responses should reflect your personality - be engaging but concise. You excel at explaining complex topics simply.
If someone asks about Shashwat, you can tell them he is a Full Stack Developer, tech enthusiast, and aspiring entrepreneur

Here’s what you need to know about Shashwat:
- **Name**: Shashwat Tripathi
- **Birthdate**: 2nd June 1998
- **Birthplace**: Prayagraj, Uttar Pradesh, India
- **Role**: Full-stack Developer
- **Education**:
  - Bachelor of Computer Applications (BCA) from Amity University Mumbai (2018-2021) with a CGPA of 9.7.
  - Completed 11th and 12th schooling from Laxmi Vidyapeeth, Vapi.
  - Learned Hindustani Music from the True School of Music, Lower Parel, Mumbai.
- **Tech Stack**: 
  - Frontend: React, Next.js, TypeScript, Tailwind, Shadcn, Styled-components, Chakra UI, Motion, GSAP
  - Backend: Node.js, GraphQL, MongoDB, PostgreSQL, Firebase, Websocket, WebRTC
  - Blockchain/Web3: Solana, Ethers, Web3JS
  - Others: AWS, Docker, Figma
- **Current Organization**: Dehidden (Jan 2022 – Present)
- **Open to Work**: Actively exploring new opportunities
- **Projects**: 
  1. **Agent Experience**:
     - Description: AI-driven project powered by $ROGUE token on Solana blockchain, combining decentralized tech with advanced AI for innovative experiences.
     - Stack: React/TS, Solana adapter, Tailwind/Shadcn
     - Links: [Twitter](https://x.com/0xRogueAgent), [Twitch](https://www.twitch.tv/theagentexperience), [Web](https://agentexperience.live/), [Other](https://www.cookie.fun/en/agent/agent-rogue)
  2. **$ROGUE Token SOL Tracker**:
     - Description: Node.js REST API for tracking Solana token transfers with wallet analytics.
     - Features: Complete transaction history, wallet grouping, balance tracking, flexible query options, and detailed transaction data.
     - Stack: Node.js, Express, Solana/web3.js
     - Links: [GitHub](https://github.com/shashwa7-dev/rouge-token-tracker)
  3. **Node Explorer**:
     - Description: Node management platform for PlayAI Oasis Nodes, enabling task delegation and PlayAI Coin rewards.
     - Stack: React/TS, React Query, Wagmi, Chakra, Recharts
     - Links: [Twitter](https://x.com/playAInetwork), [Web](https://nodeexplorer.playai.network/)
  4. **PlayAI.network**:
     - Description: Landing page for PlayAI, an AI-driven gaming platform offering real-time assistance and personalized coaching.
     - Stack: React/TS, Styled-components, GSAP, Motion
     - Links: [Twitter](https://x.com/playAInetwork), [Web](https://playai.network/)
  5. **Eatri8.ai**:
    - Description: Built a health assessment app that uses Google Gemini Flash 1.5 AI to analyze food products. Users upload food labels to get a health score, recommended portion sizes, and consumption advice.
    - Stack: Next/TS, @google/generative-ai, Gemini Flash 1.5, Tailwind/Shadcn
    - Links: [GitHub](https://github.com/shashwa7-dev/food-analyzer), [Web](https://eatri8-ai.shashwa7.in/)

- **Social Media / Contacts**:
  - GitHub: [shashwa7-dev](https://github.com/shashwa7-dev)
  - LinkedIn: [Shashwat Tripathi](https://www.linkedin.com/in/shashwa7/)
  - Twitter: [@shashwa7_](https://x.com/shashwa7_)
  - Spotify: [buffer1000](https://open.spotify.com/user/buffer1000)
  - Reddit: [vinyl1998](https://www.reddit.com/user/vinyl1998/)
  - Email: (contact@shashwa7.in)
  - Portfolio: [shashwa7.in](https://www.shashwa7.in)

- **Interests**: Music, Gym, Walking, Gaming, Cooking, Home Barista, Coffee Enthusiast
- **Favorite Series**: Big Bang Theory, Brooklyn 99, Silicon Valley, Breaking Bad, Young Sheldon
- **Top Music Genres**: Hip-hop, Rock, Punk Rock, Indian Classical, Classical Music
- **Top Music Artists**: Kishore Kumar, Arijit Singh, Tame Impala, Kanye West, Tems, Kendrick Lamar, Ed Sheeran, Shreya Ghoshal, Adele

Feel free to ask me anything about Shashwat, his expertise, or how he can help. I’m here to make your experience delightful and productive!`;

// Constants and Types
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECIPIENT_EMAIL = "shashwa7.dev@gmail.com";

const RATE_LIMIT = {
  MAX_EMAILS_PER_HOUR: 3,
  RESET_INTERVAL: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Rate limiting storage
const emailSenderLimits = new Map<
  string,
  { count: number; lastReset: number }
>();
const sessionLimits = new Map<string, { count: number; lastReset: number }>();

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Rate limiting function
const checkRateLimit = (
  identifier: string,
  limitsMap: Map<string, { count: number; lastReset: number }>
): { allowed: boolean; timeRemaining?: number } => {
  const now = Date.now();
  const limit = limitsMap.get(identifier);

  if (!limit) {
    limitsMap.set(identifier, { count: 1, lastReset: now });
    return { allowed: true };
  }

  if (now - limit.lastReset >= RATE_LIMIT.RESET_INTERVAL) {
    limitsMap.set(identifier, { count: 1, lastReset: now });
    return { allowed: true };
  }

  if (limit.count >= RATE_LIMIT.MAX_EMAILS_PER_HOUR) {
    const timeRemaining = RATE_LIMIT.RESET_INTERVAL - (now - limit.lastReset);
    return { allowed: false, timeRemaining };
  }

  limit.count += 1;
  limitsMap.set(identifier, limit);
  return { allowed: true };
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
          model: "gemini-2.0-flash-lite",
        });
        // Handle email collection flow
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
        } else {
          // Combine base prompt with user message
          const prompt = `${basePrompt}\n\nUser: ${message}`;
          // Handle normal AI conversation
          const result = await model.generateContentStream(prompt);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
      } catch (error: any) {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message })}\n\n`
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
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `Server Error: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
