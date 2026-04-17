"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded border border-border bg-surface p-6">
        <div className="micro mb-3">Something went wrong</div>
        <h1 className="h2 mb-4">Beacon hit an unexpected error.</h1>
        <p className="mb-4 text-sm text-text-2">
          The page is still safe. You can retry the render or jump back to the agent.
        </p>
        <pre className="mb-4 max-h-40 overflow-auto border border-border bg-bg p-3 text-xs text-text-3">
          {error.message}
        </pre>
        <div className="flex gap-3">
          <button onClick={reset} className="bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-hover">
            Try again
          </button>
          <Link href="/agent" className="border border-border px-4 py-2 text-sm text-text-2 hover:text-text">
            Go to agent
          </Link>
        </div>
      </section>
    </main>
  );
}
