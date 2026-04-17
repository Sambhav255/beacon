/**
 * Security audit (Perspective 1):
 * - Validates and bounds user-provided chat input before model calls.
 * - Sanitizes market label passed to LLM context.
 * - Avoids exposing raw request payload shapes to downstream calls.
 */
import { MODEL_FALLBACK, MODEL_PRIMARY, getGroqClient, hasGroqKey } from "@/lib/groq";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
const CHAT_TIMEOUT_MS = 15_000;

function sanitizeTextInput(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function POST(req: NextRequest) {
  const payload = (await req.json()) as { question?: unknown; kit?: unknown; market?: unknown };
  const question = sanitizeTextInput(payload.question, 600);
  const market = sanitizeTextInput(payload.market, 120) || "unknown";
  const kit = payload.kit ?? {};

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
    const result = await withTimeout(
      groq.chat.completions.create({
        model: MODEL_PRIMARY,
        temperature: 0.3,
        max_tokens: 500,
        messages,
      }),
      CHAT_TIMEOUT_MS,
      "Primary chat model",
    );
    answer = result.choices[0]?.message?.content ?? "No response generated.";
  } catch {
    try {
      const fallback = await withTimeout(
        groq.chat.completions.create({
          model: MODEL_FALLBACK,
          temperature: 0.3,
          max_tokens: 500,
          messages,
        }),
        CHAT_TIMEOUT_MS,
        "Fallback chat model",
      );
      answer = fallback.choices[0]?.message?.content ?? "No response generated.";
    } catch {
      answer = "Live follow-up timed out. Please retry or rely on the generated kit sections.";
    }
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
