import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-5">
          <div className="h3 serif">Beacon</div>
          <div className="flex gap-8 text-sm text-text-2">
            <Link href="/agent" className="hover:text-text">
              Agent
            </Link>
            <Link href="/about" className="hover:text-text">
              About
            </Link>
            <Link href="/prompts" className="hover:text-text">
              Prompts
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-4xl px-8 py-24">
        <div className="micro mb-6">Built for Modo Energy · Prototype</div>
        <h1 className="h1 mb-6">A market entry agent for Modo&apos;s growth team.</h1>
        <p className="mb-10 max-w-2xl text-lg text-text-2">
          Built for the person covering twenty markets, not five. Grounded in published Modo research, live
          market signals, and a six-stage agent flow.
        </p>
        <Link href="/agent" className="inline-block bg-accent px-6 py-3 font-medium text-bg hover:bg-accent-hover">
          Run agent
        </Link>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 px-8 pb-24 md:grid-cols-3">
        <article>
          <div className="micro mb-3">Grounded</div>
          <h3 className="serif mb-2 text-xl">In real Modo research</h3>
          <p className="text-sm text-text-2">Every output ties back to published market research and signals.</p>
          <p className="mt-2 text-xs text-text-3">FCA-authorised benchmarks where applicable.</p>
        </article>
        <article>
          <div className="micro mb-3">Agentic</div>
          <h3 className="serif mb-2 text-xl">Six stages, visible</h3>
          <p className="text-sm text-text-2">You can inspect prompts, inputs, output JSON, and latency per stage.</p>
        </article>
        <article>
          <div className="micro mb-3">Shippable</div>
          <h3 className="serif mb-2 text-xl">A market kit, not a dashboard</h3>
          <p className="text-sm text-text-2">The output is a practical Day One document for growth execution.</p>
        </article>
      </section>
    </main>
  );
}
