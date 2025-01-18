import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const initializeGoogleAI = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Google AI API key is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { message, model, personality } = await request.json();

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the streaming response
    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    // Process in the background
    (async () => {
      try {
        if (model === "gemini-pro") {
          const genAI = initializeGoogleAI();
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const prompt = `${personality}\n\nUser: ${message}`;

          const result = await model.generateContentStream(prompt);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        } else {
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Invalid model selected" })}\n\n`
            )
          );
        }
      } catch (error: any) {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: error.message })}\n\n`
          )
        );
      } finally {
        // Important: Send a final message to indicate completion
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
