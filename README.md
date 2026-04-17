# Beacon — Package README

You have five files. Here's what each one is and how to use them.

---

## The files

### `PRD.md` — The master spec
Feed this into Cursor as the primary context when you start building. It has everything: product principles, features, UI spec, success criteria, demo script.

### `MARKETS.json` — The data layer
This is the real, curated data for five markets. Drop it into `src/data/markets.json` when you scaffold the project. The agent reads from this.

### `PROMPTS.md` — The six system prompts
Paste these as TypeScript constants into `src/lib/prompts.ts`. Each powers one stage of the agent.

### `BUILD_PLAN.md` — Step-by-step Cursor instructions
This is your execution guide. Work through it phase by phase. Don't skip ahead.

### `ABOUT_PAGE.md` — Content for the story page
The problem/solution/build copy Imrith reads after seeing the tool work.

---

## How to use these with Cursor

### Option A — Feed all files at once (recommended)

In Cursor, use the `@` symbol to attach all five files to your first prompt:

```
I'm building Beacon, a market entry agent for Modo Energy.
Full context in attached files: @PRD.md @BUILD_PLAN.md @PROMPTS.md @MARKETS.json @ABOUT_PAGE.md

Start with Phase 1 from BUILD_PLAN.md. Scaffold the Next.js project, set up Groq, and get the agent running end-to-end for Poland. Follow the file structure exactly as specified.
```

### Option B — Phase-by-phase

If Cursor struggles with context size, feed one file at a time per phase:

**Phase 1:** Attach `PRD.md` + `BUILD_PLAN.md` + `MARKETS.json` + `PROMPTS.md`
**Phase 2:** Attach `PRD.md` + `BUILD_PLAN.md` only
**Phase 3:** Attach `BUILD_PLAN.md` + `ABOUT_PAGE.md`

---

## Total time budget

**4 hours.** Realistic. Non-negotiable ceiling.

- Phase 1 (core loop working): 90 min
- Phase 2 (full agent, all markets, polish): 60 min
- Phase 3 (transparency drawer, deploy): 45 min
- Phase 4 (stretch features): 30 min — cut this if you're behind

If you hit 3.5 hours and Phase 2 isn't done, stop adding features. Polish what works and deploy.

---

## Critical decisions already made for you

1. **Name is Beacon.** Don't second-guess. It fits Modo's register.
2. **Tech stack is fixed.** Next.js + Groq + Tailwind. No swapping.
3. **Five markets.** Poland, Germany, Spain, Italy, France. Don't add more.
4. **No real company names in prospects.** Archetypes only. Protects against errors.
5. **Don't publish LinkedIn drafts that use "unlock", "game-changer", "revolutionize".** Prompts explicitly forbid this.

---

## What to do BEFORE you open Cursor

1. Get a Groq API key at console.groq.com (2 min)
2. Create the GitHub repo (2 min)
3. Read `PRD.md` once through (10 min)
4. Decide: is this worth four hours of your life tonight, or should you sleep?

Honest answer to #4: if you're tired, sleep. The prep docs already position you to win this interview. Beacon is upside, not baseline.

If you build it: do it in one focused session. Don't start and stop.

---

## What to do AFTER you build

1. **Practice the demo three times.** Exactly 90 seconds. Time yourself.
2. **Pre-load the Poland kit** in a browser tab before the call so it's instant.
3. **Have a screenshot backup** of the finished kit, just in case.
4. **Do NOT send the link to Charlotte ahead of the call.** Show it in the interview, not before.
5. **Sleep.** 7+ hours. Your judgment tomorrow matters more than polish tonight.

---

## Demo opening line — commit this to memory

"Charlotte mentioned Modo is moving toward agents, and that the growth team is one hire plus you. So I built the first version of what I'd deploy Day One. Can I show you in ninety seconds?"

Then share your screen. Let the tool speak.

---

Built by Sambhav Lamichhane. April 17, 2026.
