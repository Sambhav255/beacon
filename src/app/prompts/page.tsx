import { STAGE_PROMPTS } from "@/lib/prompts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompts",
};

export default function PromptsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-14">
      <h1 className="h2 mb-3">Beacon prompts</h1>
      <p className="mb-8 text-text-2">Transparency page for the six stage system prompts used by Beacon.</p>
      <div className="space-y-5">
        {Object.entries(STAGE_PROMPTS).map(([stage, prompt]) => (
          <section key={stage} className="rounded border border-border bg-surface p-4">
            <div className="micro mb-2">{stage}</div>
            <pre className="whitespace-pre-wrap text-sm text-text-2">{prompt}</pre>
          </section>
        ))}
      </div>
    </main>
  );
}
