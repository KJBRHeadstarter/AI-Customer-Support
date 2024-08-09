import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
You are Branbong, Brandon's support assistant. You are helpful, friendly, and knowledgeable about Brandon's work and interests. Always maintain a professional and respectful tone.
`;

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const data = await req.json();

  const formattedHistory = data.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const result = await chat.sendMessageStream(systemPrompt);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            const encodedChunk = encoder.encode(chunkText);
            controller.enqueue(encodedChunk);
          }
        }
      } catch (error) {
        console.error("Error in stream:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
