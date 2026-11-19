"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  Upload,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Target,
  FileCheck2,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { extractTextFromPdf, extractTextFromDoc, executeAiTask } from "@/lib/ai/ai-client";
import { AiStatusBadge } from "./ai-status-badge";

export function ResumeAssistantSuite() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [sourceName, setSourceName] = useState<string | null>(null);

  const [analysisReport, setAnalysisReport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsExtracting(true);
    setSourceName(file.name);

    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".pdf")) {
        const extracted = await extractTextFromPdf(file);
        setResumeText(extracted.totalText);
      } else {
        const extracted = await extractTextFromDoc(file);
        setResumeText(extracted.text);
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse resume file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume content or upload a resume file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAnalysisReport("");

    const response = await executeAiTask({
      task: "analyze_resume",
      prompt: resumeText.slice(0, 35000),
      options: {
        mode: jobDescription.slice(0, 15000),
        temperature: 0.3,
      },
    });

    if (response.success && response.result) {
      setAnalysisReport(response.result);
    } else {
      setError(response.error || "Failed to evaluate resume.");
    }

    setIsProcessing(false);
  };

  const handleCopy = () => {
    if (!analysisReport) return;
    navigator.clipboard.writeText(analysisReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-white space-y-8/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-[#777777]">
          <Link href="/" className="hover:text-[#F04452] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/ai-workspace" className="hover:text-[#F04452] transition-colors">
            AI Workspace
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#202124] font-medium">AI Resume Assistant</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-[#F04452]" />
              AI Resume Evaluator & Keyword Matcher
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Audit your CV for executive impact, STAR-method bullet points, and job description keyword alignment with zero hallucinated credentials.
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

        {/* Input / Output 2-Col Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Inputs */}
          <div className="space-y-4">
            <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#F04452]" />
                  Your Resume Text
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="text-xs text-[#F04452] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isExtracting ? "Extracting..." : "Upload PDF/DOCX"}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />

              {sourceName && (
                <div className="p-2 rounded-lg bg-red-500/10 text-xs text-[#D72638] font-medium flex items-center justify-between">
                  <span>Attached: {sourceName}</span>
                  <button onClick={() => { setSourceName(null); setResumeText(""); }} className="text-rose-600 hover:underline">Remove</button>
                </div>
              )}

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your current resume content here, or click 'Upload PDF/DOCX' above..."
                className="w-full h-56 p-3.5 text-xs sm:text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-sans leading-relaxed resize-none text-[#202124]"
              />
            </div>

            {/* Job Description Matching Box */}
            <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-purple-600" />
                  Target Job Description (Optional for Keyword Gap Analysis)
                </label>
                {jobDescription && (
                  <button onClick={() => setJobDescription("")} className="text-xs text-rose-600 hover:underline">Clear</button>
                )}
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting description here to identify missing technical keywords and qualification alignment..."
                className="w-full h-36 p-3.5 text-xs sm:text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-sans leading-relaxed resize-none text-[#202124]"
              />

              <button
                onClick={handleAnalyzeResume}
                disabled={isProcessing || isExtracting || !resumeText.trim()}
                className="w-full py-3 rounded-xl liquid-btn-primary font-semibold text-xs sm:text-sm disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? "Evaluating Resume Structure..." : "Run AI Resume Audit"}
              </button>
            </div>

            {/* Ethical AI Guarantee */}
            <div className="bg-white/20 rounded-2xl border border-white/80 p-4 space-y-1.5 text-xs text-[#777777]">
              <div className="font-bold text-[#202124] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Professional Integrity Guarantee
              </div>
              <p className="text-[11px] leading-relaxed">
                WorkOnline AI never fabricates fake work histories, credentials, or fraudulent metrics. All suggestions are formulated as qualitative improvements you review and approve before submitting.
              </p>
            </div>
          </div>

          {/* Right Column: AI Analysis Report */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#202124] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F04452]" />
                Executive Evaluation Report
              </h3>

              {analysisReport && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Report"}</span>
                  </button>
                  <Link
                    href="/documents/resume-builder"
                    className="px-2.5 py-1.5 rounded-lg border border-[#F04452]/25 bg-red-500/10 hover:bg-red-500/15 text-[#D72638] text-xs font-medium flex items-center gap-1"
                  >
                    <span>Edit in Resume Builder</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white/20/70 rounded-xl border border-white/80 p-5 overflow-y-auto">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-20">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-[#202124]">
                    Evaluating resume impact, STAR bullet points, and keyword gaps...
                  </p>
                  <p className="text-xs text-[#777777]">
                    Constructing executive improvement recommendations.
                  </p>
                </div>
              ) : analysisReport ? (
                <div className="text-xs sm:text-sm text-[#202124] whitespace-pre-wrap leading-relaxed space-y-3">
                  {analysisReport}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#777777]">
                  <Briefcase className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold text-[#777777]">
                    No resume report generated yet
                  </p>
                  <p className="text-[11px] max-w-xs text-[#777777]">
                    Upload your resume on the left and click &quot;Run AI Resume Audit&quot; to inspect strengths, formatting gaps, and keyword match.
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
