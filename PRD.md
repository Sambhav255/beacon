# Beacon — Product Requirements Document

**AI Market Entry Agent for Modo Energy**

Built by Sambhav Lamichhane · For Imrith Sangha interview · April 17, 2026

---

## 1. One-line summary

Beacon is an AI agent that takes a new geography as input and produces a complete Day-One market entry kit for Modo Energy's growth team — grounded in real Modo research, real regulatory context, and real prospect signals.

## 2. Why this exists

Modo is expanding from 5 to 20 markets. The growth function is one hire plus Imrith. The math of one person covering twenty markets only works if agents handle the first pass on most of it. Beacon is the first version of that agent.

This is not a pitch for a product Modo should build. It is a prototype of how the Growth Associate role operates on Day One.

## 3. Product principles

Six principles for every decision in the build. In order of priority.

1. **Grounded in real Modo assets.** Every generated output references a real published Modo research piece, a real regulated benchmark, or a real Ko starter prompt. Never fabricate.
2. **Agentic, not chatbot.** The agent has steps, visible reasoning, and produces a structured deliverable. Users see the thinking.
3. **Ship the document, not the dashboard.** The output is a self-contained Market Entry Kit the user can hand to a salesperson or publish as a brief. Not a metrics screen.
4. **Modo visual fidelity.** The UI should feel native to modoenergy.com. Dark background, serif display type, sans-serif body, editorial layout, subtle motion. No Silicon Valley startup aesthetic.
5. **Honesty about the prototype.** Where data is pre-cached, say so. Where live, show it live. Never pretend.
6. **Demo under 90 seconds.** Every interaction path should be demoable in 90 seconds or less.

## 4. Who uses it

**Primary user:** Sambhav, in the role. Runs Beacon weekly against each expansion market.

**Secondary user:** Imrith, reviewing the output to decide which markets to prioritize for the week.

**Tertiary user (future):** the rest of the growth team as it scales.

## 5. Core user journey

1. User lands on Beacon, sees the concept and a CTA.
2. User picks a target market (Poland, Germany, Spain, Italy, France, or custom).
3. Optionally picks a persona focus and a commercial angle.
4. Clicks "Run agent."
5. Watches the agent stream its thinking through six stages.
6. Receives a full Market Entry Kit — executive summary, 10 prospect cards, 8 Ko starter prompts, 5 outreach drafts, 3 content derivatives.
7. Can copy any section, export the full kit as PDF, or ask follow-up questions via chat.
8. Can compare two markets side-by-side.

## 6. The agent — six stages

The agent runs a visible six-step chain. Each step streams its output and shows a time elapsed. The user can expand any stage to see the detailed reasoning.

### Stage 1 — Context Building
Loads Modo's existing published research for the target market. Grounds the agent in what Modo already says publicly. Sources are displayed as citations.

### Stage 2 — Signal Gathering
Scans real market signals for the last 30-60 days — recent project announcements, capacity auction results, regulatory changes, fund closings, conference activity. For demo: pulls from pre-curated signal packs. Production version would call live news APIs.

### Stage 3 — Prospect Triangulation
Cross-references signals against Modo's customer archetypes (developer, optimiser, asset manager, fund, trader). Produces a ranked list of 10 prospect profiles with the specific trigger signal that makes each relevant right now.

### Stage 4 — Asset Matching
For each prospect, picks the most relevant Modo research piece and the most relevant Ko starter prompt. Grounded in FCA-regulated benchmarks where applicable.

### Stage 5 — Outreach Generation
Drafts persona-specific, signal-aware outreach. Not generic. Each draft references the specific signal, the specific Modo asset, and offers a clear CTA.

### Stage 6 — Content Derivatives
Produces a LinkedIn post targeting the market, a newsletter angle for the Weekly Dispatch, and a suggested video topic for the Energy Academy.

## 7. The output — Market Entry Kit

The kit is a single scrollable document with eight sections.

