# Beacon — Cursor Build Plan

Step-by-step instructions to go from zero to deployed. Follow phase-by-phase. Don't skip ahead.

**Total time budget:** 3-4 hours. Interview is tomorrow. Ship Phase 1-3 minimum. Phase 4 only if time.

---

## Before you start

### Set up accounts (5 min)
- [ ] Groq account + API key at console.groq.com
- [ ] Vercel account connected to GitHub
- [ ] Fresh GitHub repo: `beacon-modo`

### Local setup (5 min)
```bash
npx create-next-app@latest beacon --typescript --tailwind --app --src-dir --import-alias "@/*"
cd beacon
npm install groq-sdk lucide-react framer-motion zustand
npm install -D @types/node
```

### Environment variables
Create `.env.local`:
```
GROQ_API_KEY=your_key_here
```

Also add to `.gitignore` (Next.js does this by default, verify).

---

## Phase 1 — Core loop (90 minutes)

### Goal
You can run the agent against Poland and see a real kit appear with live Groq output.

### Step 1.1 — Project structure (10 min)
Create these folders/files:
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing
│   ├── agent/
│   │   └── page.tsx          # Agent interface
│   ├── kit/
│   │   └── [market]/
│   │       └── page.tsx      # Generated kit view
│   ├── about/
│   │   └── page.tsx          # About page
│   └── api/
│       └── agent/
│           └── route.ts      # Groq API handler
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── agent/
│   │   ├── MarketSelector.tsx
│   │   ├── StageStream.tsx
│   │   └── KitRenderer.tsx
│   └── layout/
│       ├── Nav.tsx
│       └── Footer.tsx
├── lib/
│   ├── groq.ts               # Groq client setup
│   ├── prompts.ts            # All 6 stage prompts
│   ├── agent.ts              # Orchestration logic
│   └── types.ts              # Shared types
└── data/
    ├── markets.json          # Paste MARKETS.json content
    └── modo-assets.json
```

### Step 1.2 — Global styles (10 min)

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap');

:root {
  --bg: #0a0a0a;
  --surface: #141414;
  --surface-alt: #1c1c1c;
  --border: #2a2a2a;
  --border-strong: #3a3a3a;
  --text: #f5f5f0;
  --text-2: #a0a0a0;
  --text-3: #6a6a6a;
  --accent: #d4a574;
  --accent-hover: #e4b584;
  --success: #7ab87a;
  --warning: #c8945a;
  --signal: #b07a3f;
}

* { box-sizing: border-box; }

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.serif { font-family: 'Instrument Serif', serif; }
.mono { font-family: 'JetBrains Mono', monospace; }

.h1 { font-family: 'Instrument Serif', serif; font-size: 48px; line-height: 1.1; font-weight: 400; }
.h2 { font-family: 'Instrument Serif', serif; font-size: 32px; line-height: 1.2; font-weight: 400; }
.h3 { font-size: 20px; font-weight: 500; }
.micro { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); }
```

### Step 1.3 — Tailwind config (5 min)

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        signal: 'var(--signal)',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Step 1.4 — Groq client setup (5 min)

`src/lib/groq.ts`:
```ts
import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export const MODEL = 'llama-3.3-70b-versatile';
```

### Step 1.5 — Type definitions (5 min)

`src/lib/types.ts`:
```ts
export type StageId = 'context' | 'signals' | 'prospects' | 'assets' | 'outreach' | 'content';

export type StageStatus = 'pending' | 'running' | 'complete' | 'error';

export interface Stage {
  id: StageId;
  name: string;
  status: StageStatus;
  output?: any;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface Market {
  id: string;
  name: string;
  flag: string;
  status: string;
  tagline: string;
  market_snapshot: Record<string, any>;
  modo_research: any[];
  active_signals: any[];
  prospect_archetypes: any[];
  ko_starter_prompts: any[];
}

export interface Kit {
  market: string;
  generatedAt: number;
  durationMs: number;
  stages: Record<StageId, Stage>;
}
```

### Step 1.6 — Prompts file (10 min)

