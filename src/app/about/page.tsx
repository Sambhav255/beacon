import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-20">
      <h1 className="serif text-6xl font-normal leading-[1.05] text-accent">Why I built this.</h1>

      <div className="h-[200px]" />

      <section className="space-y-7 text-[17px] leading-[1.7] text-text">
        <p>
          Modo Energy is expanding from five markets to twenty. The Growth Associate role, right now, is one person
          plus Imrith. That person is supposed to produce market entry campaigns, feature adoption outreach, content
          across channels, and funnel diagnosis across every market Modo is opening.
        </p>
        <p>
          The math of that role only works one way. One human cannot manually cover twenty markets well. The playbook
          that scales is: the human does the judgment, the taste, and the relationships. An agent does the first pass
          on everything else.
        </p>
        <p>
          That is the leverage model: one operator can run breadth, keep quality, and still spend time on decisions
          that move revenue.
        </p>
        <p>
          So the question is what that agent actually looks like. Not the idea of an agent. The specific, built,
          working version. The Day One version. The one you could deploy in week two of the role.
        </p>
      </section>

      <section className="mt-16 space-y-7 text-[17px] leading-[1.7] text-text">
        <p>The fastest way to answer a question about a job is to do the job. Not describe it. Not plan it. Do it.</p>
        <p>
          Charlotte mentioned that Modo is moving from chat interfaces to agents. She mentioned the one-person growth
          team model. Those two signals, combined with the twenty-markets expansion, point at the same thing: the
          growth hire needs to be an agent-orchestrator, not a campaign manager.
        </p>
      </section>

      <section className="mt-16 space-y-7 text-[17px] leading-[1.7] text-text">
        <p>
          Beacon is a market entry agent. You feed it a geography, and it produces a complete entry kit: executive
          summary, market snapshot, ranked prospects with trigger signals, tailored Ko prompts, drafted outreach, and a
          two-week content calendar.
        </p>
        <p>
          It runs six stages end-to-end. Context building, signal gathering, prospect triangulation, asset matching,
          outreach generation, and content derivatives. You can inspect each stage as it executes.
        </p>
        <p>
          I built this in a day with a curated Modo-grounded data layer and a live generation pipeline. The FCA angle
          is explicit because regulated benchmark credibility is one of Modo&apos;s real moats and should shape outreach.
          The interface is intentionally restrained so the work stays legible.
        </p>
      </section>

      <section className="mt-16 space-y-7 text-[17px] leading-[1.7] text-text">
        <p>
          This is v1. The right operating model is weekly iteration: run it, inspect misses, tighten prompts, and
          improve coverage market by market.
        </p>
        <p>
          It is deliberately narrow. The core loop is market in, six-stage run, execution kit out. Focus beats breadth
          for this demo.
        </p>
        <p>
          Day 30 should run nightly across active expansion markets, pull live public signals, and close the loop into
          outreach systems, the content calendar, and Ko prompt distribution.
        </p>
      </section>

      <section className="mt-16 space-y-7 text-[17px] leading-[1.7] text-text">
        <p>
          This is a vision prototype, not a production system. Some signal inputs are curated for demo stability and
          generation can fail. Generated drafts are directional, not canonical facts, until verified against source
          research.
        </p>
        <p>The point is learning velocity, not polish theater.</p>
      </section>

      <footer className="mt-16 space-y-2 text-[15px] leading-7 text-text-2">
        <p>Built by Sambhav Lamichhane. April 17, 2026.</p>
        <p>For Imrith Sangha and the Modo Energy growth team.</p>
        <p>
          Prompt transparency:{" "}
          <Link href="/prompts" className="text-accent hover:text-accent-hover">
            View all system prompts
          </Link>
        </p>
      </footer>
    </main>
  );
}
