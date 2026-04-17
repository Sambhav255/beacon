import marketsData from "@/data/markets.json";
import { runAgent } from "@/lib/agent";
import type { MarketsMap } from "@/lib/types";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { marketId } = await req.json();
  const market = (marketsData as MarketsMap)[marketId];

  if (!market) {
    return new Response("Market not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runAgent(market)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ stage: "done" })}\n\n`));
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ stage: "error", error: String(error) })}\n\n`),
        );
      } finally {
        controller.close();
      }
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
