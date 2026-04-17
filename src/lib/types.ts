export type StageId =
  | "context"
  | "signals"
  | "prospects"
  | "assets"
  | "outreach"
  | "content";

export type StageStatus = "pending" | "running" | "complete" | "error";

export interface StageEvent {
  stage: StageId | "done" | "error";
  status?: StageStatus;
  output?: unknown;
  input?: unknown;
  prompt?: string;
  latencyMs?: number;
  tokenEstimate?: number;
  error?: string;
}

export interface Market {
  id: string;
  name: string;
  flag: string;
  status: string;
  tagline: string;
  market_snapshot: Record<string, string | number>;
  modo_research: Array<{
    title: string;
    url: string;
    summary: string;
    key_stats?: string[];
  }>;
  active_signals: Array<{
    date: string;
    type: string;
    headline: string;
    so_what: string;
    source?: string;
  }>;
  prospect_archetypes: Array<{
    id: string;
    archetype: string;
    description: string;
    trigger: string;
    pain: string;
    priority: "high" | "medium" | "watch";
    channel: string;
  }>;
  ko_starter_prompts: Array<{
    text: string;
    persona: string;
    why: string;
    benchmarks_exercised: string[];
  }>;
}

export type MarketsMap = Record<string, Market>;
