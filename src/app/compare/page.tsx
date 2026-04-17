import marketsData from "@/data/markets.json";
import type { MarketsMap } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const params = await searchParams;
  const a = params.a ?? "poland";
  const b = params.b ?? "germany";
  const map = marketsData as MarketsMap;
  const left = map[a];
  const right = map[b];

  if (!left || !right) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-text-2">Invalid market selection. Use /compare?a=poland&b=germany.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-12">
      <div className="sticky top-0 z-20 mb-6 flex items-center justify-between border border-border bg-surface px-4 py-3">
        <div>
          <h1 className="h2 mb-1">Market comparison</h1>
          <p className="text-text-2">
            {left.name} vs {right.name}
          </p>
        </div>
        <a
          href={`/compare?a=${encodeURIComponent(b)}&b=${encodeURIComponent(a)}`}
          className="border border-border px-3 py-2 text-sm text-text-2 hover:text-text"
        >
          Swap
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="max-h-[75vh] overflow-auto rounded border border-border bg-surface p-5">
          <div className="micro mb-2">{left.name}</div>
          <p className="mb-3 text-text-2">{left.tagline}</p>
          <pre className="text-sm text-text-2">{JSON.stringify(left.market_snapshot, null, 2)}</pre>
          <div className="mt-4">
            <div className="micro mb-2">Signals</div>
            <pre className="text-sm text-text-2">{JSON.stringify(left.active_signals, null, 2)}</pre>
          </div>
        </section>
        <section className="max-h-[75vh] overflow-auto rounded border border-border bg-surface p-5">
          <div className="micro mb-2">{right.name}</div>
          <p className="mb-3 text-text-2">{right.tagline}</p>
          <pre className="text-sm text-text-2">{JSON.stringify(right.market_snapshot, null, 2)}</pre>
          <div className="mt-4">
            <div className="micro mb-2">Signals</div>
            <pre className="text-sm text-text-2">{JSON.stringify(right.active_signals, null, 2)}</pre>
          </div>
        </section>
      </div>
    </main>
  );
}
