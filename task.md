# Beacon — Overnight Task Queue

Tasks to run after Phase 1-3 is complete. Ordered by value-per-risk — highest first, stretch last.

**Critical instructions for Cursor:**

1. **Commit after every task completes.** One commit per task, with a clear message. This way if task 7 breaks something, tasks 1-6 are safely shipped.
2. **Run `npm run build` after each task.** If the build fails, revert that task's changes and move to the next.
3. **Do not modify `MARKETS.json`, `src/lib/prompts.ts`, or `src/lib/agent.ts`** unless the task explicitly says to. These are the working core.
4. **If you hit three failures in a row, stop and wait for human review.** Better to ship fewer polished things than break the working demo.

---

## Task 1 — Pre-cache all five markets (CRITICAL)

**Goal:** Make the demo instantly bulletproof. Every market should load from cache first, with a "Run live" toggle for fresh generation.

**Steps:**
1. Create `scripts/precache.ts` that imports `runAgent` and writes output to `/src/data/cache/{market}.json` for each of the five markets.
2. Run the script once: `npx tsx scripts/precache.ts`. Commit the generated cache files.
3. Modify the agent page to check for cached output first. Show a "cached" badge and a "Run live" button.
4. When "Run live" is clicked, ignore cache and stream fresh.
5. If live run fails, fall back to cache with an honest "live run failed, showing cached result" notice.

**Success:** Every market loads in under 500ms. Live mode still works. Demo is protected from API failures.

---

## Task 2 — Error handling and timeouts

**Goal:** No crashes during the demo, no matter what goes wrong with the API.

**Steps:**
1. Wrap every Groq call in `/src/lib/agent.ts` with try-catch and a 15-second timeout using `Promise.race`.
2. On error, yield a stage event with status 'error' and a user-friendly message.
3. On the client, when an error event arrives, show a small non-destructive toast ("Stage X failed, continuing with cached output") and auto-fall-back to the cached stage output.
4. Add a global error boundary in `src/app/layout.tsx` that catches any uncaught errors and shows a clean fallback UI instead of a white screen.

**Success:** Kill the internet mid-demo. The page still renders a complete kit. No white screens, no cryptic errors.

---

## Task 3 — Loading states and streaming polish

**Goal:** The agent feels alive, not janky, during generation.

**Steps:**
1. Add skeleton loaders for each stage card that show before the stage starts running.
2. When a stage completes, fade its output in over 300ms using Framer Motion's `AnimatePresence`.
3. Prospect cards should stagger their entrance by 50ms each.
4. Add a subtle pulsing cursor effect on the currently-running stage.
5. Smooth-scroll to the kit section when all six stages complete.

**Success:** The agent run feels like a polished product, not a script running.

---

## Task 4 — FCA and benchmark annotations

**Goal:** Reinforce the regulated-benchmark moat Imrith cares about. Every touch point should subtly reference the FCA authorization.

**Steps:**
1. In the Ko starter pack renderer, detect when a prompt's `benchmarks_exercised` array contains "ME BESS GB" or similar regulated benchmarks. Show a small pill that reads "FCA-regulated" in muted amber next to the prompt.
2. In the outreach drafts, when a CTA mentions a regulated benchmark, bold it subtly (font-weight 500, accent color).
3. On the kit header, add a one-line footnote: "All citations reference Modo Energy's published research. Benchmarks referenced are FCA-authorised where applicable."
4. On the landing page, in the "Grounded" feature card, add a sub-bullet: "FCA-authorised benchmarks where applicable."

**Success:** The regulated-benchmark moat shows up naturally throughout the product, never forced.

---

## Task 5 — Meta polish and page titles

**Goal:** If Imrith shares this link in Slack, it looks professional.

**Steps:**
1. Create a simple favicon — a small lighthouse icon or a stylized "B" in the amber accent color. Save as `/app/icon.svg`.
2. Add Open Graph tags in `src/app/layout.tsx`:
   - title: "Beacon — Market Entry Agent for Modo Energy"
   - description: "A vision prototype by Sambhav Lamichhane."
   - image: a 1200x630 OG image with the Beacon wordmark
3. Set dynamic page titles per route: "Beacon", "Beacon · Agent", "Beacon · Poland Kit", etc.
4. Create `/app/opengraph-image.tsx` that generates a clean OG card using the Instrument Serif wordmark on dark background.

**Success:** Pasting the URL in Slack produces a clean preview card.

---

## Task 6 — Keyboard shortcuts

**Goal:** Feels like a pro tool, not a web form.

**Steps:**
1. Add `cmd+k` (mac) / `ctrl+k` (windows) to open a market switcher command palette. Use `cmdk` npm package.
2. Add `cmd+enter` to run the agent.
3. Add `cmd+/` to toggle the transparency drawer.
4. Add a small "?" icon in the bottom-right corner that shows all keyboard shortcuts when hovered.

**Success:** Imrith can navigate the app without the mouse if he wants to.

---

## Task 7 — Suggested follow-up questions

**Goal:** Every kit ends with three clickable suggestions that prompt deeper exploration. Demonstrates agent extensibility.

