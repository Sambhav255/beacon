"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="border border-border px-3 py-2 text-sm text-text-2 hover:text-text">
      Print / Save as PDF
    </button>
  );
}
