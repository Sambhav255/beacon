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
      <h1 className="h2 mb-2">Market comparison</h1>
      <p className="mb-8 text-text-2">
        Comparing {left.name} vs {right.name}
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded border border-border bg-surface p-5">
          <div className="micro mb-2">{left.name}</div>
          <p className="mb-3 text-text-2">{left.tagline}</p>
          <pre className="text-sm text-text-2">{JSON.stringify(left.market_snapshot, null, 2)}</pre>
        </section>
        <section className="rounded border border-border bg-surface p-5">
          <div className="micro mb-2">{right.name}</div>
          <p className="mb-3 text-text-2">{right.tagline}</p>
          <pre className="text-sm text-text-2">{JSON.stringify(right.market_snapshot, null, 2)}</pre>
        </section>
      </div>
    </main>
  );
}
