"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalNavActions() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
            return;
          }
          router.push("/");
        }}
        className="border border-border bg-surface px-3 py-2 text-xs text-text-2 shadow-sm hover:border-border-strong hover:text-text"
      >
        Back
      </button>
      {!isHome && (
        <Link
          href="/"
          className="border border-border bg-surface px-3 py-2 text-xs text-text-2 shadow-sm hover:border-border-strong hover:text-text"
        >
          Home
        </Link>
      )}
    </div>
  );
}
