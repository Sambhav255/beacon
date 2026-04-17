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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function renderStagePreview(stage: StageId, output: unknown) {
  const data = (output as Record<string, unknown> | undefined) ?? {};

  if (stage === "context") {
    return (
      <div className="space-y-1 text-xs text-text-2">
        <p className="text-text">{String(data.market_state ?? "No market state yet.")}</p>
        <p>{String(data.modo_position ?? "No positioning yet.")}</p>
      </div>
    );
  }

  if (stage === "signals") {
    const headline = (data.headline_signal as Record<string, unknown> | undefined) ?? {};
    return (
      <div className="space-y-1 text-xs text-text-2">
        <p className="text-text">{String(headline.title ?? headline.headline ?? "No headline signal yet.")}</p>
        <p>{String(headline.implication ?? headline.so_what ?? "")}</p>
      </div>
    );
  }

  if (stage === "prospects") {
    const prospects = ((data.prospects as Array<Record<string, unknown>> | undefined) ?? []).slice(0, 3);
    return (
      <div className="space-y-1 text-xs text-text-2">
        {prospects.length === 0 ? (
          <p>No prospects yet.</p>
        ) : (
          prospects.map((prospect, index) => (
            <p key={`${String(prospect.rank ?? index + 1)}-${String(prospect.archetype ?? "prospect")}-${index}`}>
              {String(prospect.rank ?? index + 1)}. {String(prospect.archetype ?? "Prospect")}
            </p>
          ))
        )}
      </div>
    );
  }

  if (stage === "assets") {
    const prompts = ((data.starter_pack as Array<Record<string, unknown>> | undefined) ?? []).slice(0, 2);
    return (
      <div className="space-y-1 text-xs text-text-2">
        {prompts.length === 0 ? (
          <p>No starter prompts yet.</p>
        ) : (
          prompts.map((prompt, index) => (
            <p key={`${String(prompt.id ?? index)}-${String(prompt.prompt_text ?? prompt.text ?? "prompt")}`}>
              {String(prompt.prompt_text ?? prompt.text ?? "Prompt")}
            </p>
          ))
        )}
      </div>
    );
  }

  if (stage === "outreach") {
    const emails = ((data.emails as Array<Record<string, unknown>> | undefined) ?? []).slice(0, 3);
    return (
      <div className="space-y-1 text-xs text-text-2">
        {emails.length === 0 ? (
          <p>No outreach drafts yet.</p>
        ) : (
          emails.map((email, index) => (
            <p key={`${String(email.subject ?? "draft")}-${index}`}>{String(email.subject ?? "Draft")}</p>
          ))
        )}
      </div>
    );
  }

  if (stage === "content") {
    const rawLi = data.linkedin_post;
    const rawNw = data.newsletter_blurb;
    const linkedin =
      typeof rawLi === "string"
        ? { hook: rawLi, body: "", cta: "" }
        : ((rawLi as Record<string, unknown> | undefined) ?? {});
    const newsletter =
      typeof rawNw === "string"
        ? { headline: rawNw, body: "" }
        : ((rawNw as Record<string, unknown> | undefined) ?? {});
    const hook = linkedin.hook ?? linkedin.title ?? linkedin.subject;
    const headline = newsletter.headline ?? newsletter.title ?? newsletter.subject;
    return (
      <div className="space-y-1 text-xs text-text-2">
        <p className="text-text">{hook ? String(hook) : "No LinkedIn hook yet."}</p>
        <p>{headline ? String(headline) : "No newsletter headline yet."}</p>
      </div>
    );
  }

  return <p className="text-xs text-text-3">No output preview yet.</p>;
}