### 7.1 Kit header
- Target market name
- Generated timestamp
- "Meta" badge showing time-to-generate and an estimate of manual-equivalent hours saved
- Run ID for reproducibility

### 7.2 Executive summary
Three paragraphs. State of the market. Top opportunity. Recommended first move.

### 7.3 Market snapshot
Key quantitative context. Current operational capacity. Pipeline size. Regulatory status. Top revenue drivers. Pulled from Modo research. Each data point cited.

### 7.4 Active signals
The last 30-60 days of market activity. Fund closings, project announcements, regulatory changes, competitor moves. Each signal has a source link and a "so what" line.

### 7.5 Prospect deck
10 prospect cards. Each card shows:
- Prospect archetype (e.g., "Developer · 500MW+ pipeline · Central Europe")
- Trigger signal (specific, dated)
- Pain point inferred from the signal
- Matched Modo research piece
- Matched Ko starter prompt
- Recommended outreach channel
- Priority score (high / medium / watch)

### 7.6 Ko starter pack
8 Ko starter prompts tailored for this market. Each shows:
- The prompt text
- The persona it's designed for
- The benchmark or dataset it will exercise
- A one-line preview of the kind of answer Ko would produce

### 7.7 Outreach drafts
5 cold outreach drafts — one per persona plus a follow-up variant. Each is:
- Subject line
- Body (under 100 words)
- Specific signal reference
- Clear CTA to either a Modo research piece, a Ko trial, or a 15-minute call

### 7.8 Content calendar
A suggested two-week content sprint:
- One LinkedIn post (with hook, body, CTA)
- One newsletter blurb for the Weekly Dispatch
- One Energy Academy video topic (with thesis, 3 key points, suggested expert)

## 8. Secondary features

### 8.1 Agent transparency drawer
A collapsible panel showing the actual system prompts and reasoning traces. This is deliberate. Modo's culture doc says radical transparency. The prompt engineering should not be hidden.

### 8.2 Pre-cached examples
Poland, Germany, Spain, Italy, France have pre-run kits that load instantly. Framed as "examples from this morning's run." This guarantees the demo works even if live generation hiccups.

### 8.3 Live mode
Toggle that runs the agent fresh against the Groq API. Takes 20-40 seconds. Streams visibly. This is the flagship demo moment.

### 8.4 Follow-up chat
After a kit generates, user can ask the agent questions about it. "Why did you prioritize Zenobe over Gresham?" "What if I wanted to lead with the FCA angle instead?" Uses the kit content as context.

### 8.5 Market comparison
Side-by-side view of two kits. Useful for deciding which market to prioritize first.

### 8.6 Export as PDF
Single-click PDF export of the kit. Clean layout, Modo-branded. Suitable for forwarding.

### 8.7 "About Beacon" page
The problem-solution-build page Sambhav asked for. Tells the story.

## 9. Pages / routes

```
/                   Landing page — hero + run CTA
/agent              Main agent interface
/kit/[market]       Generated kit view (shareable URL)
/compare            Two-market comparison
/about              About Beacon — the problem/solution/build story
/prompts            Transparency page — system prompts used
```

## 10. Tech stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **LLM:** Groq API (`llama-3.3-70b-versatile` — fast, capable, free tier)
- **Icons:** Lucide React
- **Fonts:** Instrument Serif (display) + Inter (body) from Google Fonts
- **PDF:** `@react-pdf/renderer` or `html2canvas` + `jsPDF`
- **Animations:** Framer Motion for stage transitions
- **Deployment:** Vercel
- **State:** Zustand or React Context for agent run state

## 11. Visual design system

