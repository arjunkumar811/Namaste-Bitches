"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page Error Caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 animate-pulse">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-3 text-white">Something went wrong</h2>
      <p className="text-sm text-zinc-400 mb-8 max-w-md leading-relaxed">
        We encountered an unexpected error while trying to load this content. Please try refreshing the page.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all shadow-lg active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
