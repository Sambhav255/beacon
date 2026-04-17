import { MODEL_FALLBACK, MODEL_PRIMARY, getGroqClient, hasGroqKey } from "@/lib/groq";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { question, kit, market } = await req.json();

  if (!question) {
    return Response.json({ error: "Missing question." }, { status: 400 });
  }

  if (!hasGroqKey()) {
    return Response.json({
      answer:
        "Live follow-up chat requires GROQ_API_KEY. For now, use the kit sections above as a static reference.",
    });
  }

  const messages = [
    {
      role: "system" as const,
      content:
        "You are Beacon follow-up assistant. Answer only from the supplied market kit context. Be concise, factual, and explicit when data is unavailable.",
    },
    {
      role: "user" as const,
      content: JSON.stringify({ market, kit, question }),
    },
  ];

  const groq = getGroqClient();
  if (!groq) {
    return Response.json({
      answer:
        "Live follow-up chat requires GROQ_API_KEY. For now, use the kit sections above as a static reference.",
    });
  }

  let answer = "";
  try {
    const result = await groq.chat.completions.create({
      model: MODEL_PRIMARY,
      temperature: 0.3,
      max_tokens: 500,
      messages,
    });
    answer = result.choices[0]?.message?.content ?? "No response generated.";
  } catch {
    const fallback = await groq.chat.completions.create({
      model: MODEL_FALLBACK,
      temperature: 0.3,
      max_tokens: 500,
      messages,
    });
    answer = fallback.choices[0]?.message?.content ?? "No response generated.";
  }

  const wantsStream = req.nextUrl.searchParams.get("stream") === "true";
  if (!wantsStream) {
    return Response.json({ answer });
  }

  const encoder = new TextEncoder();
  const tokens = answer.split(" ");
  const stream = new ReadableStream({
    async start(controller) {
      for (const token of tokens) {
        controller.enqueue(encoder.encode(`data: ${token} \n\n`));
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
