"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileEdit,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sliders,
  ArrowRight
} from "lucide-react";
import { executeAiTask } from "@/lib/ai/ai-client";
import { AiStatusBadge } from "./ai-status-badge";

type RewriteMode = "professional" | "simple" | "concise" | "expand" | "grammar";

export function TextRewriterSuite() {
  const [originalText, setOriginalText] = useState("");
  const [mode, setMode] = useState<RewriteMode>("professional");
  const [tone, setTone] = useState("Professional");

  const [rewrittenText, setRewrittenText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      setError("Please paste text to rewrite.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setRewrittenText("");

    const response = await executeAiTask({
      task: "rewrite_text",
      prompt: originalText.slice(0, 30000),
      options: {
        mode,
        tone,
        temperature: 0.35,
      },
    });

    if (response.success && response.result) {
      setRewrittenText(response.result);
    } else {
      setError(response.error || "Failed to rewrite text.");
    }

    setIsProcessing(false);
  };

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-white space-y-8/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[#777777]">
          <Link href="/" className="hover:text-[#F04452] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/ai-workspace" className="hover:text-[#F04452] transition-colors">
            AI Workspace
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#202124] font-medium">AI Text Rewriter</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <FileEdit className="w-7 h-7 text-[#F04452]" />
              AI Text Rewriter & Style Polisher
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Refactor rough drafts into executive corporate prose, simplified explanations, or concise summaries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AiStatusBadge />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-xs text-rose-600 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Mode Selector */}
        <div className="liquid-glass-card rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#202124]">
            <Sliders className="w-4 h-4 text-[#F04452]" />
            <span>Rewrite Objective:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "professional", label: "Make Professional" },
              { id: "simple", label: "Make Simple (Plain English)" },
              { id: "concise", label: "Make Concise (Trim Fluff)" },
              { id: "expand", label: "Expand & Elaborate" },
              { id: "grammar", label: "Fix Grammar & Syntax" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as RewriteMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === m.id
                    ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-sm"
                    : "bg-white/30 text-[#202124] hover:bg-slate-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Text */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#202124]">Original Text</h3>
              {originalText && (
                <button
                  onClick={() => setOriginalText("")}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste the draft text, email, paragraph, or report you want to rewrite..."
              className="flex-1 w-full min-h-[350px] p-4 text-xs sm:text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-sans leading-relaxed resize-none text-[#202124]"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/60">
              <span className="text-xs text-[#777777] font-mono">
                {originalText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                onClick={handleRewrite}
                disabled={isProcessing || !originalText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl liquid-btn-primary text-xs sm:text-sm font-semibold disabled:opacity-40 transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? "Rewriting..." : "Rewrite Text"}
              </button>
            </div>
          </div>

          {/* Rewritten Text */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#202124]">Rewritten Text</h3>
              {rewrittenText && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-white/20/70 rounded-xl border border-white/80 p-4 overflow-y-auto min-h-[350px]">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-16">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-[#202124]">
                    Refactoring syntax and tone...
                  </p>
                  <p className="text-xs text-[#777777]">
                    Applying {mode} mode adjustments.
                  </p>
                </div>
              ) : rewrittenText ? (
                <div className="text-xs sm:text-sm text-[#202124] whitespace-pre-wrap leading-relaxed space-y-2">
                  {rewrittenText}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#777777]">
                  <FileEdit className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold text-[#777777]">
                    No rewritten text yet
                  </p>
                  <p className="text-[11px] max-w-xs text-[#777777]">
                    Enter text on the left and select an objective to generate a styled rewrite.
                  </p>
                </div>
              )}
            </div>

            {/* Ethics notice */}
            <div className="pt-2 text-[11px] text-[#777777] flex items-center gap-1 border-t border-white/60">
              <ShieldCheck className="w-3.5 h-3.5 text-[#777777]" />
              <span>Constructive style enhancer. WorkOnline does not claim AI detection circumvention.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
