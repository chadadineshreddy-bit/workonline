"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root error encountered:", error?.message || "Unknown error", error?.digest);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F5F8] text-[#202124] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[32px] border border-white/90 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white mx-auto flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-7 h-7 drop-shadow" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F04452]">
              Root Error
            </span>
            <h1 className="text-xl font-bold text-[#202124]">Application Error</h1>
            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
              A critical layout error occurred. Please refresh or reload the platform.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-full bg-gradient-to-tr from-[#F04452] to-[#D72638] hover:from-[#FF5B66] hover:to-[#F04452] text-white text-xs font-bold shadow-lg transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
