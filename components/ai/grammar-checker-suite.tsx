"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCheck,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  X,
  RotateCcw,
  SpellCheck,
  CheckCircle2
} from "lucide-react";
import { executeAiTask } from "@/lib/ai/ai-client";
import { AiStatusBadge } from "./ai-status-badge";

interface CorrectionItem {
  original: string;
  replacement: string;
  type: "Spelling" | "Grammar" | "Punctuation" | "Clarity";
  explanation: string;
}

interface GrammarResult {
  correctedText: string;
  issuesCount: number;
  corrections: CorrectionItem[];
  clarityScore: string;
}

export function GrammarCheckerSuite() {
  const [inputText, setInputText] = useState("");
  const [activeText, setActiveText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheckGrammar = async () => {
    if (!inputText.trim()) {
      setError("Please paste text to analyze.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setAcceptedIndices(new Set());

    const response = await executeAiTask({
      task: "check_grammar",
      prompt: inputText.slice(0, 30000),
      options: { temperature: 0.1 },
    });

    if (response.success && response.result) {
      try {
        const cleaned = response.result
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const parsed: GrammarResult = JSON.parse(cleaned);
        setResult(parsed);
        setActiveText(inputText);
      } catch {
        setError("Could not parse grammar corrections. Please try again.");
      }
    } else {
      setError(response.error || "Failed to analyze grammar.");
    }

    setIsProcessing(false);
  };

  const handleAcceptCorrection = (idx: number, corr: CorrectionItem) => {
    if (acceptedIndices.has(idx)) return;

    setActiveText((prev) => {
      if (prev.includes(corr.original)) {
        return prev.replace(corr.original, corr.replacement);
      }
      return prev;
    });

    setAcceptedIndices((prev) => new Set(prev).add(idx));
  };

  const handleAcceptAll = () => {
    if (!result) return;
    setActiveText(result.correctedText);
    const all = new Set(result.corrections.map((_, i) => i));
    setAcceptedIndices(all);
  };

  const handleCopy = () => {
    const textToCopy = activeText || (result ? result.correctedText : inputText);
    navigator.clipboard.writeText(textToCopy);
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
          <span className="text-[#202124] font-medium">AI Grammar Checker</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <SpellCheck className="w-7 h-7 text-[#F04452]" />
              AI Grammar & Editorial Proofreader
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Detect grammatical slips, misspelled words, and awkward phrasing with interactive accept/reject correction cards.
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

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input & Live Corrected Text */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#202124]">
                {result ? "Working Document (Corrections Applied)" : "Your Text to Proofread"}
              </h3>
              {inputText && (
                <button
                  onClick={() => {
                    setInputText("");
                    setActiveText("");
                    setResult(null);
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={result ? activeText : inputText}
              onChange={(e) => {
                if (result) setActiveText(e.target.value);
                else setInputText(e.target.value);
              }}
              placeholder="Paste text with grammatical errors, essays, reports, or client emails..."
              className="flex-1 w-full min-h-[350px] p-4 text-xs sm:text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-sans leading-relaxed resize-none text-[#202124]"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/60">
              <span className="text-xs text-[#777777] font-mono">
                {(result ? activeText : inputText).trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex items-center gap-2">
                {result && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
                <button
                  onClick={handleCheckGrammar}
                  disabled={isProcessing || !inputText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl liquid-btn-primary text-xs sm:text-sm font-semibold disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessing ? "Auditing Text..." : "Check Grammar"}
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions & Corrections List */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#202124]">Detected Issues & Corrections</h3>
                {result && (
                  <span className="text-xs bg-red-500/10 text-[#D72638] px-2 py-0.5 rounded-full font-bold">
                    {result.issuesCount} found
                  </span>
                )}
              </div>

              {result && result.corrections.length > 0 && (
                <button
                  onClick={handleAcceptAll}
                  className="text-xs text-[#F04452] font-bold hover:underline"
                >
                  Accept All
                </button>
              )}
            </div>

            <div className="flex-1 bg-white/20/70 rounded-xl border border-white/80 p-4 overflow-y-auto space-y-3 min-h-[350px]">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-16">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-[#202124]">
                    Checking grammar, spelling, and sentence clarity...
                  </p>
                </div>
              ) : result ? (
                result.corrections.length > 0 ? (
                  result.corrections.map((corr, idx) => {
                    const isAccepted = acceptedIndices.has(idx);
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isAccepted
                            ? "bg-emerald-50/60 border-emerald-200 opacity-80"
                            : "bg-white border-white/80 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/30 text-[#202124]">
                            {corr.type}
                          </span>
                          {isAccepted ? (
                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcceptCorrection(idx, corr)}
                              className="px-2.5 py-1 rounded-lg liquid-btn-primary text-xs font-semibold transition-colors"
                            >
                              Accept
                            </button>
                          )}
                        </div>

                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-rose-600 line-through">{corr.original}</span>
                            <span className="text-[#777777]">→</span>
                            <span className="text-emerald-700 font-bold">{corr.replacement}</span>
                          </div>
                          <p className="text-[#777777] text-[11px] pt-1">{corr.explanation}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    <h4 className="font-bold text-[#202124] text-sm">Flawless Text!</h4>
                    <p className="text-xs text-[#777777]">No spelling or grammatical issues detected.</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#777777]">
                  <SpellCheck className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold text-[#777777]">
                    No grammar analysis run yet
                  </p>
                  <p className="text-[11px] max-w-xs text-[#777777]">
                    Paste text on the left and click &quot;Check Grammar&quot; to review individual spelling and syntax suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
