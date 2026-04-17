export const CONTEXT_PROMPT = `Beacon stage 1. Output one JSON object only.
Keys: market_state (one paragraph, max 55 words), modo_position (one paragraph, max 55 words), grounding_notes (array of 2-4 short strings from input only, no invention).`;

export const SIGNALS_PROMPT = `Beacon stage 2. Output one JSON object only.
Keys: headline_signal { title (max 14 words), implication (max 40 words) }, supporting_signals (array, max 3 items, each { date, type, headline, so_what }), pattern (one sentence, max 28 words).`;

export const PROSPECTS_PROMPT = `Beacon stage 3. Output one JSON object only.
Exactly 5 prospects (no company names). Each prospect must have a distinct archetype label and distinct trigger.
Keys: prospects (array of 5 with rank, archetype, description max 35 words, trigger, pain, matched_modo_asset, matched_ko_prompt, channel, priority high|medium|watch, reasoning max 20 words), sequencing_note (one sentence).`;

export const ASSETS_PROMPT = `Beacon stage 4. Output one JSON object only.
Exactly 3 Ko starter prompts. Use three different personas from: trader, developer, asset_manager, fund.
Each prompt_text max 220 characters. why_this_prompt max 25 words.
Keys: starter_pack (array of 3 with id, prompt_text, persona, why_this_prompt, benchmarks_exercised string array max 2 items, expected_answer_preview max 22 words), curation_logic (one sentence).`;

export const OUTREACH_PROMPT = `Beacon stage 5. Output one JSON object only.
Exactly 3 emails (no em dashes, no semicolons). subject max 8 words. body max 55 words each.
Keys: emails (array of 3 with to_archetype, subject, body, cta_type, cta_line, signal_reference), follow_up_variant { context, subject, body max 45 words }.`;

export const CONTENT_PROMPT = `Beacon stage 6. Output one JSON object only. Property names must match exactly.

linkedin_post MUST be an object with keys: hook (max 14 words), body (max 70 words), cta (max 12 words). Do not use title instead of hook.

newsletter_blurb MUST be an object with keys: headline (max 10 words), body (max 75 words). Do not put the headline only in body.

video_topic MUST be an object with keys: working_title, thesis (max 35 words), three_key_points (array of exactly 3 short strings), suggested_expert.

No other top-level keys.`;

export const STAGE_PROMPTS = {
  context: CONTEXT_PROMPT,
  signals: SIGNALS_PROMPT,
  prospects: PROSPECTS_PROMPT,
  assets: ASSETS_PROMPT,
  outreach: OUTREACH_PROMPT,
  content: CONTENT_PROMPT,
} as const;
