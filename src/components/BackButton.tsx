"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push("/");
      }}
      className="border border-border px-3 py-2 text-sm text-text-2 hover:text-text"
    >
      Back
    </button>
  );
}