### Palette
```
background     #0a0a0a   (near-black, warmer than pure black)
surface        #141414   (card background)
surface-alt    #1c1c1c   (hover state)
border         #2a2a2a   (subtle)
border-strong  #3a3a3a   (input focus)
text-primary   #f5f5f0   (warm off-white)
text-secondary #a0a0a0   (muted gray)
text-tertiary  #6a6a6a   (very muted)
accent         #d4a574   (warm amber — Modo-feeling)
accent-hover   #e4b584
success        #7ab87a   (muted green, not neon)
warning        #c8945a   (muted amber)
signal         #b07a3f   (deeper amber for highlights)
```

### Typography
- Display (headlines): `Instrument Serif`, weights 400
- Body/UI: `Inter`, weights 400 and 500
- Code/data: `JetBrains Mono`, weight 400

### Scale
- H1: 48px serif, line-height 1.1
- H2: 32px serif, line-height 1.2
- H3: 20px sans-serif, weight 500
- Body: 15px sans-serif, line-height 1.6
- Small: 13px sans-serif
- Micro: 11px sans-serif, letter-spacing 0.05em, uppercase for labels

### Layout
- Max content width: 1100px
- Sidebar navigation: 240px fixed left
- Main content: centered with generous padding
- Card radius: 4px (not 12px — Modo uses minimal rounding)
- Border weight: 0.5px wherever possible

### Motion
- Stage transitions: 400ms ease-out
- Streaming text: natural cursor pulse
- Hover states: 150ms color transitions only, no transforms
- No bounces, no springs

## 12. UI structure reference

### Landing page
```
Header: logo, navigation (Agent, About, Prompts)
Hero: "A market entry agent for Modo's growth team."
  Subtitle: "Built for the person covering 20 markets, not 5."
  CTA: "Run agent" button, subtle
Below fold: three-column feature overview
  Grounded in Modo research
  Built on live market signals
  Produces a shippable kit in 30 seconds
Footer: attribution to Sambhav
```

### Agent page
```
Left sidebar: history of previous runs
Center: input form at top, agent streaming below, kit at bottom
Right (optional): transparency drawer toggle
```

### Kit page
```
Header: target market, timestamp, meta badge, export button
Section nav: sticky left rail linking to each section
Main: all 8 sections flowing top to bottom
Footer: "Generated by Beacon · Built by Sambhav"
```

## 13. Groq API integration

### Model selection
Primary: `llama-3.3-70b-versatile` — best available on Groq free tier as of April 2026. Fast enough for streaming, capable enough for structured output.

Fallback: `llama-3.1-70b-versatile` if rate limited.

### Calling pattern
The agent makes six API calls in sequence, each for one stage. This gives the streaming feel and lets each stage have a custom system prompt optimized for its task.

For demo resilience, each stage falls back to pre-cached output if the API fails.

### Rate limit management
Groq free tier allows ~30 requests per minute. Six calls per run = 5 runs per minute ceiling. More than enough for demo. Build in a 200ms delay between stages to feel natural and avoid bursting.

### Streaming
Use Groq's SSE streaming. Pipe directly to the UI via React server components or a client-side fetch stream reader.

## 14. Data architecture

### Market data file (`/data/markets.json`)
Contains the pre-curated signal packs for each market. Sambhav curates this from Modo's actual published research. Schema in `MARKETS.json` file.

### Modo assets file (`/data/modo-assets.json`)
Catalog of Modo research pieces, Ko starter prompts, and regulated benchmarks that the agent can match against. Schema:
```json
{
  "research": [
    {
      "title": "Poland's battery energy storage buildout outlook",
      "url": "https://modoenergy.com/research/en/poland-battery-pipeline-...",
      "tags": ["poland", "buildout", "capacity-market"],
      "persona": ["developer", "fund"],
      "summary": "Modo projects 8-9 GW by 2030 from 28 MW today..."
    }
  ],
  "ko_prompts": [
    {
      "text": "What's the clearing price trajectory for Poland's main capacity auctions through 2028?",
      "persona": "developer",
      "market": "poland",
      "benchmarks_exercised": ["capacity-market"]
    }
  ],
  "benchmarks": [
    {
      "name": "ME BESS GB Index Family",
      "regulated": true,
      "family_members": ["ME BESS GB", "ME BESS GB (1H)", "ME BESS GB (2H)"],
      "region": "GB"
    }
  ]
}
```

