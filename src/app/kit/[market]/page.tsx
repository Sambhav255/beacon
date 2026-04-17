import marketsData from "@/data/markets.json";
import type { MarketsMap } from "@/lib/types";
import PrintButton from "@/components/print-button";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params;
  const selected = (marketsData as MarketsMap)[market];
  return {
    title: selected ? selected.name : "Kit",
  };
}

function SnapshotRows({ snapshot }: { snapshot: Record<string, string | number> }) {
  return (
    <div className="rounded border border-border">
      {Object.entries(snapshot).map(([key, value]) => (
        <div key={key} className="grid grid-cols-[170px_1fr] border-b border-border px-3 py-2 last:border-b-0">
          <span className="text-sm text-text-3">{key.replaceAll("_", " ")}</span>
          <span className="text-sm text-text">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function KitPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ clean?: string }>;
}) {
  const { market } = await params;
  const { clean } = await searchParams;
  const isClean = clean === "true";
  const selected = (marketsData as MarketsMap)[market];

  if (!selected) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-text-2">Market not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 print:bg-white print:text-black">
      <div className={`mb-6 items-center justify-between print:hidden ${isClean ? "hidden" : "flex"}`}>
        <h1 className="h2">{selected.name} market kit</h1>
        <div className="flex items-center gap-3">
          <PrintButton />
          <Link href="/agent" className="text-sm text-text-2 hover:text-text">
            Back to agent
          </Link>
        </div>
      </div>
      <div className="space-y-6 rounded border border-border bg-surface p-6">
        <section>
          <div className="micro mb-2">Market snapshot</div>
          <SnapshotRows snapshot={selected.market_snapshot} />
        </section>
        <section>
          <div className="micro mb-2">Research</div>
          <div className="space-y-3">
            {selected.modo_research.map((item) => (
              <article key={item.url} className="rounded border border-border p-3">
                <p className="text-sm text-text">{item.title}</p>
                <p className="mt-1 text-xs text-text-3">{item.summary}</p>
                <a href={item.url} className="mt-2 inline-block text-xs text-accent hover:text-accent-hover">
                  Source
                </a>
              </article>
            ))}
          </div>
        </section>
        <section>
          <div className="micro mb-2">Active signals</div>
          <div className="space-y-2">
            {selected.active_signals.map((signal, index) => (
              <article key={`${signal.headline}-${index}`} className="rounded border border-border p-3">
                <p className="micro">{signal.date} · {signal.type}</p>
                <p className="mt-1 text-sm text-text">{signal.headline}</p>
                <p className="mt-1 text-xs text-text-3">{signal.so_what}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
