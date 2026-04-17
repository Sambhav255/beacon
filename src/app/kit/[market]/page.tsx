import marketsData from "@/data/markets.json";
import type { MarketsMap } from "@/lib/types";
import PrintButton from "@/components/print-button";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params;
  const selected = (marketsData as MarketsMap)[market];
  return {
    title: selected ? `${selected.name} Kit` : "Kit",
  };
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
