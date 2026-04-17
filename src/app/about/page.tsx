import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-20">
      <h1 className="serif text-6xl font-normal leading-[1.05] text-accent">Why I built this.</h1>

      <section className="mt-20">
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-3">The situation</p>
        <h2 className="mt-3 serif text-[28px] font-normal leading-[1.2] text-text">One hire. Twenty markets.</h2>
        <div className="mt-6 space-y-6 text-[15px] leading-[1.7] text-text-2">
          <p>
            Modo is expanding from five markets to twenty. The Growth Associate role is one person plus Imrith. That
            person owns market entry campaigns, feature adoption outreach, content across channels, and funnel diagnosis
            — across every market Modo is opening simultaneously.
          </p>
          <p>
            The math only works one way. One human covering twenty markets manually is a losing proposition. The model
            that scales is: the human does judgment, taste, and relationships. An agent does the first pass on
            everything else.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-3">The build</p>
        <h2 className="mt-3 serif text-[28px] font-normal leading-[1.2] text-text">So I built the agent.</h2>
        <div className="mt-6 space-y-6 text-[15px] leading-[1.7] text-text-2">
          <p>
            Beacon is a market entry agent. You pick a geography. It runs six stages autonomously — context building,
            signal gathering, prospect triangulation, asset matching, outreach generation, content derivatives — and
            produces a complete execution kit.
          </p>
          <div className="border-l-2 border-accent pl-4 text-[15px] leading-[1.7] text-text-2">
            <p className="mb-2">
              <span className="text-accent">→</span> <strong>Executive summary</strong> · State of market, Modo&apos;s
              position, first move
            </p>
            <p className="mb-2">
              <span className="text-accent">→</span> <strong>Market snapshot</strong> · Key metrics from Modo&apos;s
              published research
            </p>
            <p className="mb-2">
              <span className="text-accent">→</span> <strong>Active signals</strong> · What happened in the last 30-60
              days and why it matters
            </p>
            <p className="mb-2">
              <span className="text-accent">→</span> <strong>Prospect deck</strong> · 10 ranked archetypes with trigger
              signals and Ko prompts
            </p>
            <p className="mb-2">
              <span className="text-accent">→</span> <strong>Outreach drafts</strong> · 5 persona-specific emails,
              signal-aware, under 90 words
            </p>
            <p>
              <span className="text-accent">→</span> <strong>Content calendar</strong> · LinkedIn post, newsletter
              blurb, Energy Academy topic
            </p>
          </div>
          <p>
            Built in a day with a Groq-powered generation pipeline and a data layer grounded entirely in Modo&apos;s
            published research. The FCA angle is explicit throughout because regulated benchmark credibility is one of
            Modo&apos;s real moats.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-3">What&apos;s honest</p>
        <h2 className="mt-3 serif text-[28px] font-normal leading-[1.2] text-text">What this is and isn&apos;t.</h2>
        <div className="mt-6 text-[15px] leading-[1.7] text-text-2">
          <p className="py-3">
            <span style={{ color: "var(--success)" }}>IS:</span> A working prototype that runs six real agent stages
            and produces usable output.
          </p>
          <p className="border-t border-white/10 py-3">
            <span style={{ color: "var(--success)" }}>IS:</span> Grounded in Modo&apos;s actual published research —
            every citation is real.
          </p>
          <p className="border-t border-white/10 py-3">
            <span style={{ color: "var(--warning)" }}>IS NOT:</span> A production system. Some signal data is curated
            for demo stability. Generated drafts are directional until verified against source research.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <p className="text-[11px] uppercase tracking-[0.08em] text-text-3">Day 30</p>
        <h2 className="mt-3 serif text-[28px] font-normal leading-[1.2] text-text">What week two looks like.</h2>
        <div className="mt-6 space-y-6 text-[15px] leading-[1.7] text-text-2">
          <p>
            Runs nightly across every active expansion market. Pulls live public signals instead of curated inputs.
            Closes the loop directly into outreach systems, the content calendar, and Ko prompt distribution.
          </p>
          <p>One operator. Twenty markets. That is the leverage model.</p>
        </div>
      </section>

      <footer className="mt-20 space-y-1 text-center text-[13px] leading-6 text-text-3">
        <p>Built by Sambhav Lamichhane · April 17, 2026</p>
        <p className="text-[12px]">For Imrith Sangha and the Modo Energy growth team.</p>
        <p className="text-[12px]">
          <Link href="/prompts" className="text-accent hover:text-accent-hover">
            View system prompts →
          </Link>
        </p>
      </footer>
    </main>
  );
}