`src/lib/prompts.ts` — paste all 6 prompts from `PROMPTS.md`. Each as an exported constant:
```ts
export const CONTEXT_PROMPT = `You are Beacon...`;
export const SIGNALS_PROMPT = `...`;
export const PROSPECTS_PROMPT = `...`;
export const ASSETS_PROMPT = `...`;
export const OUTREACH_PROMPT = `...`;
export const CONTENT_PROMPT = `...`;
```

### Step 1.7 — Agent orchestration (15 min)

`src/lib/agent.ts`:
```ts
import { groq, MODEL } from './groq';
import * as prompts from './prompts';

async function callStage(systemPrompt: string, userContext: any, temp: number = 0.7) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(userContext) },
    ],
    temperature: temp,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  return JSON.parse(content || '{}');
}

export async function* runAgent(marketData: any) {
  const results: any = {};

  // Stage 1: Context
  yield { stage: 'context', status: 'running' };
  results.context = await callStage(prompts.CONTEXT_PROMPT, {
    market: marketData.name,
    modo_research: marketData.modo_research,
    market_snapshot: marketData.market_snapshot,
  }, 0.3);
  yield { stage: 'context', status: 'complete', output: results.context };

  // Stage 2: Signals
  yield { stage: 'signals', status: 'running' };
  results.signals = await callStage(prompts.SIGNALS_PROMPT, {
    market: marketData.name,
    signals: marketData.active_signals,
    modo_position: results.context.modo_position,
  }, 0.3);
  yield { stage: 'signals', status: 'complete', output: results.signals };

  // Stage 3: Prospects
  yield { stage: 'prospects', status: 'running' };
  results.prospects = await callStage(prompts.PROSPECTS_PROMPT, {
    market: marketData.name,
    signals: results.signals,
    archetype_catalog: marketData.prospect_archetypes,
    modo_research_available: marketData.modo_research,
  }, 0.5);
  yield { stage: 'prospects', status: 'complete', output: results.prospects };

  // Stage 4: Assets
  yield { stage: 'assets', status: 'running' };
  results.assets = await callStage(prompts.ASSETS_PROMPT, {
    market: marketData.name,
    prospects: results.prospects.prospects,
    asset_catalog: { research: marketData.modo_research, benchmarks: [] },
  }, 0.6);
  yield { stage: 'assets', status: 'complete', output: results.assets };

  // Stage 5: Outreach
  yield { stage: 'outreach', status: 'running' };
  results.outreach = await callStage(prompts.OUTREACH_PROMPT, {
    market: marketData.name,
    top_prospects: results.prospects.prospects.slice(0, 4),
    starter_pack: results.assets,
    signed_by: 'Sambhav',
  }, 0.7);
  yield { stage: 'outreach', status: 'complete', output: results.outreach };

  // Stage 6: Content
  yield { stage: 'content', status: 'running' };
  results.content = await callStage(prompts.CONTENT_PROMPT, {
    market: marketData.name,
    signals: results.signals,
    prospects: results.prospects,
    starter_pack: results.assets,
  }, 0.7);
  yield { stage: 'content', status: 'complete', output: results.content };

  return results;
}
```

### Step 1.8 — API route (10 min)

`src/app/api/agent/route.ts`:
```ts
import { NextRequest } from 'next/server';
import { runAgent } from '@/lib/agent';
import marketsData from '@/data/markets.json';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { marketId } = await req.json();
  const marketData = (marketsData as any)[marketId];

  if (!marketData) {
    return new Response('Market not found', { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runAgent(marketData)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ stage: 'done' })}\n\n`));
      } catch (error) {
        console.error(error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ stage: 'error', error: String(error) })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### Step 1.9 — Basic agent page (20 min)

