"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowRightLeft,
  Clock,
  Sliders,
  AlignLeft,
  CheckCircle2
} from "lucide-react";

export function StudentTextTools() {
  const [activeTab, setActiveTab] = useState<"inspector" | "diff">("inspector");

  const [text, setText] = useState(
    `WorkOnline is an all-in-one productivity platform designed for students and working professionals. It combines client-side PDF manipulation, online document authoring, academic grade calculators, study planners, and everyday utility engines.\n\nAll tools process data locally within your browser sandbox, eliminating unnecessary server round-trips and preserving complete document privacy.`
  );
  const [copied, setCopied] = useState(false);

  // Diff comparison states
  const [originalText, setOriginalText] = useState(
    "The quick brown fox jumps over the lazy dog.\nAll students must submit assignments before Friday 5:00 PM."
  );
  const [modifiedText, setModifiedText] = useState(
    "The swift brown fox leaps over the lazy dog.\nAll students must submit assignments before Monday 11:59 PM."
  );

  // Metrics
  const stats = useMemo(() => {
    const raw = text;
    const wordsArray = raw.trim().split(/\s+/).filter(Boolean);
    const words = wordsArray.length;
    const charsWithSpaces = raw.length;
    const charsWithoutSpaces = raw.replace(/\s/g, "").length;
    const sentences = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = raw.split(/\n+/).filter((p) => p.trim().length > 0).length;

    const readingTimeMins = words > 0 ? (words / 200).toFixed(1) : "0.0";
    const speakingTimeMins = words > 0 ? (words / 130).toFixed(1) : "0.0";

    return {
      words,
      charsWithSpaces,
      charsWithoutSpaces,
      sentences,
      paragraphs,
      readingTimeMins,
      speakingTimeMins,
    };
  }, [text]);

  // Operations
  const handleUppercase = () => setText(text.toUpperCase());
  const handleLowercase = () => setText(text.toLowerCase());
  const handleTitleCase = () => {
    const res = text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    setText(res);
  };
  const handleSentenceCase = () => {
    const res = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    setText(res);
  };
  const handleRemoveExtraSpaces = () => {
    const res = text
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .join("\n");
    setText(res);
  };
  const handleRemoveDuplicateLines = () => {
    const lines = text.split("\n");
    const unique = Array.from(new Set(lines));
    setText(unique.join("\n"));
  };
  const handleClear = () => setText("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy text.");
    }
  };

  // Diff comparison line-by-line helper
  const diffLines = useMemo(() => {
    const orig = originalText.split("\n");
    const mod = modifiedText.split("\n");
    const maxLen = Math.max(orig.length, mod.length);
    const rows = [];

    for (let i = 0; i < maxLen; i++) {
      const o = orig[i] ?? "";
      const m = mod[i] ?? "";
      const isDiff = o !== m;
      rows.push({ o, m, isDiff });
    }
    return rows;
  }, [originalText, modifiedText]);

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Student Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-[#F04452]">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Word Counter & Text Utilities
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Text"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Text Analysis & Transformation Utilities
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Live word and character counts, reading speech estimates, case conversions, space strippers, and text difference comparisons.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/80 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("inspector")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "inspector"
                ? "border-blue-600 text-[#F04452]"
                : "border-transparent text-[#777777] hover:text-[#202124]"
            }`}
          >
            <span>Word Counter & Case Tools</span>
          </button>
          <button
            onClick={() => setActiveTab("diff")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "diff"
                ? "border-blue-600 text-[#F04452]"
                : "border-transparent text-[#777777] hover:text-[#202124]"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Text Compare & Diff</span>
          </button>
        </div>

        {activeTab === "inspector" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Input Textarea and Actions */}
            <div className="lg:col-span-8 space-y-4">
              <div className="liquid-glass-card rounded-2xl shadow-md p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/60">
                  <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                    Text Canvas
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear All
                  </button>
                </div>

                <textarea
                  rows={16}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type your essay, abstract, speech, or thesis notes here..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-white/80 font-serif leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 resize-y"
                />

                {/* Transformation Action Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/60 text-xs">
                  <button
                    onClick={handleUppercase}
                    className="px-2.5 py-1.5 rounded-lg bg-white/30 hover:bg-slate-200 font-semibold text-[#202124]"
                  >
                    UPPERCASE
                  </button>
                  <button
                    onClick={handleLowercase}
                    className="px-2.5 py-1.5 rounded-lg bg-white/30 hover:bg-slate-200 font-semibold text-[#202124]"
                  >
                    lowercase
                  </button>
                  <button
                    onClick={handleTitleCase}
                    className="px-2.5 py-1.5 rounded-lg bg-white/30 hover:bg-slate-200 font-semibold text-[#202124]"
                  >
                    Title Case
                  </button>
                  <button
                    onClick={handleSentenceCase}
                    className="px-2.5 py-1.5 rounded-lg bg-white/30 hover:bg-slate-200 font-semibold text-[#202124]"
                  >
                    Sentence case
                  </button>
                  <button
                    onClick={handleRemoveExtraSpaces}
                    className="px-2.5 py-1.5 rounded-lg bg-white/30 hover:bg-slate-200 text-[#202124]"
                  >
                    Clean Extra Spaces
                  </button>
                  <button
                    onClick={handleRemoveDuplicateLines}
                    className="px-2.5 py-1.5 rounded-lg bg-white/30 hover:bg-slate-200 text-[#202124]"
                  >
                    Deduplicate Lines
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Real-Time Stats Grid */}
            <div className="lg:col-span-4 space-y-4">
              <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Live Text Metrics
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white/20 rounded-xl border border-white/60">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      Words
                    </span>
                    <span className="text-2xl font-black text-[#202124] font-mono">
                      {stats.words}
                    </span>
                  </div>

                  <div className="p-3 bg-white/20 rounded-xl border border-white/60">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      Characters
                    </span>
                    <span className="text-2xl font-black text-[#202124] font-mono">
                      {stats.charsWithSpaces}
                    </span>
                  </div>

                  <div className="p-3 bg-white/20 rounded-xl border border-white/60">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      No Spaces
                    </span>
                    <span className="text-xl font-bold text-[#202124] font-mono">
                      {stats.charsWithoutSpaces}
                    </span>
                  </div>

                  <div className="p-3 bg-white/20 rounded-xl border border-white/60">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      Sentences
                    </span>
                    <span className="text-xl font-bold text-[#202124] font-mono">
                      {stats.sentences}
                    </span>
                  </div>

                  <div className="p-3 bg-white/20 rounded-xl border border-white/60">
                    <span className="text-[10px] text-[#777777] uppercase tracking-wider block font-bold">
                      Paragraphs
                    </span>
                    <span className="text-xl font-bold text-[#202124] font-mono">
                      {stats.paragraphs}
                    </span>
                  </div>

                  <div className="p-3 bg-red-500/10 rounded-xl border border-[#F04452]/20">
                    <span className="text-[10px] text-[#D72638] uppercase tracking-wider block font-bold">
                      Reading Time
                    </span>
                    <span className="text-base font-bold text-[#202124] font-mono">
                      ~{stats.readingTimeMins} min
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/20 rounded-xl text-xs text-[#777777] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#777777]" /> Speech Presentation:
                  </span>
                  <span className="font-mono font-bold text-[#202124]">
                    ~{stats.speakingTimeMins} mins
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Text Diff Comparison */}
        {activeTab === "diff" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="liquid-glass-card rounded-2xl p-4 shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#202124] uppercase tracking-wider block">
                  Original Version
                </span>
                <textarea
                  rows={8}
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-white/80 font-mono focus:outline-none"
                />
              </div>

              <div className="liquid-glass-card rounded-2xl p-4 shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#202124] uppercase tracking-wider block">
                  Revised / Modified Version
                </span>
                <textarea
                  rows={8}
                  value={modifiedText}
                  onChange={(e) => setModifiedText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-white/80 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Line Diff Results */}
            <div className="liquid-glass-card rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                Line-by-Line Comparison
              </h3>
              <div className="divide-y divide-slate-100 font-mono text-xs max-h-96 overflow-y-auto">
                {diffLines.map((row, idx) => (
                  <div
                    key={idx}
                    className={`py-2 px-3 rounded grid grid-cols-1 md:grid-cols-2 gap-4 ${
                      row.isDiff ? "bg-amber-50/70 border-l-4 border-amber-500" : ""
                    }`}
                  >
                    <div className="text-[#777777] truncate">
                      <span className="text-[#777777] mr-2 text-[10px]">{idx + 1}</span>
                      {row.o || <span className="text-slate-300 italic">(empty)</span>}
                    </div>
                    <div className={row.isDiff ? "text-amber-900 font-bold truncate" : "text-[#777777] truncate"}>
                      <span className="text-[#777777] mr-2 text-[10px]">{idx + 1}</span>
                      {row.m || <span className="text-slate-300 italic">(empty)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
