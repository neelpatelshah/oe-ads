import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { question, messages } = await request.json();

  try {
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      system: `You are a helpful medical assistant. Answer the user's question based on the provided context. Do not use markdown.`,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