`src/app/agent/page.tsx`:
```tsx
'use client';
import { useState } from 'react';
import marketsData from '@/data/markets.json';

export default function AgentPage() {
  const [selected, setSelected] = useState<string>('poland');
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  async function runAgent() {
    setRunning(true);
    setEvents([]);

    const res = await fetch('/api/agent', {
      method: 'POST',
      body: JSON.stringify({ marketId: selected }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
      for (const line of lines) {
        const data = JSON.parse(line.slice(6));
        setEvents((prev) => [...prev, data]);
      }
    }

    setRunning(false);
  }

  const markets = Object.values(marketsData).filter((m: any) => m.id);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="h2 mb-2">Beacon</h1>
      <p className="text-text-2 mb-8">Market Entry Agent</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {markets.map((m: any) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`px-4 py-2 border text-sm transition-colors ${
              selected === m.id
                ? 'border-accent text-accent'
                : 'border-border text-text-2 hover:border-border-strong'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <button
        onClick={runAgent}
        disabled={running}
        className="px-6 py-3 bg-accent text-bg font-medium hover:bg-accent-hover disabled:opacity-50"
      >
        {running ? 'Running...' : 'Run agent'}
      </button>

      <div className="mt-10 space-y-4">
        {events.map((e, i) => (
          <div key={i} className="border border-border p-4">
            <div className="micro mb-2">
              Stage: {e.stage} · {e.status}
            </div>
            {e.output && (
              <pre className="text-xs overflow-auto text-text-2">
                {JSON.stringify(e.output, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
```

### Step 1.10 — Test end-to-end (10 min)
- [ ] `npm run dev`
- [ ] Go to `/agent`
- [ ] Click "Run agent" for Poland
- [ ] Verify each stage streams output
- [ ] Fix any JSON parse errors (common on first run)

**Phase 1 done when:** Agent runs end-to-end for Poland with live Groq output streaming stage-by-stage.

---

## Phase 2 — Full agent (60 minutes)

### Step 2.1 — Landing page (15 min)

`src/app/page.tsx`:
```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="h3 serif">Beacon</div>
          <div className="flex gap-8 text-sm text-text-2">
            <Link href="/agent" className="hover:text-text">Agent</Link>
            <Link href="/about" className="hover:text-text">About</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-8 py-24">
        <div className="micro mb-6">Built for Modo Energy · Prototype</div>
        <h1 className="h1 mb-6">
          A market entry agent for<br />Modo's growth team.
        </h1>
        <p className="text-lg text-text-2 max-w-2xl mb-10">
          Built for the person covering twenty markets, not five. Grounded in your published research,
          your regulated benchmarks, and Ko.
        </p>
        <Link
          href="/agent"
          className="inline-block px-6 py-3 bg-accent text-bg font-medium hover:bg-accent-hover"
        >
          Run agent →
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="micro mb-3">Grounded</div>
            <h3 className="h3 mb-2 serif">In real Modo research</h3>
            <p className="text-text-2 text-sm">
              Every prospect, prompt, and outreach draft references specific, published Modo work.
              No hallucinations.
            </p>
          </div>
          <div>
            <div className="micro mb-3">Agentic</div>
            <h3 className="h3 mb-2 serif">Six stages, visible</h3>
            <p className="text-text-2 text-sm">
              Context, signals, prospects, assets, outreach, content. You watch it think.
              Nothing hidden.
            </p>
          </div>
          <div>
            <div className="micro mb-3">Shippable</div>
            <h3 className="h3 mb-2 serif">A kit, not a dashboard</h3>
            <p className="text-text-2 text-sm">
              Output is a document a salesperson can use tomorrow. Not a metrics panel.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### Step 2.2 — Polished agent interface (25 min)

Rebuild `src/app/agent/page.tsx` with:
- Stage cards (pending/running/complete states)
- Animated transitions between stages
- Each stage shows a preview of its output inline
- On completion, scroll smoothly to the rendered kit below
- Keep a "history" dropdown on the side

See `UI_COMPONENTS.md` for the component specs.

### Step 2.3 — Kit renderer (20 min)

Build the 8 sections of the kit rendering from the agent output:
1. Kit header (market, timestamp, meta badge)
2. Executive summary (from stage 1)
3. Market snapshot (from market data)
4. Active signals (from stage 2)
5. Prospect deck (from stage 3, as cards)
6. Ko starter pack (from stage 4)
7. Outreach drafts (from stage 5, with copy buttons)
8. Content calendar (from stage 6)

Each section follows the same layout pattern: micro label, h2 heading, content block.

**Phase 2 done when:** Every market produces a complete, beautiful kit that looks native to Modo.

---

## Phase 3 — Polish (45 minutes)

### Step 3.1 — Agent transparency drawer (15 min)
Collapsible right-side panel showing:
- The system prompt for the current stage
- The input context sent
- The raw JSON output
- Token count and latency

Label it "Agent internals · For the curious."

### Step 3.2 — About page (15 min)

Paste content from `ABOUT_PAGE.md` into `src/app/about/page.tsx`. Style with editorial layout — max-width 700px, serif headlines, generous leading.

### Step 3.3 — Copy to clipboard (10 min)
Add copy buttons to:
- Each Ko starter prompt
- Each outreach draft
- The LinkedIn post
- The newsletter blurb

Use a subtle toast confirmation.

### Step 3.4 — Deploy to Vercel (5 min)
```bash
git add . && git commit -m "beacon v1"
git push
```
Then in Vercel:
- Import repo
- Add `GROQ_API_KEY` env var
- Deploy

Try to get a custom subdomain if time: `beacon.vercel.app` or similar.

**Phase 3 done when:** Production URL works, looks polished, demo is bulletproof.

---

## Phase 4 — Stretch (30 minutes, only if time)

### Step 4.1 — Follow-up chat
After a kit renders, show a chat box below: "Ask Beacon anything about this kit."
Wire up a simple chat endpoint that takes the kit as context.

### Step 4.2 — Market comparison
`/compare?a=poland&b=germany` view that shows two kits side-by-side with diff highlights.

### Step 4.3 — PDF export
Use `html2canvas` + `jsPDF` to export the rendered kit as a clean PDF.

---

## Pre-demo checklist

Before closing the laptop tonight:

- [ ] `npm run build` succeeds with zero errors
- [ ] Deployed URL loads cleanly on mobile and desktop
- [ ] All 5 markets produce kits without errors
- [ ] Copy buttons work
- [ ] About page reads well
- [ ] No console errors in production
- [ ] No "TODO" placeholder text anywhere visible
- [ ] Sambhav's name appears only in footer, not hero
- [ ] URL is memorable enough to type in the interview

## Known failure modes and how to handle them

**Groq returns malformed JSON.** Wrap every parse in try/catch. Fall back to a pre-cached kit for that market. Log the raw output to console for debugging.

**Rate limit hit mid-demo.** Pre-cache all 5 kits as JSON files in `/data/cache/`. If live API call fails, load the cached version with a 3-second artificial delay. Honesty caveat: keep a small "cached run" badge if using cache.

**Stage takes too long.** Set a 10-second timeout per stage. If hit, use cache.

**One prompt consistently fails.** Simplify it. Reduce the JSON schema complexity. Fewer fields.

**Vercel timeout.** Ensure `maxDuration = 60` is set in the route. Or convert to a non-streaming endpoint for stability — trade off the live feel for reliability.

## Demo safety rules

1. **Never demo with a fresh run first.** Always demo the cached Poland kit first so Imrith sees a beautiful finished output. Then offer to run a fresh one.
2. **Have a backup browser tab with the production URL pre-loaded to the kit view.** In case your main window misbehaves.
3. **Close all other tabs and notifications.** Clean desktop.
4. **Test the demo on your actual interview setup** (camera on, screen share, etc.) tomorrow morning. Not just in your dev environment.

## If something goes catastrophically wrong

You still have:
- The take-home submission
- Vigil
- The prep docs and answers
- The ability to talk through Beacon as a concept without showing it

Don't let the build stress compromise your actual interview prep. If you've spent 4 hours and it's still broken at 9pm tonight, stop and sleep. The conversation matters more than the demo.

---

**Built by Sambhav Lamichhane. For Imrith. April 17, 2026.**
