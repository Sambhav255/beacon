import marketsData from "@/data/markets.json";
import type { MarketsMap } from "@/lib/types";
import BackButton from "@/components/BackButton";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compare",
};

function SnapshotRows({ snapshot }: { snapshot: Record<string, string | number> }) {
  return (
    <div className="rounded border border-border">
      {Object.entries(snapshot).map(([key, value]) => (
        <div key={key} className="grid grid-cols-[180px_1fr] border-b border-border px-3 py-2 last:border-b-0">
          <span className="text-sm text-text-3">{key.replaceAll("_", " ")}</span>
          <span className="text-sm text-text">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

function SignalCards({
  signals,
}: {
  signals: Array<{ date: string; type: string; headline: string; so_what: string }>;
}) {
  return (
    <div className="space-y-2">
      {signals.map((signal, index) => (
        <article key={`${signal.headline}-${index}`} className="rounded border border-border p-3">
          <p className="micro">{signal.date} · {signal.type}</p>
          <p className="mt-1 text-sm text-text">{signal.headline}</p>
          <p className="mt-1 text-xs text-text-3">{signal.so_what}</p>
        </article>
      ))}
    </div>
  );
}

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
        <div className="flex items-center gap-2">
          <BackButton />
          <Link href="/" className="border border-border px-3 py-2 text-sm text-text-2 hover:text-text">
            Home
          </Link>
          <a
            href={`/compare?a=${encodeURIComponent(b)}&b=${encodeURIComponent(a)}`}
            className="border border-border px-3 py-2 text-sm text-text-2 hover:text-text"
          >
            Swap
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="max-h-[75vh] overflow-auto rounded border border-border bg-surface p-5">
          <div className="micro mb-2">{left.name}</div>
          <p className="mb-3 text-text-2">{left.tagline}</p>
          <SnapshotRows snapshot={left.market_snapshot} />
          <div className="mt-4">
            <div className="micro mb-2">Signals</div>
            <SignalCards signals={left.active_signals} />
          </div>
        </section>
        <section className="max-h-[75vh] overflow-auto rounded border border-border bg-surface p-5">
          <div className="micro mb-2">{right.name}</div>
          <p className="mb-3 text-text-2">{right.tagline}</p>
          <SnapshotRows snapshot={right.market_snapshot} />
          <div className="mt-4">
            <div className="micro mb-2">Signals</div>
            <SignalCards signals={right.active_signals} />
          </div>
        </section>
      </div>
    </main>
  );
}
