# About page copy

Paste this content into `src/app/about/page.tsx` with editorial styling (max-width 700px, serif headlines, generous line-height, no flashy elements).

---

## The page structure

```
1. Hero: title + single subtitle
2. The problem (2-3 paragraphs)
3. The insight (2 paragraphs)
4. What I built (3 paragraphs)
5. What Day 30 looks like (1 paragraph)
6. Honest caveats (1 paragraph)
7. Footer / attribution
```

---

## Full copy

### Title
Why I built this.

### Subtitle
A market entry agent for Modo's growth team, built in a day, as an interview for a role that covers twenty markets.

---

### Section 1 · The problem

Modo Energy is expanding from five markets to twenty. The Growth Associate role, right now, is one person plus Imrith. That person is supposed to produce market entry campaigns, feature adoption outreach, content across channels, and funnel diagnosis across every market Modo is opening.

The math of that role only works one way. One human cannot manually cover twenty markets well. The playbook that scales is: the human does the judgment, the taste, and the relationships. An agent does the first pass on everything else.

So the question is what that agent actually looks like. Not the idea of an agent. The specific, built, working version. The Day One version. The one you could deploy in week two of the role.

### Section 2 · The insight

The fastest way to answer a question about a job is to do the job. Not describe it. Not plan it. Do a small version of it.

Charlotte mentioned that Modo is moving from chat interfaces to agents. She mentioned the Anthropic one-person growth team as the shape Modo wants to replicate. Those two signals, combined with the twenty-markets expansion, point at the same thing: the growth hire needs to be an agent-orchestrator, not a campaign manager.

### Section 3 · What I built

Beacon is a market entry agent. You feed it a geography, and it produces a complete entry kit — executive summary, market snapshot, ranked prospect deck with trigger signals, tailored Ko starter prompts, drafted outreach emails, and a two-week content calendar.

It runs six stages end-to-end. Context building, signal gathering, prospect triangulation, asset matching, outreach generation, content derivatives. You watch each stage execute. The reasoning is visible, the prompts are visible, the output is grounded in real Modo research.

I built this in a day, with Groq's API, Next.js, and Cursor. The data layer is pre-curated from Modo's own published research. The generation layer is live. The UI tries to feel native to modoenergy.com.

### Section 4 · What Day 30 looks like

The version of this I would build in the role, over thirty days, has three differences. It runs nightly against every active expansion market, unattended, producing fresh kits. It pulls signal data live from public news and filings APIs, not pre-cached. And it closes the loop — the outreach drafts go into Modo's email tool, the content drafts go into Modo's content calendar, the Ko prompts get added to the public Ko Prompt Guide.

### Section 5 · Honest caveats

This is a vision prototype, not a production system. The signal data is curated for the demo. The generation can fail. If Modo actually wanted this in production, the architecture would look different. What this prototype proves is not that the tool is ready — it proves that the person building it can think at this level, move at this speed, and ship a working thing in a day.

That was the point.

---

### Footer

Built by Sambhav Lamichhane. April 17, 2026.

For Imrith Sangha and the Modo Energy growth team.

---

## Notes on styling this page

- Use serif for all headings, including the title
- The title sits alone on the page, no subtitle under it, for ~200px of space
- Body paragraphs: 17px, line-height 1.7
- Section spacing: 64px between sections
- No bullet points anywhere on this page. Prose only.
- No callouts, badges, or boxes. Pure editorial flow.
- Max width 640px
- Subtle accent color (amber) only for the title, nothing else

## Critical do-nots for this page

- Do not use the word "revolutionary"
- Do not use the phrase "I'm passionate about"
- Do not list technologies or stack ("built with Next.js + Tailwind + Groq + ..."). The build plan page can handle that. This page is about the thinking, not the tools.
- Do not thank Modo or Imrith sycophantically
- Do not claim this is a "game-changer" or any similar language
- Do not apologize for the prototype being a prototype. Own it cleanly.

## Tone reference

Read the Modo principles document. Match that register. Confident but unflashy. Specific numbers where relevant. Short sentences. No filler.
