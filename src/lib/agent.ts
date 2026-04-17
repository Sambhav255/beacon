import { MODEL_FALLBACK, MODEL_PRIMARY, getGroqClient, hasGroqKey } from "@/lib/groq";
import { STAGE_PROMPTS } from "@/lib/prompts";
import type { Market, StageEvent, StageId } from "@/lib/types";

const STAGES: StageId[] = [
  "context",
  "signals",
  "prospects",
  "assets",
  "outreach",
  "content",
];

const STAGE_TEMPERATURE: Record<StageId, number> = {
  context: 0.3,
  signals: 0.3,
  prospects: 0.3,
  assets: 0.7,
  outreach: 0.7,
  content: 0.7,
};

/** Caps completion size to cut Groq cost; tuned to match compact prompts in prompts.ts */
const STAGE_MAX_TOKENS: Record<StageId, number> = {
  context: 480,
  signals: 520,
  prospects: 900,
  assets: 560,
  outreach: 600,
  content: 640,
};

function safeParseJSON(payload: string) {
  try {
    return JSON.parse(payload);
  } catch {
    return {
      raw: payload,
      note: "Unable to parse model output as JSON. Returning raw content.",
    };
  }
}

function buildFallbackStageOutput(stage: StageId, market: Market, context: Record<string, unknown>) {
  if (stage === "context") {
    return {
      market_state: market.tagline,
      modo_position: market.modo_research[0]?.summary ?? "Modo has active research in this market.",
      grounding_notes: market.modo_research.map((r) => r.title),
    };
  }

  if (stage === "signals") {
    return {
      headline_signal: {
        title: market.active_signals[0]?.headline ?? "No headline signal available.",
        implication: market.active_signals[0]?.so_what ?? "No implication available.",
      },
      supporting_signals: market.active_signals,
      pattern: "Signal set indicates immediate GTM timing for targeted outreach.",
    };
  }

  if (stage === "prospects") {
    const archetypes = market.prospect_archetypes;
    return {
      prospects: Array.from({ length: 5 }).map((_, idx) => {
        const base = archetypes[idx % Math.max(archetypes.length, 1)];
        return {
          rank: idx + 1,
          archetype: base?.archetype ?? `Prospect archetype ${idx + 1}`,
          description: base?.description ?? "Prospect profile from market signals.",
          trigger: base?.trigger ?? "Fresh market trigger detected.",
          pain: base?.pain ?? "Needs market-entry intelligence.",
          matched_modo_asset: market.modo_research[0]?.title ?? "Modo market research",
          matched_ko_prompt: market.ko_starter_prompts[idx % Math.max(market.ko_starter_prompts.length, 1)]?.text ?? "Compare market entry routes for this geography.",
          channel: base?.channel ?? "Email",
          priority: idx === 0 ? "high" : idx === 1 ? "medium" : "watch",
          reasoning: "Prioritized from recent signal relevance.",
        };
      }),
      sequencing_note: "Start with high-priority profiles this week, then medium profiles in week two.",
    };
  }

  if (stage === "assets") {
    return {
      starter_pack: Array.from({ length: 3 }).map((_, idx) => ({
        id: `p${idx + 1}`,
        prompt_text:
          market.ko_starter_prompts[idx % market.ko_starter_prompts.length]?.text ??
          `What is the top market-entry risk for ${market.name} this quarter?`,
        persona:
          market.ko_starter_prompts[idx % market.ko_starter_prompts.length]?.persona ?? "developer",
        why_this_prompt: "Targets a decision a growth team needs to make this week.",
        benchmarks_exercised: market.ko_starter_prompts[0]?.benchmarks_exercised ?? ["Market research"],
        expected_answer_preview: "Ko would provide benchmark-backed directional guidance and key sensitivities.",
      })),
      curation_logic: "Prompts selected to balance near-term outreach and market-structure understanding.",
    };
  }

  if (stage === "outreach") {
    const prospects = (context.prospects as { prospects?: Array<Record<string, string>> })?.prospects ?? [];
    return {
      emails: Array.from({ length: 3 }).map((_, idx) => ({
        to_archetype: prospects[idx]?.archetype ?? "Growth target archetype",
        subject: `${market.name} signal worth discussing`,
        body: `We have been tracking a fresh ${market.name} signal and built a concise view on what it means for your route-to-market assumptions. If useful, I can share the short note and tailored Ko prompt set.`,
        cta_type: "research_link",
        cta_line: "Open to me sending the two-minute brief?",
        signal_reference: market.active_signals[0]?.headline ?? "Recent market signal",
      })),
      follow_up_variant: {
        context: prospects[0]?.archetype ?? "Primary archetype",
        subject: `Follow-up on ${market.name} benchmark note`,
        body: "One extra data point from this week changed our base case. Happy to send the updated cut.",
      },
    };
  }

  return {
    linkedin_post: {
      hook: `${market.name} storage strategy just changed.`,
      body: `Modo's latest market read points to a sharper entry window in ${market.name}. The key is matching signals to the right outreach sequence.`,
      cta: "Read the latest Modo research.",
      character_count: 260,
    },
    newsletter_blurb: {
      headline: `${market.name} market entry watch`,
      body: `A new signal cluster in ${market.name} changed outreach priorities this week. We mapped the top profiles and attached Ko-ready prompts.`,
    },
    video_topic: {
      working_title: `${market.name}: the first-move playbook`,
      thesis: `The first 30 days in ${market.name} are won by signal speed and grounded outreach.`,
      three_key_points: ["Signal timing", "Prospect sequencing", "Asset-to-message mapping"],
      suggested_expert: "Market analyst with BESS GTM experience",
    },
  };
}

