"use client";

import Link from "next/link";
import { useState } from "react";

interface LogEntry {
  market: string;
  timestamp: string;
  durationMs: number;
  stagesCompleted: number;
  tokenEstimate: number;
}

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>(() => {
    if (typeof window === "undefined") return [];
    const entries = JSON.parse(localStorage.getItem("beacon_run_logs") ?? "[]") as LogEntry[];
    return entries.slice(0, 10);
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="h2">Agent logs</h1>
        <Link href="/agent" className="text-sm text-text-2 hover:text-text">
          Back to agent
        </Link>
      </div>
      <div className="overflow-auto rounded border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-text-2">
            <tr>
              <th className="px-3 py-2 font-medium">Market</th>
              <th className="px-3 py-2 font-medium">Timestamp</th>
              <th className="px-3 py-2 font-medium">Duration</th>
              <th className="px-3 py-2 font-medium">Stages</th>
              <th className="px-3 py-2 font-medium">Token estimate</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-text-3" colSpan={5}>
                  No runs logged yet.
                </td>
              </tr>
            )}
            {logs.map((entry, idx) => (
              <tr key={`${entry.timestamp}-${idx}`} className="border-b border-border/70">
                <td className="px-3 py-2">{entry.market}</td>
                <td className="px-3 py-2 text-text-2">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2 text-text-2">{Math.round(entry.durationMs / 1000)}s</td>
                <td className="px-3 py-2 text-text-2">{entry.stagesCompleted}</td>
                <td className="px-3 py-2 text-text-2">{entry.tokenEstimate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
