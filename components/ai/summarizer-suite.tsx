"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  AlignLeft
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { extractTextFromPdf, extractTextFromDoc, executeAiTask } from "@/lib/ai/ai-client";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { convertTxtToPdfBlob } from "@/lib/docx/document-converters";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { AiStatusBadge } from "./ai-status-badge";

type SummaryFormat = "bullets" | "short" | "detailed" | "executive" | "chapter";

export function SummarizerSuite() {
  const [inputText, setInputText] = useState("");
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [format, setFormat] = useState<SummaryFormat>("bullets");

  const [summary, setSummary] = useState<string>("");
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
        if (extracted.isScannedOrEmpty) {
          setError("This PDF appears to be a scanned image with minimal selectable text. The summary may be limited.");
        }
        setInputText(extracted.totalText);
      } else {
        const extracted = await extractTextFromDoc(file);
        setInputText(extracted.text);
      }
    } catch (err: any) {
      setError(err.message || "Failed to read file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!inputText.trim()) {
      setError("Please paste text or upload a document to summarize.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSummary("");

    const response = await executeAiTask({
      task: "summarize",
      prompt: inputText.slice(0, 45000), // safe chunk limit
      options: {
        summaryFormat: format,
        temperature: 0.3,
      },
    });

    if (response.success && response.result) {
      setSummary(response.result);
    } else {
      setError(response.error || "Failed to generate summary.");
    }

    setIsProcessing(false);
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(blob, "workonline_summary.txt");
  };

  const handleDownloadDocx = async () => {
    if (!summary) return;
    const lines = summary.split("\n");
    const docChildren: Paragraph[] = [
      new Paragraph({
        text: "Executive Summary — WorkOnline AI",
        heading: HeadingLevel.TITLE,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on ${new Date().toLocaleDateString()} | Source: ${sourceName || "Text Input"}`,
            italics: true,
            size: 20,
            color: "666666",
          }),
        ],
        spacing: { after: 300 },
      }),
    ];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        docChildren.push(
          new Paragraph({
            text: trimmed.replace(/^###\s*/, ""),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (trimmed.startsWith("##")) {
        docChildren.push(
          new Paragraph({
            text: trimmed.replace(/^##\s*/, ""),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
        docChildren.push(
          new Paragraph({
            text: trimmed.replace(/^[-•]\s*/, ""),
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      } else if (trimmed.length > 0) {
        docChildren.push(
          new Paragraph({
            text: trimmed,
            spacing: { after: 120 },
          })
        );
      }
    });

    const doc = new Document({
      sections: [{ children: docChildren }],
    });

    const blob = await Packer.toBlob(doc);
    triggerBlobDownload(blob, "workonline_summary.docx");
  };

  const handleDownloadPdf = async () => {
    if (!summary) return;
    const pdfBlob = await convertTxtToPdfBlob(summary, "Document Summary — WorkOnline AI");
    triggerBlobDownload(pdfBlob, "workonline_summary.pdf");
  };

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

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
          <span className="text-[#202124] font-medium">AI Document Summarizer</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-[#F04452]" />
              AI Document Summarizer
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Extract high-value summaries, executive takeaways, critical definitions, and key action items from PDFs, Word docs, or text.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AiStatusBadge />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-xs text-rose-600 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Format Selection Bar */}
        <div className="liquid-glass-card rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#202124]">
            <Sliders className="w-4 h-4 text-[#F04452]" />
            <span>Summary Format:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "bullets", label: "Bullet Points & Key Takeaways" },
              { id: "short", label: "Short (1-2 Paragraphs)" },
              { id: "detailed", label: "Comprehensive Detailed" },
              { id: "executive", label: "Executive Briefing" },
              { id: "chapter", label: "Section / Chapter Breakdown" },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id as SummaryFormat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  format === fmt.id
                    ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-sm"
                    : "bg-white/30 text-[#202124] hover:bg-slate-200"
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Input Container */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-[#F04452]" />
                <h3 className="font-bold text-sm text-[#202124]">Source Document / Text</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/80 hover:bg-white/20 text-[#202124] transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isExtracting ? "Extracting..." : "Upload File (PDF/DOCX/TXT)"}
                </button>
                {inputText && (
                  <button
                    onClick={() => {
                      setInputText("");
                      setSourceName(null);
                    }}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
            />

            {sourceName && (
              <div className="p-2.5 rounded-lg bg-red-500/10/70 border border-[#F04452]/25/80 text-xs text-[#202124] flex items-center justify-between">
                <span className="font-semibold truncate">Loaded: {sourceName}</span>
                <span className="text-[#777777] font-mono">
                  {wordCount.toLocaleString()} words
                </span>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste long document text, report, article, lecture notes, or upload a PDF/DOCX file using the button above..."
              className="flex-1 w-full min-h-[350px] p-4 text-xs sm:text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-sans leading-relaxed resize-none text-[#202124]"
            />

            <div className="flex items-center justify-between text-xs text-[#777777] pt-2 border-t border-white/60">
              <span className="font-mono">
                {charCount.toLocaleString()} chars | {wordCount.toLocaleString()} words
              </span>
              <button
                onClick={handleGenerateSummary}
                disabled={isProcessing || isExtracting || !inputText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl liquid-btn-primary font-semibold text-xs sm:text-sm disabled:opacity-40 transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? "Synthesizing Summary..." : "Generate AI Summary"}
              </button>
            </div>
          </div>

          {/* Generated Summary Container */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#202124]">AI Summary Output</h3>
              </div>

              {summary && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium"
                    title="Download TXT"
                  >
                    TXT
                  </button>

                  <button
                    onClick={handleDownloadDocx}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium"
                    title="Download DOCX"
                  >
                    DOCX
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium"
                    title="Download PDF"
                  >
                    PDF
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white/20/70 rounded-xl border border-white/80 p-4 overflow-y-auto min-h-[350px]">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-16">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-[#202124]">
                    Extracting key insights and synthesizing summary...
                  </p>
                  <p className="text-xs text-[#777777]">
                    Grounded in facts with no external fluff.
                  </p>
                </div>
              ) : summary ? (
                <div className="text-xs sm:text-sm text-[#202124] whitespace-pre-wrap leading-relaxed space-y-2">
                  {summary}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#777777]">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold text-[#777777]">
                    No summary generated yet
                  </p>
                  <p className="text-[11px] max-w-xs text-[#777777]">
                    Enter text or upload a document on the left and click &quot;Generate AI Summary&quot;.
                  </p>
                </div>
              )}
            </div>

            {summary && (
              <div className="pt-2 flex items-center justify-between text-xs text-[#777777] border-t border-white/60">
                <span>
                  Words: <strong>{summary.trim().split(/\s+/).length}</strong>
                </span>
                <span>
                  Estimated Read: <strong>{Math.ceil(summary.trim().split(/\s+/).length / 200)} min</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