async function callGroq(stage: StageId, context: Record<string, unknown>) {
  const groq = getGroqClient();
  if (!groq) throw new Error("GROQ_API_KEY missing");
  const response = await groq.chat.completions.create({
    model: MODEL_PRIMARY,
    temperature: STAGE_TEMPERATURE[stage],
    max_tokens: STAGE_MAX_TOKENS[stage],
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: STAGE_PROMPTS[stage] },
      { role: "user", content: JSON.stringify(context) },
    ],
  });

  return response.choices[0]?.message?.content ?? "{}";
}

async function callGroqFallback(stage: StageId, context: Record<string, unknown>) {
  const groq = getGroqClient();
  if (!groq) throw new Error("GROQ_API_KEY missing");
  const response = await groq.chat.completions.create({
    model: MODEL_FALLBACK,
    temperature: STAGE_TEMPERATURE[stage],
    max_tokens: STAGE_MAX_TOKENS[stage],
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: STAGE_PROMPTS[stage] },
      { role: "user", content: JSON.stringify(context) },
    ],
  });
  return response.choices[0]?.message?.content ?? "{}";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

export async function* runAgent(market: Market): AsyncGenerator<StageEvent, Record<string, unknown>, void> {
  const outputs: Record<string, unknown> = {};

  for (const stage of STAGES) {
    const input = { market, outputs };
    yield { stage, status: "running", input, prompt: STAGE_PROMPTS[stage] };

    const startedAt = Date.now();
    let output: unknown;
    let error: string | null = null;

    if (!hasGroqKey()) {
      output = buildFallbackStageOutput(stage, market, outputs);
      error = "No GROQ_API_KEY found. Using cached fallback output.";
    } else {
      try {
        output = safeParseJSON(
          await withTimeout(callGroq(stage, input), 15000, `${stage} exceeded 15s live timeout`),
        );
      } catch (primaryError) {
        try {
          output = safeParseJSON(
            await withTimeout(callGroqFallback(stage, input), 15000, `${stage} fallback exceeded 15s timeout`),
          );
          error = `Primary model failed: ${String(primaryError)}. Fallback model used.`;
        } catch (fallbackError) {
          output = buildFallbackStageOutput(stage, market, outputs);
          error = `Live generation failed. Cached fallback used: ${String(fallbackError)}`;
          yield {
            stage,
            status: "error",
            error: `Stage ${stage} failed live. Continuing with cached output.`,
            output,
          };
        }
      }
    }

    outputs[stage] = output;
    yield {
      stage,
      status: "complete",
      output,
      latencyMs: Date.now() - startedAt,
      tokenEstimate: Math.ceil(JSON.stringify(input).length / 4),
      error: error ?? undefined,
    };
  }

  return outputs;
}