**Steps:**
1. After a kit renders, show a section titled "Go deeper" with three suggested questions, each a button:
   - "Why did you prioritize [top prospect] over [second prospect]?"
   - "What if I lead with the FCA angle instead?"
   - "Show me week 2 of the content calendar."
2. Clicking a suggestion opens a chat panel on the right side.
3. The chat endpoint takes the full kit as system context and answers the follow-up.
4. Use the same Groq model. Stream the response.

**Success:** The kit feels like the start of a conversation, not a final deliverable.

---

## Task 8 — Print stylesheet and clean view

**Goal:** Imrith can print the kit as a PDF or share it in a clean view.

**Steps:**
1. Add `?clean=true` URL parameter that hides the nav and any interactive elements.
2. Add `@media print` CSS that:
   - Removes dark background (prints white)
   - Keeps typography intact
   - Shows URLs after link text
   - Adds page breaks between kit sections
3. Add a "Print / Save as PDF" button on the kit page that triggers `window.print()`.

**Success:** The kit prints as a clean, shareable document.

---

## Task 9 — Agent logs page

**Goal:** Show the transparency principle in action. Demonstrates observability thinking.

**Steps:**
1. Create `/logs` page that shows the last 10 agent runs.
2. Each entry shows: market, timestamp, duration, stages completed, token count (estimated).
3. Store run metadata in `localStorage` on the client — no backend needed.
4. Make the page read-only and clean, styled like a compact data table.

**Success:** Imrith can see a history of everything the agent has done. Reinforces "nothing hidden."

---

## Task 10 — System prompts transparency page

**Goal:** Show prompt engineering depth. Demonstrates you understand the craft behind the magic.

**Steps:**
1. Create `/prompts` page that displays all six system prompts in a clean, read-only view.
2. Each prompt in a collapsible card showing: the stage, the purpose, the full prompt text, the input schema, the output schema.
3. Add a note at the top: "Everything the agent thinks starts here. Nothing is hidden."
4. Link to `/prompts` from the About page and from the agent transparency drawer.

**Success:** Anyone can audit exactly what the agent is doing under the hood.

---

## Task 11 — Market comparison view (STRETCH)

**Goal:** Answers "which market should we enter first?" visually.

**Steps:**
1. Create `/compare?a=poland&b=germany` route.
2. Render two kits side by side, each scrolling independently.
3. Sticky header at top with market A and market B labels and a swap button.
4. Use responsive breakpoints — stack vertically on narrow screens.
5. Only implement if Tasks 1-10 are done. Otherwise skip.

**Success:** Comparing two markets feels natural and useful.

---

## Task 12 — Mobile responsive pass (STRETCH)

**Goal:** Works cleanly on phone if Imrith wants to share with his team.

**Steps:**
1. Test every page on a 375px wide viewport (iPhone SE).
2. Fix: nav collapses to hamburger under 768px.
3. Fix: kit sections stack single-column.
4. Fix: prospect cards go from grid to list.
5. Fix: touch targets are minimum 44x44.

**Success:** Every page is usable on mobile. No horizontal scroll. Nothing cut off.

---

## Task 13 — About page enhancement

**Goal:** The story page should close with a subtle "what's next" signal.

**Steps:**
1. After the "What Day 30 looks like" section, add a small italic paragraph:
   > "If you'd like to see a working version in production, I'd build it in the first two weeks of the role. That's the offer."
2. Keep the rest of the page as written in ABOUT_PAGE.md.

**Success:** The page ends with a clear, confident call-to-action that isn't salesy.

---

## Task 14 — Final audit pass

**Goal:** Catch the small things before morning.

**Steps:**
1. Check every page for: typos, inconsistent spacing, misaligned elements.
2. Verify all internal links work.
3. Verify all external links (Modo research URLs) work.
4. Verify copy-to-clipboard buttons actually copy what they should.
5. Verify the page loads correctly on the production Vercel URL.
6. Run Lighthouse. Address any accessibility issues (contrast, alt text).
7. Take a screenshot of each page and save to `/public/screenshots/` for Sambhav to review in the morning.

**Success:** No visible issues, no broken links, Lighthouse score above 90 on accessibility.

---

## Do NOT do these tasks (even if tempted)

These are marked explicitly as off-limits tonight. Sambhav decides on these in the morning:

- Do not change the product name from Beacon.
- Do not modify the agent prompts in `src/lib/prompts.ts`.
- Do not modify `MARKETS.json`.
- Do not add new markets beyond the existing five.
- Do not add authentication or user accounts.
- Do not integrate a real email-sending API.
- Do not attempt to add a database or persist data beyond localStorage.
- Do not add analytics or tracking scripts.
- Do not rewrite the About page copy from scratch.

---

## Final commit message

When all tasks complete (or when you stop), make a final commit: `overnight polish complete — ready for demo`.

Leave a summary in `/NOTES_FOR_MORNING.md` listing:
- Which tasks completed successfully
- Which tasks were skipped and why
- Any issues Sambhav should know about before the interview
- Any suggested manual checks before the demo

---

Good luck. Build carefully. Sambhav is counting on you.