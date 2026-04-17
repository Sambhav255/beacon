"use client";

import marketsData from "@/data/markets.json";
import cacheData from "@/data/cache/index.json";
import { STAGE_PROMPTS } from "@/lib/prompts";
import type { Market, MarketsMap, StageEvent, StageId } from "@/lib/types";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const STAGE_ORDER: StageId[] = ["context", "signals", "prospects", "assets", "outreach", "content"];
const MARKET_COORDS: Record<string, { lat: number; lng: number }> = {
  poland: { lat: 52.2297, lng: 21.0122 },
  germany: { lat: 52.52, lng: 13.405 },
  spain: { lat: 40.4168, lng: -3.7038 },
  italy: { lat: 41.9028, lng: 12.4964 },
  france: { lat: 48.8566, lng: 2.3522 },
};

const MarketGlobe = dynamic(() => import("@/components/agent/MarketGlobe"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto h-[500px] w-[500px] rounded border border-border bg-surface p-5">
      <div className="h-full w-full animate-pulse rounded border border-border bg-surface-alt" />
    </div>
  ),
});

function stageLabel(stage: StageId) {
  return {
    context: "Context building",
    signals: "Signal gathering",
    prospects: "Prospect triangulation",
    assets: "Asset matching",
    outreach: "Outreach generation",
    content: "Content derivatives",
  }[stage];
}

