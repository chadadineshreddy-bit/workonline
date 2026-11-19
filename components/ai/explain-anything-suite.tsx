"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  Sliders,
  Compass,
  ArrowRight
} from "lucide-react";
import { executeAiTask } from "@/lib/ai/ai-client";
import { AiStatusBadge } from "./ai-status-badge";

type ExplainLevel = "beginner" | "intermediate" | "advanced";

const POPULAR_TOPICS = [
  "Quantum Computing Qubits & Superposition",
  "How Large Language Models Work (Transformers)",
  "Inflation & Central Bank Interest Rates",
  "Blockchain Proof-of-Work vs Proof-of-Stake",
  "CRISPR-Cas9 Gene Editing Mechanism",
  "CAP Theorem in Distributed Databases"
];

export function ExplainAnythingSuite() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<ExplainLevel>("intermediate");

  const [explanation, setExplanation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExplain = async (selectedTopic?: string) => {
    const activeTopic = selectedTopic || topic;
    if (!activeTopic.trim()) {
      setError("Please enter a topic to explain.");
      return;
    }

    if (selectedTopic) setTopic(selectedTopic);

    setIsProcessing(true);
    setError(null);
    setExplanation("");

    const response = await executeAiTask({
      task: "explain_topic",
      prompt: activeTopic,
      options: {
        explanationLevel: level,
        temperature: 0.35,
      },
    });

    if (response.success && response.result) {
      setExplanation(response.result);
    } else {
      setError(response.error || "Failed to generate explanation.");
    }

    setIsProcessing(false);
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-white space-y-8/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
          <span className="text-[#202124] font-medium">Explain Anything</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <Lightbulb className="w-7 h-7 text-amber-500" />
              AI Concept Explainer
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Deconstruct complex scientific, engineering, financial, or academic concepts with clear mental models, step-by-step intuition, and real-world analogies.
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

        {/* Search & Topic Bar */}
        <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#202124] uppercase tracking-wider mb-2">
              What topic or concept would you like to understand?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExplain();
                }}
                placeholder="e.g. How zero-knowledge proofs work, or Keynesian vs Classical Economics..."
                className="flex-1 px-4 py-3 text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-medium text-[#202124]"
              />
              <button
                onClick={() => handleExplain()}
                disabled={isProcessing || !topic.trim()}
                className="px-6 py-3 liquid-btn-primary rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explain Topic</span>
              </button>
            </div>
          </div>

          {/* Level Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#202124]">
              <Sliders className="w-4 h-4 text-[#F04452]" />
              <span>Target Comprehension Depth:</span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {[
                { id: "beginner", label: "Beginner (Everyday Analogies)" },
                { id: "intermediate", label: "Intermediate (College / Professional)" },
                { id: "advanced", label: "Advanced (Expert & Rigorous)" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id as ExplainLevel)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    level === lvl.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white/30 text-[#202124] hover:bg-slate-200"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Topic Pills */}
          <div className="space-y-2 pt-2 border-t border-white/60">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
              Popular Concept Inquiries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TOPICS.map((top) => (
                <button
                  key={top}
                  onClick={() => handleExplain(top)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/30 hover:bg-red-500/10 hover:text-[#D72638] border border-transparent hover:border-[#F04452]/25 text-[#202124] transition-colors"
                >
                  {top}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Presentation Box */}
        {(isProcessing || explanation) && (
          <div className="liquid-glass-card rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#F04452]" />
                <h3 className="font-bold text-base text-[#202124]">
                  Concept Breakdown: {topic}
                </h3>
              </div>

              {explanation && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Explanation"}</span>
                </button>
              )}
            </div>

            {isProcessing ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-[#202124]">
                  Deconstructing concept and crafting analogies...
                </p>
                <p className="text-xs text-[#777777]">
                  Structuring {level} level mental models.
                </p>
              </div>
            ) : (
              <div className="text-sm text-[#202124] whitespace-pre-wrap leading-relaxed space-y-3 pt-2">
                {explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
