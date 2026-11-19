"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error encountered:", error?.message || "Unknown error", error?.digest);
  }, [error]);

  return (
    <div className="min-h-[75vh] apple-canvas-bg flex items-center justify-center px-4 py-16 relative overflow-hidden text-[#202124]">
      <FloatingRedElements variant="subtle" />

      <div className="max-w-md w-full text-center space-y-6 floating-glass-canvas p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white mx-auto flex items-center justify-center shadow-sphere-3d-sm">
          <AlertTriangle className="w-8 h-8 drop-shadow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F04452]">
            System Notice
          </span>
          <h2 className="text-2xl font-black text-[#202124] tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
            An unexpected error occurred while processing this request. Your data and session remain secure.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-[#777777] pt-1">
              Reference ID: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="liquid-btn-primary text-xs font-bold inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="liquid-btn-secondary text-xs font-bold inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-[#F04452]" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
