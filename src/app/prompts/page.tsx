"use client";

import { STAGE_PROMPTS } from "@/lib/prompts";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const STAGE_META: Record<string, { purpose: string; inputSchema: string; outputSchema: string }> = {
  context: {
    purpose: "Ground the run in market context and published Modo research.",
    inputSchema: '{ "market": string, "modo_research": [...], "market_snapshot": {...} }',
    outputSchema: '{ "market_state": string, "modo_position": string, "grounding_notes": string[] }',
  },
  signals: {
    purpose: "Synthesize active signals into clear commercial implications.",
    inputSchema: '{ "market": string, "signals": [...], "modo_position": string }',
    outputSchema: '{ "headline_signal": {...}, "supporting_signals": [...], "pattern": string }',
  },
  prospects: {
    purpose: "Rank 10 prospect archetypes using timing and trigger specificity.",
    inputSchema: '{ "market": string, "signals": [...], "archetype_catalog": [...] }',
    outputSchema: '{ "prospects": [...], "sequencing_note": string }',
  },
  assets: {
    purpose: "Match prospects to high-leverage Ko starter prompts and benchmark context.",
    inputSchema: '{ "market": string, "prospects": [...], "asset_catalog": {...} }',
    outputSchema: '{ "starter_pack": [...], "curation_logic": string }',
  },
  outreach: {
    purpose: "Draft concise outreach linked to signals and tailored CTA types.",
    inputSchema: '{ "market": string, "top_prospects": [...], "starter_pack": {...} }',
    outputSchema: '{ "emails": [...], "follow_up_variant": {...} }',
  },
  content: {
    purpose: "Generate a two-week content sprint aligned to the market thesis.",
    inputSchema: '{ "market": string, "signals": [...], "prospects": [...], "starter_pack": {...} }',
    outputSchema: '{ "linkedin_post": {...}, "newsletter_blurb": {...}, "video_topic": {...} }',
  },
};

export default function PromptsPage() {
  const [openStage, setOpenStage] = useState<string>("context");

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-14">
      <h1 className="h2 mb-3">Beacon prompts</h1>
      <p className="mb-3 text-text-2">Transparency page for the six stage system prompts used by Beacon.</p>
      <p className="mb-8 text-sm text-text-3">Everything the agent thinks starts here. Nothing is hidden.</p>
      <div className="space-y-5">
        {Object.entries(STAGE_PROMPTS).map(([stage, prompt]) => (
          <section key={stage} className="rounded border border-border bg-surface p-4">
            <button
              onClick={() => setOpenStage((prev) => (prev === stage ? "" : stage))}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <div className="micro mb-1">{stage}</div>
                <p className="text-sm text-text-2">{STAGE_META[stage]?.purpose}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-text-2 transition-transform ${openStage === stage ? "rotate-180" : ""}`}
              />
            </button>
            {openStage === stage && (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs text-text-3">Input schema</p>
                  <pre className="whitespace-pre-wrap text-xs text-text-2">{STAGE_META[stage]?.inputSchema}</pre>
                </div>
                <div>
                  <p className="text-xs text-text-3">Output schema</p>
                  <pre className="whitespace-pre-wrap text-xs text-text-2">{STAGE_META[stage]?.outputSchema}</pre>
                </div>
                <div>
                  <p className="text-xs text-text-3">Full prompt</p>
                  <pre className="whitespace-pre-wrap text-sm text-text-2">{prompt}</pre>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
