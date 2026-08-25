"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-black text-zinc-100 min-h-[100dvh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Application Error</h1>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            A critical error occurred while loading the application. This might be due to a temporary network issue or a problem with our servers.
          </p>
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all shadow-lg active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </body>
    </html>
  );
}