export default function AgentPage() {
  const markets = Object.values(marketsData as MarketsMap);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [events, setEvents] = useState<StageEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState<Array<{ marketId: string; ts: number; outputs: Record<string, unknown> }>>(
    [],
  );
  const [selectedStage, setSelectedStage] = useState<StageId>("context");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [isCachedView, setIsCachedView] = useState(false);
  const [liveFailureNotice, setLiveFailureNotice] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [showInternals, setShowInternals] = useState(true);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"globe" | "list">("globe");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const kitRef = useRef<HTMLDivElement>(null);

  const currentMarket = useMemo(
    () => ((selectedMarketId ? (marketsData as MarketsMap)[selectedMarketId] : null) as Market | null),
    [selectedMarketId],
  );
  const globeMarkets = useMemo(
    () =>
      markets
        .filter((market) => MARKET_COORDS[market.id])
        .map((market) => ({
          id: market.id,
          name: market.name,
          tagline: market.tagline,
          ...MARKET_COORDS[market.id],
        })),
    [markets],
  );

  const stageOutputs = useMemo(() => {
    const outputMap: Record<string, unknown> = {};
    for (const event of events) {
      if (event.status === "complete" && event.stage !== "done" && event.stage !== "error") {
        outputMap[event.stage] = event.output;
      }
    }
    return outputMap;
  }, [events]);
  const prospectList = ((stageOutputs.prospects as { prospects?: Array<Record<string, unknown>> } | undefined)
    ?.prospects ?? []) as Array<Record<string, unknown>>;
  const starterPack = ((stageOutputs.assets as { starter_pack?: Array<Record<string, unknown>> } | undefined)
    ?.starter_pack ?? []) as Array<Record<string, unknown>>;
  const outreachEmails = ((stageOutputs.outreach as { emails?: Array<Record<string, unknown>> } | undefined)?.emails ??
    []) as Array<Record<string, unknown>>;
  const hasKitOutput = Object.keys(stageOutputs).length > 0;
  const latestStageEvents = useMemo(() => {
    const latest: Partial<Record<StageId, StageEvent>> = {};
    for (const event of events) {
      if (event.stage !== "done" && event.stage !== "error") {
        latest[event.stage] = event;
      }
    }
    return latest;
  }, [events]);

  function loadCachedResult(marketId: string) {
    const cache = (cacheData as Record<string, { stages: Record<string, unknown> }>)[marketId];
    if (!cache) return false;

    const cachedEvents = STAGE_ORDER.flatMap((stage) => [
      { stage, status: "running" as const },
      { stage, status: "complete" as const, output: cache.stages[stage] },
    ]);
    setEvents(cachedEvents);
    setIsCachedView(true);
    setTimeout(() => kitRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    return true;
  }

  function loadCachedStage(marketId: string, stage: StageId) {
    const cache = (cacheData as Record<string, { stages: Record<string, unknown> }>)[marketId];
    const cachedOutput = cache?.stages?.[stage];
    if (cachedOutput === undefined) return false;
    setEvents((prev) => [...prev, { stage, status: "complete", output: cachedOutput }]);
    return true;
  }

  async function runAgent(forceLive = false) {
    if (!selectedMarketId) {
      setToast("Select a market first.");
      return;
    }
    const runStartedAt = Date.now();
    setRunning(true);
    setEvents([]);
    setChatAnswer("");
    setLiveFailureNotice("");
    if (!forceLive && loadCachedResult(selectedMarketId)) {
      setRunning(false);
      return;
    }
    let shouldFallbackToCache = false;
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketId: selectedMarketId }),
    });

    if (!res.ok) {
      setLiveFailureNotice("Live run unavailable. Showing cached result.");
      setToast("Live run failed. Loaded cached kit for demo stability.");
      loadCachedResult(selectedMarketId);
      setRunning(false);
      return;
    }

    if (!res.body) {
      setLiveFailureNotice("No live stream returned. Showing cached result.");
      loadCachedResult(selectedMarketId);
      setRunning(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let doneReading = false;
    while (!doneReading) {
      const { done, value } = await reader.read();
      doneReading = done;
      if (!value) continue;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));
      for (const line of lines) {
        const data = JSON.parse(line.slice(6)) as StageEvent;
        setEvents((prev) => [...prev, data]);
        if (data.status === "error" && data.stage !== "done" && data.stage !== "error") {
          setToast(`Stage ${data.stage} failed, continuing with cached output.`);
          loadCachedStage(selectedMarketId, data.stage);
        }
        if (data.error) {
          setLiveFailureNotice("Live run failed, showing cached result.");
          shouldFallbackToCache = true;
        }
        if (data.stage !== "done" && data.stage !== "error" && data.status === "running") {
          setSelectedStage(data.stage);
        }
      }
    }
    if (shouldFallbackToCache) {
      loadCachedResult(selectedMarketId);
    } else {
      setIsCachedView(false);
    }
    setRunning(false);
    setHistory((prev) => [{ marketId: selectedMarketId, ts: Date.now(), outputs: stageOutputs }, ...prev].slice(0, 8));
    const stageCount = STAGE_ORDER.filter((stage) => {
      const latest = [...events].reverse().find((event) => event.stage === stage);
      return latest?.status === "complete";
    }).length;
    const tokenEstimate = events.reduce((sum, event) => sum + (event.tokenEstimate ?? 0), 0);
    const logEntry = {
      market: selectedMarketId,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - runStartedAt,
      stagesCompleted: stageCount,
      tokenEstimate,
    };
    const existing = JSON.parse(localStorage.getItem("beacon_run_logs") ?? "[]") as Array<Record<string, unknown>>;
    localStorage.setItem("beacon_run_logs", JSON.stringify([logEntry, ...existing].slice(0, 10)));
    setTimeout(() => kitRef.current?.scrollIntoView({ behavior: "smooth" }), 250);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const commandPressed = isMac ? event.metaKey : event.ctrlKey;
      if (!commandPressed) return;

      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        void runAgent(false);
      }
      if (event.key === "/") {
        event.preventDefault();
        setShowInternals((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedMarketId]);

  async function askFollowUp() {
    setChatOpen(true);
    setChatAnswer("");
    const res = await fetch("/api/chat?stream=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: chatQuestion,
        market: currentMarket?.name ?? "unknown",
        kit: stageOutputs,
      }),
    });

    if (!res.body) {
      setChatAnswer("No response stream available.");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (!result.value) continue;
      const chunk = decoder.decode(result.value);
      const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));
      for (const line of lines) {
        const token = line.replace("data: ", "");
        if (token === "[DONE]") continue;
        setChatAnswer((prev) => prev + token);
      }
    }
  }

  async function exportPdf() {
    if (!kitRef.current) return;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const canvas = await html2canvas(kitRef.current, { scale: 2, backgroundColor: "#0a0a0a" });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(image, "PNG", 10, 10, width, height);
    pdf.save(`beacon-${selectedMarketId}.pdf`);
  }

  async function copyValue(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setToast("Copied to clipboard");
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
    setTimeout(() => setToast(""), 1200);
  }

  return (
    <main className="min-h-screen">
      <nav className="border-b border-border">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-5">
          <Link href="/" className="h3 serif">
            Beacon
          </Link>
          <button className="md:hidden" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Open menu">
            <Menu className="h-6 w-6 text-text-2" />
          </button>
          <div className="hidden gap-8 text-sm text-text-2 md:flex">
            <Link href="/about" className="hover:text-text">
              About
            </Link>
            <Link href="/compare" className="hover:text-text">
              Compare
            </Link>
            <Link href="/prompts" className="hover:text-text">
              Prompts
            </Link>
            <Link href="/logs" className="hover:text-text">
              Logs
            </Link>
          </div>
        </div>
        {menuOpen && (
          <div className="space-y-2 border-t border-border px-8 py-3 text-sm text-text-2 md:hidden">
            <Link href="/about" className="block py-2">
              About
            </Link>
            <Link href="/compare" className="block py-2">
              Compare
            </Link>
            <Link href="/prompts" className="block py-2">
              Prompts
            </Link>
            <Link href="/logs" className="block py-2">
              Logs
            </Link>
          </div>
        )}
      </nav>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[220px_1fr_340px]">
        <aside className="rounded border border-border bg-surface p-4">
          <div className="micro mb-3">Run history</div>
          <div className="space-y-2 text-sm text-text-2">
            {history.length === 0 && <p>No runs yet.</p>}
            {history.map((run) => (
              <div key={run.ts} className="rounded border border-border p-2">
                <div>{run.marketId}</div>
                <div className="text-xs text-text-3">{new Date(run.ts).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </aside>

        <section>
          <div className="mb-5 rounded border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="micro">Market selector</div>
              <button
                onClick={() =>
                  setPickerMode((prev) => (prev === "globe" ? "list" : "globe"))
                }
                className="border border-border px-3 py-1 text-xs text-text-2 hover:text-text"
              >
                {pickerMode === "globe" ? "List view" : "Globe view"}
              </button>
            </div>
            {pickerMode === "globe" && (
              <div className="hidden md:block">
                <MarketGlobe
                  markets={globeMarkets}
                  selectedMarketId={selectedMarketId}
                  onSelect={(marketId) => setSelectedMarketId(marketId)}
                />
              </div>
            )}
            <div className={`mb-4 flex flex-wrap gap-2 ${pickerMode === "globe" ? "md:hidden" : ""}`}>
              {markets.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarketId(m.id)}
                  className={`min-h-11 border px-3 py-2 text-sm ${
                    selectedMarketId === m.id
                      ? "border-accent bg-surface-alt text-accent"
                      : "border-border text-text-2 hover:border-border-strong"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <div className="mb-4 text-center">
              <div className="micro mb-1">Selected market</div>
              <p className="serif text-2xl text-text">
                {currentMarket ? currentMarket.name : <span className="text-text-3">Select a market</span>}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => runAgent(false)}
                disabled={running || !selectedMarketId}
                className="min-h-11 bg-accent px-5 py-2 font-medium text-bg hover:bg-accent-hover disabled:opacity-50"
              >
                {running ? "Running cached kit..." : "Run cached"}
              </button>
              <button
                onClick={() => runAgent(true)}
                disabled={running || !selectedMarketId}
                className="min-h-11 border border-border px-5 py-2 text-text-2 hover:border-border-strong hover:text-text"
              >
                {running ? "Running live..." : "Run live"}
              </button>
              <button
                onClick={exportPdf}
                className="min-h-11 border border-border px-5 py-2 text-text-2 hover:border-border-strong hover:text-text"
              >
                Export PDF
              </button>
            </div>
            <button
              onClick={() => setShowInternals((prev) => !prev)}
              className="mt-3 min-h-11 border border-border px-5 py-2 text-text-2 hover:border-border-strong hover:text-text"
            >
              {showInternals ? "Hide transparency panel" : "Show transparency panel"}
            </button>
          </div>

          <div className="space-y-3">
            {STAGE_ORDER.map((stage) => {
              const latest = latestStageEvents[stage];
              const isRunning = running && latest?.status === "running";
              return (
                <motion.div
                  key={stage}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded border border-border bg-surface p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm">{stageLabel(stage)}</div>
                    <div className="micro flex items-center gap-2">
                      {latest?.status ?? "pending"}
                      {isRunning && <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />}
                    </div>
                  </div>
                  {!latest &&
                    (running ? (
                      <div className="space-y-2">
                        <div className="h-3 w-2/3 animate-pulse bg-surface-alt" />
                        <div className="h-3 w-full animate-pulse bg-surface-alt" />
                        <div className="h-3 w-4/5 animate-pulse bg-surface-alt" />
                      </div>
                    ) : (
                      <p className="text-xs text-text-3">No output yet. Start a run to populate this stage.</p>
                    ))}
                  <AnimatePresence mode="wait">
                    {latest?.output !== undefined && (
                      <motion.pre
                        key={`${stage}-output`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-h-44 overflow-auto text-xs text-text-2"
                      >
                        {JSON.stringify(latest.output, null, 2)}
                      </motion.pre>
                    )}
                  </AnimatePresence>
                  {latest?.error && <p className="mt-2 text-xs text-warning">{latest.error}</p>}
                </motion.div>
              );
            })}
          </div>

          <section ref={kitRef} className="mt-10 space-y-8 rounded border border-border bg-surface p-6">
            {!hasKitOutput && (
              <div className="rounded border border-dashed border-border p-4">
                <p className="text-sm text-text-2">
                  No kit generated yet. Select a market, click <span className="text-text">Run cached</span>, then
                  review each section below.
                </p>
              </div>
            )}
            <div>
              <div className="micro mb-2">Kit header</div>
              <h2 className="h2">{currentMarket?.name ?? "Market"} market entry kit</h2>
              <p className="text-text-2">
                {currentMarket
                  ? `Generated for ${currentMarket.name}. ${currentMarket.tagline}`
                  : "Select and run a market to generate a kit."}
              </p>
              <p className="mt-2 text-sm text-text-2">
                Automation scope: all six stages run autonomously, then a human reviews and ships.
              </p>
              {isCachedView && (
                <p className="mt-2 inline-block border border-warning px-2 py-1 text-xs text-warning">cached</p>
              )}
              {liveFailureNotice && <p className="mt-2 text-sm text-warning">{liveFailureNotice}</p>}
              <p className="mt-3 text-xs text-text-3">
                All citations reference Modo Energy&apos;s published research. Benchmarks referenced are
                FCA-authorised where applicable.
              </p>
              <p className="mt-2 text-xs text-text-3">
                Generated outreach and content drafts are illustrative until reviewed by a human operator.
              </p>
            </div>

            <article>
              <div className="micro mb-2">Executive summary</div>
              <pre className="overflow-auto text-sm text-text-2">{JSON.stringify(stageOutputs.context, null, 2)}</pre>
            </article>
            <article>
              <div className="micro mb-2">Market snapshot</div>
              <pre className="overflow-auto text-sm text-text-2">
                {JSON.stringify(currentMarket?.market_snapshot ?? {}, null, 2)}
              </pre>
            </article>
            <article>
              <div className="micro mb-2">Active signals</div>
              <pre className="overflow-auto text-sm text-text-2">{JSON.stringify(stageOutputs.signals, null, 2)}</pre>
            </article>
            <article>
              <div className="micro mb-2">Prospect deck</div>
              {prospectList.length === 0 ? (
                <pre className="overflow-auto text-sm text-text-2">{JSON.stringify(stageOutputs.prospects, null, 2)}</pre>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.05 } },
                  }}
                  className="space-y-3"
                >
                  {prospectList.map((prospect, index) => (
                    <motion.div
                      key={`${prospect.rank ?? index}`}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        show: { opacity: 1, y: 0 },
                      }}
                      className="rounded border border-border p-3"
                    >
                      <div className="text-sm text-text">
                        {String(prospect.rank ?? index + 1)}. {String(prospect.archetype ?? "Prospect")}
                      </div>
                      <div className="mt-1 text-xs text-text-2">{String(prospect.trigger ?? "")}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </article>
            <article>
              <div className="micro mb-2">Ko starter pack</div>
              {starterPack.length === 0 ? (
                <pre className="overflow-auto text-sm text-text-2">{JSON.stringify(stageOutputs.assets, null, 2)}</pre>
              ) : (
                <div className="space-y-3">
                  {starterPack.map((item, index) => {
                    const benchmarks = (item.benchmarks_exercised as string[] | undefined) ?? [];
                    const hasFcaBenchmark = benchmarks.some((entry) => /me bess gb|fca|regulated/i.test(entry));
                    return (
                      <div key={`${item.id ?? index}`} className="rounded border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-text">{String(item.prompt_text ?? "Prompt")}</p>
                          {hasFcaBenchmark && (
                            <span className="shrink-0 border border-warning px-2 py-0.5 text-[11px] text-warning">
                              FCA-regulated
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-text-2">{String(item.persona ?? "")}</p>
                        {!hasFcaBenchmark && (
                          <p className="mt-1 text-xs text-text-3">
                            TODO: validate this prompt against a regulated benchmark before external use.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
            <article>
              <div className="micro mb-2">Outreach drafts</div>
              {outreachEmails.length === 0 ? (
                <pre className="overflow-auto text-sm text-text-2">{JSON.stringify(stageOutputs.outreach, null, 2)}</pre>
              ) : (
                <div className="space-y-3">
                  {outreachEmails.map((email, index) => {
                    const ctaLine = String(email.cta_line ?? "");
                    const containsRegulated = /fca|regulated|me bess gb/i.test(ctaLine);
                    return (
                      <div key={`${email.subject ?? index}`} className="rounded border border-border p-3">
                        <p className="text-sm text-text">{String(email.subject ?? "Draft")}</p>
                        <p className="mt-1 text-xs text-text-2">{String(email.body ?? "")}</p>
                        <p
                          className={`mt-2 text-xs ${containsRegulated ? "font-medium text-accent" : "text-text-2"}`}
                        >
                          {ctaLine}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 flex gap-3">
                <button
                  className="border border-border px-3 py-1 text-xs text-text-2 hover:text-text"
                  onClick={() => copyValue(JSON.stringify(stageOutputs.outreach, null, 2), "outreach")}
                >
                  {copiedKey === "outreach" ? "Copied outreach drafts" : "Copy outreach drafts"}
                </button>
              </div>
            </article>
            <article>
              <div className="micro mb-2">Content calendar</div>
              <pre className="overflow-auto text-sm text-text-2">{JSON.stringify(stageOutputs.content, null, 2)}</pre>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="border border-border px-3 py-1 text-xs text-text-2 hover:text-text"
                  onClick={() =>
                    copyValue(JSON.stringify((stageOutputs.content as any)?.linkedin_post ?? {}, null, 2), "linkedin")
                  }
                >
                  {copiedKey === "linkedin" ? "Copied LinkedIn post" : "Copy LinkedIn post"}
                </button>
                <button
                  className="border border-border px-3 py-1 text-xs text-text-2 hover:text-text"
                  onClick={() =>
                    copyValue(
                      JSON.stringify((stageOutputs.content as any)?.newsletter_blurb ?? {}, null, 2),
                      "newsletter",
                    )
                  }
                >
                  {copiedKey === "newsletter" ? "Copied newsletter blurb" : "Copy newsletter blurb"}
                </button>
              </div>
            </article>
          </section>

          <section className="mt-8 rounded border border-border bg-surface p-5">
            <div className="micro mb-2">Ask Beacon anything about this kit</div>
            <textarea
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              placeholder="Why did you prioritize this archetype?"
              className="min-h-24 w-full border border-border bg-bg p-3 text-sm"
            />
            <button onClick={askFollowUp} className="mt-3 bg-accent px-4 py-2 text-bg">
              Ask
            </button>
            {chatAnswer && <p className="mt-4 whitespace-pre-wrap text-sm text-text-2">{chatAnswer}</p>}
          </section>
          <section className="mt-8 rounded border border-border bg-surface p-5">
            <div className="micro mb-3">Go deeper</div>
            <div className="space-y-2">
              <button
                className="w-full border border-border px-3 py-2 text-left text-sm text-text-2 hover:text-text"
                onClick={() => {
                  const first = String(prospectList[0]?.archetype ?? "the top prospect");
                  const second = String(prospectList[1]?.archetype ?? "the second prospect");
                  setChatQuestion(`Why did you prioritize ${first} over ${second}?`);
                  setChatOpen(true);
                }}
              >
                Why did you prioritize [top prospect] over [second prospect]?
              </button>
              <button
                className="w-full border border-border px-3 py-2 text-left text-sm text-text-2 hover:text-text"
                onClick={() => {
                  setChatQuestion("What if I lead with the FCA angle instead?");
                  setChatOpen(true);
                }}
              >
                What if I lead with the FCA angle instead?
              </button>
              <button
                className="w-full border border-border px-3 py-2 text-left text-sm text-text-2 hover:text-text"
                onClick={() => {
                  setChatQuestion("Show me week 2 of the content calendar.");
                  setChatOpen(true);
                }}
              >
                Show me week 2 of the content calendar.
              </button>
            </div>
          </section>
        </section>

        {showInternals && (
          <aside className="rounded border border-border bg-surface p-4">
          <div className="micro mb-3">Agent internals · For the curious</div>
          <div className="mb-2 flex flex-wrap gap-2">
            {STAGE_ORDER.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`border px-2 py-1 text-xs ${
                  selectedStage === stage ? "border-accent text-accent" : "border-border text-text-2"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
          <div className="space-y-2 text-xs">
            <Link href="/prompts" className="text-accent hover:text-accent-hover">
              Open full prompts page
            </Link>
            <div className="text-text-2">System prompt</div>
            <pre className="max-h-36 overflow-auto border border-border bg-bg p-2">
              {STAGE_PROMPTS[selectedStage]}
            </pre>
            <div className="text-text-2">Raw JSON output</div>
            <pre className="max-h-40 overflow-auto border border-border bg-bg p-2">
              {JSON.stringify(stageOutputs[selectedStage] ?? {}, null, 2)}
            </pre>
          </div>
          {chatOpen && (
            <div className="mt-4 border-t border-border pt-3">
              <div className="micro mb-2">Follow-up chat</div>
              <textarea
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                className="min-h-20 w-full border border-border bg-bg p-2 text-xs"
              />
              <button onClick={askFollowUp} className="mt-2 w-full bg-accent px-3 py-2 text-xs text-bg">
                Ask with this kit context
              </button>
              {chatAnswer && <p className="mt-3 whitespace-pre-wrap text-xs text-text-2">{chatAnswer}</p>}
            </div>
          )}
          </aside>
        )}
      </div>

      <div
        className="fixed bottom-5 left-5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2"
        onMouseEnter={() => setShowShortcutHelp(true)}
        onMouseLeave={() => setShowShortcutHelp(false)}
      >
        ?
        {showShortcutHelp && (
          <div className="absolute bottom-9 left-0 w-60 rounded border border-border bg-surface p-3 text-left">
            <p className="mb-1">Cmd/Ctrl+K: market switcher</p>
            <p className="mb-1">Cmd/Ctrl+Enter: run agent</p>
            <p>Cmd/Ctrl+/: toggle internals</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 right-6 border border-border bg-surface px-3 py-2 text-xs text-text-2"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <Command.Dialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        label="Market switcher"
        className="fixed left-1/2 top-24 z-50 w-[90vw] max-w-xl -translate-x-1/2 rounded border border-border bg-surface p-2"
      >
        <Command.Input className="w-full border border-border bg-bg px-3 py-2 text-sm" placeholder="Select market..." />
        <Command.List className="mt-2 max-h-72 overflow-auto">
          {markets.map((market) => (
            <Command.Item
              key={market.id}
              className="cursor-pointer px-3 py-2 text-sm text-text-2 hover:bg-surface-alt hover:text-text"
              onSelect={() => {
                setSelectedMarketId(market.id);
                setCommandOpen(false);
              }}
            >
              {market.name}
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </main>
  );
}
