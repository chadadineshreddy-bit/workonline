"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function AiStatusBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 select-none shadow-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>Gemini AI Active</span>
      <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-0.5" />
    </div>
  );
}