### Prompt templates (`/lib/prompts.ts`)
Six system prompts, one per agent stage. See `PROMPTS.md` for the full text of each.

## 15. Phase plan — what to build when

### Phase 1 — Core loop (90 minutes)
- Next.js project scaffolded with Tailwind
- Landing page with hero and nav
- Agent page with market selector
- Groq API integration for one stage end-to-end
- Basic streaming visible in UI
- One market (Poland) works end-to-end with real output

**Ship gate:** You can run the agent against Poland and see a real kit appear.

### Phase 2 — Full agent (60 minutes)
- All six stages wired up
- All five markets with pre-cached data
- Kit page rendering all 8 sections
- About page written and styled
- Copy-to-clipboard on all generated content

**Ship gate:** The full demo flow works without hand-waving.

### Phase 3 — Polish (45 minutes)
- Agent transparency drawer
- Live mode vs cached mode toggle
- Follow-up chat (basic)
- Deploy to Vercel with custom domain if possible

**Ship gate:** Can be demoed to Imrith without apologies.

### Phase 4 — Nice-to-haves if time (30 minutes)
- PDF export
- Market comparison view
- Prompts transparency page

Cut Phase 4 if you're tight on time. Phases 1-3 is the demo.

## 16. Demo script — 90 seconds to Imrith

**Opening — 10 seconds.**
"Charlotte mentioned Modo is moving toward agents. She also mentioned the growth team is currently one person plus you. So I built the first version of what I'd deploy Day One — an agent that handles the first pass on market entry work, so that the one-person growth team math actually works."

**Show the landing page — 10 seconds.**
Let him read the hero. Say nothing.

**Pick Poland — 15 seconds.**
"I'll pick Poland because you're actively entering there. I could pick Germany or Spain too — they're pre-cached. Or he could type a custom market."
Click run.

**Watch it stream — 30 seconds.**
Don't narrate every stage. Let it run. If he asks what's happening, explain briefly.

**Scroll the output — 20 seconds.**
"It's grounded in your actual published research — here's the buildout piece cited. Here are ten prospect archetypes with trigger signals. Here are Ko starter prompts tailored to Polish developers. And here's a two-week content calendar I could execute the first week in the role."

**Close — 5 seconds.**
"Built in a day. Ship version would be running nightly across all twenty markets."

Then hand the mouse back. Let him drive.

## 17. About page content

See `ABOUT_PAGE.md` for the full copy. The page should be written in the Modo voice — direct, unflashy, high-conviction.

## 18. What I'm explicitly not building

- Not a Ko competitor — Beacon uses Ko, doesn't replace it
- Not a CRM — no prospect management, no contact data, no pipeline tracking
- Not a production system — vision prototype, honest about it
- Not fabricating competitive data — only uses publicly known Modo research

## 19. Open questions / decisions to make during build

1. Should the agent include a pricing or ACV estimate per prospect? Probably not — feels over-reaching for a vision prototype.
2. Should live mode actually hit real news APIs? Probably no for v1 (adds dependency risk). Yes for v2.
3. Should the PDF export be branded "Modo" or "Beacon"? Beacon — this is not a Modo product, it's a proposal.
4. Should Sambhav's name appear on the kit? Only in the footer. Main kit should look like a Modo-grade asset.

## 20. Success criteria for the interview

Minimum — Beacon runs end-to-end without errors, demo fits in 90 seconds, Imrith understands what it is in the first 30 seconds.

Target — Imrith asks a follow-up question about how it would scale or what v2 looks like. That means he's already imagining using it.

Stretch — Imrith asks if he can keep the link to share with the team.

---

**Built by Sambhav Lamichhane. April 17, 2026. One day before the interview.**