export default function AgentPage() {
  const compactPre = "overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words text-xs text-text-2";
  const markets = Object.values(marketsData as MarketsMap);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [events, setEvents] = useState<StageEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const [runMode, setRunMode] = useState<"cached" | "live" | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
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
  const generationRef = useRef<HTMLDivElement>(null);
  const runAgentRef = useRef<(forceLive?: boolean) => Promise<void>>(async () => {});

  const scrollToGeneration = useCallback(() => {
    window.setTimeout(() => {
      generationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  const scrollToKit = useCallback(() => {
    window.setTimeout(() => {
      kitRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, []);

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
  const globeMarketsSorted = useMemo(() => {
    const featuredId = "poland";
    const copy = [...globeMarkets];
    copy.sort((a, b) => {
      const aFeatured = a.id === featuredId ? -1 : 0;
      const bFeatured = b.id === featuredId ? -1 : 0;
      if (aFeatured !== bFeatured) return aFeatured - bFeatured;
      return a.name.localeCompare(b.name);
    });
    return copy;
  }, [globeMarkets]);

  const stageOutputs = useMemo(() => {
    const outputMap: Record<string, unknown> = {};
    for (const event of events) {
      if (event.status === "complete" && event.stage !== "done" && event.stage !== "error") {
        outputMap[event.stage] = event.output;
      }
    }
    return outputMap;
  }, [events]);
  const contextOutput = useMemo(() => (stageOutputs.context as Record<string, unknown> | undefined) ?? {}, [stageOutputs]);
  const signalsOutput = useMemo(() => (stageOutputs.signals as Record<string, unknown> | undefined) ?? {}, [stageOutputs]);
  const prospectsOutput = useMemo(
    () => (stageOutputs.prospects as Record<string, unknown> | Array<Record<string, unknown>> | undefined) ?? {},
    [stageOutputs],
  );
  const assetsOutput = useMemo(
    () => (stageOutputs.assets as Record<string, unknown> | Array<Record<string, unknown>> | undefined) ?? {},
    [stageOutputs],
  );
  const outreachOutput = useMemo(
    () => (stageOutputs.outreach as Record<string, unknown> | Array<Record<string, unknown>> | undefined) ?? {},
    [stageOutputs],
  );
  const contentOutput = useMemo(() => (stageOutputs.content as Record<string, unknown> | undefined) ?? {}, [stageOutputs]);

  const prospectList = useMemo(() => {
    if (Array.isArray(prospectsOutput)) return prospectsOutput;
    const nested = prospectsOutput.prospects;
    return Array.isArray(nested) ? nested : [];
  }, [prospectsOutput]);

  const displayedProspects = useMemo(() => {
    const seen = new Set<string>();
    const unique = prospectList.filter((prospect) => {
      const key = [
        String(prospect.archetype ?? ""),
        String(prospect.trigger ?? ""),
        String(prospect.pain ?? ""),
      ].join("|");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 3);
  }, [prospectList]);

  const starterPack = useMemo(() => {
    if (Array.isArray(assetsOutput)) return assetsOutput;
    const nested = assetsOutput.starter_pack;
    return Array.isArray(nested) ? nested : [];
  }, [assetsOutput]);

  const displayedStarterPack = useMemo(() => {
    const seen = new Set<string>();
    const unique = starterPack.filter((item) => {
      const key = [
        String(item.prompt_text ?? item.text ?? ""),
        String(item.persona ?? ""),
        String(item.why_this_prompt ?? item.why ?? ""),
      ].join("|");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 3);
  }, [starterPack]);

  const outreachEmails = useMemo(() => {
    if (Array.isArray(outreachOutput)) return outreachOutput;
    const nested = outreachOutput.emails;
    return Array.isArray(nested) ? nested : [];
  }, [outreachOutput]);

  const displayedOutreachEmails = useMemo(() => {
    const seen = new Set<string>();
    const unique = outreachEmails.filter((email) => {
      const key = [
        String(email.subject ?? ""),
        String(email.body ?? ""),
        String(email.cta_line ?? ""),
        String(email.signal_reference ?? ""),
      ].join("|");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 3);
  }, [outreachEmails]);

  const headlineSignal = (signalsOutput.headline_signal as Record<string, unknown> | undefined) ?? {};
  const supportingSignals = (signalsOutput.supporting_signals as Array<Record<string, unknown>> | undefined) ?? [];
  const outreachObject = Array.isArray(outreachOutput) ? {} : outreachOutput;
  const followUpVariant = (outreachObject.follow_up_variant as Record<string, unknown> | undefined) ?? {};
  const linkedinPost = useMemo((): Record<string, unknown> | string => {
    const raw = contentOutput.linkedin_post;
    if (typeof raw === "string") return raw;
    const o = (raw as Record<string, unknown> | undefined) ?? {};
    return { ...o, hook: o.hook ?? o.title ?? o.subject ?? "" };
  }, [contentOutput.linkedin_post]);
  const newsletterBlurb = useMemo((): Record<string, unknown> | string => {
    const raw = contentOutput.newsletter_blurb;
    if (typeof raw === "string") return raw;
    const o = (raw as Record<string, unknown> | undefined) ?? {};
    return { ...o, headline: o.headline ?? o.title ?? o.subject ?? "" };
  }, [contentOutput.newsletter_blurb]);
  const videoTopic = (contentOutput.video_topic as Record<string, unknown> | string | undefined) ?? {};
  const groundingNotes = Array.isArray(contextOutput.grounding_notes)
    ? contextOutput.grounding_notes.map((note) => String(note))
    : typeof contextOutput.grounding_notes === "string"
      ? [contextOutput.grounding_notes]
      : [];

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

  const loadCachedResult = useCallback((marketId: string) => {
    const cache = (cacheData as Record<string, { stages: Record<string, unknown> }>)[marketId];
    if (!cache) return false;

    const cachedEvents = STAGE_ORDER.flatMap((stage) => [
      { stage, status: "running" as const },
      { stage, status: "complete" as const, output: cache.stages[stage] },
    ]);
    setEvents(cachedEvents);
    setIsCachedView(true);
    window.setTimeout(() => {
      generationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return true;
  }, []);

  const loadCachedStage = useCallback((marketId: string, stage: StageId) => {
    const cache = (cacheData as Record<string, { stages: Record<string, unknown> }>)[marketId];
    const cachedOutput = cache?.stages?.[stage];
    if (cachedOutput === undefined) return false;
    setEvents((prev) => [...prev, { stage, status: "complete", output: cachedOutput }]);
    return true;
  }, []);

  const runAgent = useCallback(async (forceLive = false) => {
    if (!selectedMarketId) {
      setToast("Select a market first.");
      return;
    }
    setRunMode(forceLive ? "live" : "cached");
    setLiveFailed(false);
    const runStartedAt = Date.now();
    setRunning(true);
    setEvents([]);
    setChatAnswer("");
    setLiveFailureNotice("");
    if (!forceLive && loadCachedResult(selectedMarketId)) {
      setRunning(false);
      return;
    }
    scrollToGeneration();
    let shouldFallbackToCache = false;
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketId: selectedMarketId }),
    });

    if (!res.ok) {
      setLiveFailureNotice("Live run unavailable. Showing cached result.");
      setLiveFailed(true);
      if (forceLive) setToast("Live run failed. Loaded cached kit for demo stability.");
      loadCachedResult(selectedMarketId);
      setRunning(false);
      return;
    }

    if (!res.body) {
      setLiveFailureNotice("No live stream returned. Showing cached result.");
      setLiveFailed(true);
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
          if (forceLive) setToast(`Stage ${data.stage} failed, continuing with cached output.`);
          loadCachedStage(selectedMarketId, data.stage);
        }
        if (data.error) {
          setLiveFailureNotice("Live run failed, showing cached result.");
          setLiveFailed(true);
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
    scrollToKit();
  }, [events, loadCachedResult, loadCachedStage, scrollToGeneration, scrollToKit, selectedMarketId, stageOutputs]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    runAgentRef.current = runAgent;
  }, [runAgent]);

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
        void runAgentRef.current(false);
      }
      if (event.key === "/") {
        event.preventDefault();
        setShowInternals((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

      <div
        className={`mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-6 py-8 ${
          pickerMode === "globe"
            ? "md:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_minmax(240px,280px)]"
            : "md:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]"
        }`}
      >
        <aside className="flex min-h-0 flex-col gap-6 rounded border border-border bg-surface p-4 md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
          <div>
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
          </div>
          {showInternals && (
            <div className="border-t border-border pt-4">
              <div className="micro mb-3">Agent internals · For the curious</div>
              <div className="mb-2 flex flex-wrap gap-2">
                {STAGE_ORDER.map((stage) => (
                  <button
                    key={stage}
                    type="button"
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
                <pre className="max-h-36 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words border border-border bg-bg p-2">
                  {STAGE_PROMPTS[selectedStage]}
                </pre>
                <div className="text-text-2">Stage output preview</div>
                <div className="max-h-40 overflow-y-auto border border-border bg-bg p-2">
                  {renderStagePreview(selectedStage, stageOutputs[selectedStage])}
                </div>
              </div>
              {chatOpen && (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="micro mb-2">Follow-up chat</div>
                  <textarea
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    className="min-h-20 w-full border border-border bg-bg p-2 text-xs"
                  />
                  <button type="button" onClick={askFollowUp} className="mt-2 w-full bg-accent px-3 py-2 text-xs text-bg">
                    Ask with this kit context
                  </button>
                  {chatAnswer && <pre className={compactPre}>{chatAnswer}</pre>}
                </div>
              )}
            </div>
          )}
        </aside>

        <section className="min-w-0">
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
              <>
                <div className="flex min-w-0 justify-center">
                  <MarketGlobe
                    markets={globeMarkets}
                    selectedMarketId={selectedMarketId}
                    onSelect={(marketId) => setSelectedMarketId(marketId)}
                  />
                </div>
                <div className="mt-4 rounded border border-border bg-bg p-3 md:hidden">
                  <div className="micro mb-2">Markets</div>
                  <p className="mb-3 text-xs text-text-3">Tap a country to select it.</p>
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {globeMarketsSorted.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMarketId(m.id)}
                        className={`min-h-11 w-full rounded border px-3 py-2.5 text-left text-sm transition-colors ${
                          selectedMarketId === m.id
                            ? "border-accent bg-surface-alt text-accent"
                            : "border-border text-text-2 hover:border-border-strong hover:text-text"
                        }`}
                      >
                        <div className="font-medium text-text">{m.name}</div>
                        <div className="mt-0.5 line-clamp-2 text-xs text-text-3">{m.tagline}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {pickerMode === "list" && (
              <div className="mb-4 flex flex-wrap gap-2">
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
            )}
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
              type="button"
              onClick={() => setShowInternals((prev) => !prev)}
              className="mt-3 min-h-11 border border-border px-5 py-2 text-text-2 hover:border-border-strong hover:text-text"
            >
              {showInternals ? "Hide transparency panel" : "Show transparency panel"}
            </button>
            <p className="mt-2 text-xs text-text-3 md:hidden">Transparency panel appears under Run history when shown.</p>
          </div>

          <div ref={generationRef} className="scroll-mt-24 space-y-3">
            <div className="micro mb-1">Generation</div>
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
                      <motion.div
                        key={`${stage}-output`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-h-44 overflow-y-auto"
                      >
                        {renderStagePreview(stage, latest.output)}
                      </motion.div>
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
              {runMode === "live" && liveFailed && liveFailureNotice && (
                <p className="mt-2 text-sm text-warning">{liveFailureNotice}</p>
              )}
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
              <div className="space-y-3">
                <p className="text-base text-text">
                  {String(contextOutput.market_state ?? "No market state generated yet.")}
                </p>
                <p className="text-sm text-text-2">{String(contextOutput.modo_position ?? "No positioning generated yet.")}</p>
                <div>
                  <p className="text-xs text-text-3">Modo research grounding this kit</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-2">
                    {groundingNotes.map((note, index) => (
                      <li key={`${note}-${index}`}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
            <article>
              <div className="micro mb-2">Market snapshot</div>
              <div className="rounded border border-border">
                {Object.entries((currentMarket?.market_snapshot as Record<string, unknown> | undefined) ?? {}).map(
                  ([label, value]) => (
                    <div key={label} className="grid grid-cols-[180px_1fr] border-b border-border px-3 py-2 last:border-b-0">
                      <span className="text-sm text-text-3">{label.replaceAll("_", " ")}</span>
                      <span className="text-sm text-text">{String(value)}</span>
                    </div>
                  ),
                )}
              </div>
            </article>
            <article>
              <div className="micro mb-2">Active signals</div>
              <div className="space-y-3">
                <div className="rounded border border-border border-l-[3px] border-l-signal bg-bg px-4 py-3">
                  <h3 className="serif text-xl text-text">
                    {String(headlineSignal.title ?? headlineSignal.headline ?? "No headline signal yet.")}
                  </h3>
                  <p className="mt-2 text-sm text-text-2">
                    {String(headlineSignal.implication ?? headlineSignal.so_what ?? "No implication available.")}
                  </p>
                </div>
                <div className="space-y-2">
                  {supportingSignals.map((signal, index) => (
                    <div key={`${String(signal.headline ?? "signal")}-${index}`} className="rounded border border-border p-3">
                      <p className="micro mb-1">{String(signal.date ?? "")}</p>
                      <p className="text-sm text-text">{String(signal.headline ?? "")}</p>
                      <p className="mt-1 text-xs text-text-3">
                        {String(signal.commercial_implication ?? signal.so_what ?? "")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
            <article>
              <div className="micro mb-2">Prospect deck</div>
              {displayedProspects.length === 0 ? (
                <p className="text-sm text-text-3">No prospects generated yet.</p>
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
                  {displayedProspects.map((prospect, index) => (
                    <motion.div
                      key={`${String(prospect.rank ?? index + 1)}-${String(prospect.archetype ?? "prospect")}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        show: { opacity: 1, y: 0 },
                      }}
                      className="rounded border border-border p-4"
                    >
                      <p className="micro">Rank {String(prospect.rank ?? index + 1)}</p>
                      <h3 className="serif mt-1 text-xl text-text">{String(prospect.archetype ?? "Prospect")}</h3>
                      <p className="mt-2 text-sm text-text-2">{String(prospect.description ?? "")}</p>
                      <p className="mt-3 text-sm">
                        <span className="text-text-3">Trigger:</span>{" "}
                        <span className="text-signal">{String(prospect.trigger ?? "")}</span>
                      </p>
                      <p className="mt-1 text-sm">
                        <span className="text-text-3">Pain:</span> <span className="text-text">{String(prospect.pain ?? "")}</span>
                      </p>
                      <p className="mt-1 text-sm">
                        <span className="text-text-3">Modo asset:</span>{" "}
                        <span className="text-text">{String(prospect.matched_modo_asset ?? "")}</span>
                      </p>
                      <div className="mt-2 rounded border border-border bg-bg px-3 py-2 text-xs text-text-2">
                        <span className="text-text-3">Ko prompt:</span>{" "}
                        {String(prospect.matched_ko_prompt ?? "")}
                      </div>
                      <p className="mt-2 text-sm">
                        <span className="text-text-3">Channel:</span> {String(prospect.channel ?? "")}
                      </p>
                      <div className="mt-3">
                        <span
                          className={`inline-block border px-2 py-0.5 text-[11px] ${
                            String(prospect.priority ?? "").toLowerCase() === "high"
                              ? "border-success text-success"
                              : String(prospect.priority ?? "").toLowerCase() === "medium"
                                ? "border-warning text-warning"
                                : "border-border text-text-3"
                          }`}
                        >
                          {String(prospect.priority ?? "watch")}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </article>
            <article>
              <div className="micro mb-2">Ko starter pack</div>
              {displayedStarterPack.length === 0 ? (
                <p className="text-sm text-text-3">No prompt pack generated yet.</p>
              ) : (
                <div className="space-y-3">
                  {displayedStarterPack.map((item, index) => {
                    const benchmarks = (item.benchmarks_exercised as string[] | undefined) ?? [];
                    const promptText = String(item.prompt_text ?? item.text ?? "Prompt");
                    return (
                      <div key={`${item.id ?? index}`} className="rounded border border-border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[15px] text-text">{promptText}</p>
                          <button
                            className="shrink-0 border border-border px-2 py-1 text-xs text-text-2 hover:text-text"
                            onClick={() => copyValue(promptText, `starter-${String(item.id ?? index)}`)}
                          >
                            {copiedKey === `starter-${String(item.id ?? index)}` ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <span className="mt-2 inline-block border border-border px-2 py-0.5 text-[11px] text-text-2">
                          {String(item.persona ?? "persona")}
                        </span>
                        <p className="mt-2 text-xs text-text-3">
                          {String(item.why_this_prompt ?? item.why ?? "No rationale supplied.")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {benchmarks.map((benchmark, badgeIndex) => (
                            <span key={`${benchmark}-${badgeIndex}`} className="border border-border px-2 py-0.5 text-[11px] text-text-2">
                              {benchmark}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
            <article>
              <div className="micro mb-2">Outreach drafts</div>
              {displayedOutreachEmails.length === 0 ? (
                <p className="text-sm text-text-3">No outreach drafts generated yet.</p>
              ) : (
                <div className="space-y-3">
                  {displayedOutreachEmails.map((email, index) => {
                    const ctaLine = String(email.cta_line ?? "");
                    return (
                      <div key={`${String(email.subject ?? "draft")}-${index}`} className="rounded border border-border p-3">
                        <h3 className="serif text-xl text-text">{String(email.subject ?? "Draft")}</h3>
                        <p className="mt-2 text-sm text-text-2">{String(email.body ?? "")}</p>
                        <p className="mt-2 text-sm text-signal">{ctaLine}</p>
                        <p className="mt-2 micro">{String(email.signal_reference ?? "")}</p>
                      </div>
                    );
                  })}
                  {Object.keys(followUpVariant).length > 0 && (
                    <div className="rounded border border-border p-3">
                      <span className="border border-border px-2 py-0.5 text-[11px] text-text-2">Follow-up</span>
                      <h3 className="serif mt-2 text-xl text-text">{String(followUpVariant.subject ?? "Follow-up")}</h3>
                      <p className="mt-2 text-sm text-text-2">{String(followUpVariant.body ?? "")}</p>
                      <p className="mt-2 micro">{String(followUpVariant.context ?? "")}</p>
                    </div>
                  )}
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
              <div className="space-y-3">
                <div className="rounded border border-border p-3">
                  <p className="text-lg text-text">
                    {typeof linkedinPost === "string" ? linkedinPost : String(linkedinPost.hook ?? "No hook provided.")}
                  </p>
                  {typeof linkedinPost !== "string" && (
                    <>
                      <p className="mt-2 text-sm text-text-2">{String(linkedinPost.body ?? "")}</p>
                      <p className="mt-2 text-xs text-text-3">{String(linkedinPost.cta ?? "")}</p>
                    </>
                  )}
                </div>
                <div className="rounded border border-border p-3">
                  {typeof newsletterBlurb === "string" ? (
                    <p className="text-sm text-text-2">{newsletterBlurb}</p>
                  ) : (
                    <>
                      <h3 className="serif text-xl text-text">{String(newsletterBlurb.headline ?? "Newsletter blurb")}</h3>
                      <p className="mt-2 text-sm text-text-2">{String(newsletterBlurb.body ?? "")}</p>
                    </>
                  )}
                </div>
                <div className="rounded border border-border p-3">
                  {typeof videoTopic === "string" ? (
                    <p className="text-sm text-text-2">{videoTopic}</p>
                  ) : (
                    <>
                      <h3 className="serif text-xl text-text">{String(videoTopic.working_title ?? "Video topic")}</h3>
                      <p className="mt-2 text-sm text-text-2">{String(videoTopic.thesis ?? "")}</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-text-2">
                        {((videoTopic.three_key_points as string[] | undefined) ?? []).map((point, index) => (
                          <li key={`${point}-${index}`}>{point}</li>
                        ))}
                      </ol>
                      <p className="mt-2 text-xs text-text-3">{String(videoTopic.suggested_expert ?? "")}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="border border-border px-3 py-1 text-xs text-text-2 hover:text-text"
                  onClick={() =>
                    copyValue(JSON.stringify(contentOutput.linkedin_post ?? {}, null, 2), "linkedin")
                  }
                >
                  {copiedKey === "linkedin" ? "Copied LinkedIn post" : "Copy LinkedIn post"}
                </button>
                <button
                  className="border border-border px-3 py-1 text-xs text-text-2 hover:text-text"
                  onClick={() =>
                    copyValue(
                      JSON.stringify(contentOutput.newsletter_blurb ?? {}, null, 2),
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
            {(() => {
              const firstSuggestionText =
                displayedProspects.length >= 2
                  ? `Why did you prioritize the ${String(displayedProspects[0]?.archetype ?? "top prospect")} first?`
                  : "Why did the capacity market winner rank first?";
              return (
                <button
                  className="w-full border border-border px-3 py-2 text-left text-sm text-text-2 hover:text-text"
                  onClick={() => {
                    setChatQuestion(firstSuggestionText);
                    setChatOpen(true);
                  }}
                >
                  {firstSuggestionText}
                </button>
              );
            })()}
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

        {pickerMode === "globe" && (
          <aside className="hidden min-h-0 rounded border border-border bg-bg p-3 md:block md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
            <div className="micro mb-2">Markets</div>
            <p className="mb-3 text-xs text-text-3">Click a country to select it. The globe zooms to that market.</p>
            <div className="space-y-1">
              {globeMarketsSorted.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMarketId(m.id)}
                  className={`min-h-11 w-full rounded border px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedMarketId === m.id
                      ? "border-accent bg-surface-alt text-accent"
                      : "border-border text-text-2 hover:border-border-strong hover:text-text"
                  }`}
                >
                  <div className="font-medium text-text">{m.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-text-3">{m.tagline}</div>
                </button>
              ))}
            </div>
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
            className="fixed bottom-6 right-6 flex items-center gap-2 border border-border bg-surface px-3 py-2 text-xs text-text-2"
          >
            <span>{toast}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="text-text-3 hover:text-text"
              onClick={() => setToast("")}
            >
              ×
            </button>
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
