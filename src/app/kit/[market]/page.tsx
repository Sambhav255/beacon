import marketsData from "@/data/markets.json";
import type { MarketsMap } from "@/lib/types";
import Link from "next/link";

export default async function KitPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  const selected = (marketsData as MarketsMap)[market];

  if (!selected) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-text-2">Market not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h2">{selected.name} market kit</h1>
        <Link href="/agent" className="text-sm text-text-2 hover:text-text">
          Back to agent
        </Link>
      </div>
      <div className="space-y-6 rounded border border-border bg-surface p-6">
        <section>
          <div className="micro mb-2">Market snapshot</div>
          <pre className="text-sm text-text-2">{JSON.stringify(selected.market_snapshot, null, 2)}</pre>
        </section>
        <section>
          <div className="micro mb-2">Research</div>
          <pre className="text-sm text-text-2">{JSON.stringify(selected.modo_research, null, 2)}</pre>
        </section>
        <section>
          <div className="micro mb-2">Active signals</div>
          <pre className="text-sm text-text-2">{JSON.stringify(selected.active_signals, null, 2)}</pre>
        </section>
      </div>
    </main>
  );
}
