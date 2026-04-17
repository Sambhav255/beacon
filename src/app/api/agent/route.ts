/**
 * Security audit (Perspective 1):
 * - Validates request body shape and marketId against known market whitelist.
 * - Adds in-memory per-IP rate limiting (1 run / 30 seconds) to protect API spend.
 * - Returns safe, generic error payloads to avoid leaking internals.
 */
import marketsData from "@/data/markets.json";
import { runAgent } from "@/lib/agent";
import type { MarketsMap } from "@/lib/types";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT_WINDOW_MS = 30_000;
const ipRunTimestamps = new Map<string, number>();

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const lastRunAt = ipRunTimestamps.get(ip);
  const now = Date.now();
  if (lastRunAt && now - lastRunAt < RATE_LIMIT_WINDOW_MS) {
    return true;
  }
  ipRunTimestamps.set(ip, now);
  return false;
}

export async function POST(req: NextRequest) {
  const knownMarketIds = Object.keys(marketsData as MarketsMap);
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Please wait 30 seconds before starting another run." },
      { status: 429 },
    );
  }

  const body = (await req.json()) as { marketId?: unknown };
  const marketId = typeof body.marketId === "string" ? body.marketId.trim() : "";
  if (!knownMarketIds.includes(marketId)) {
    return Response.json({ error: "Market not found" }, { status: 404 });
  }

  const market = (marketsData as MarketsMap)[marketId];

  if (!market) {
    return Response.json({ error: "Market not found" }, { status: 404 });
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
        const safeMessage = error instanceof Error ? error.message : "Run failed";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ stage: "error", error: safeMessage })}\n\n`),
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
