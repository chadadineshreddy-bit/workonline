"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Upload,
  Copy,
  Check,
  Download,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Edit3,
  Sliders,
  FileText
} from "lucide-react";
import { extractTextFromPdf, extractTextFromDoc, executeAiTask } from "@/lib/ai/ai-client";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { convertTxtToPdfBlob } from "@/lib/docx/document-converters";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { AiStatusBadge } from "./ai-status-badge";

type NotesStyle = "detailed" | "beginner" | "revision";

export function NotesGeneratorSuite() {
  const [topic, setTopic] = useState("");
  const [studyMaterial, setStudyMaterial] = useState("");
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [style, setStyle] = useState<NotesStyle>("detailed");

  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsExtracting(true);
    setSourceName(file.name);

    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".pdf")) {
        const extracted = await extractTextFromPdf(file);
        setStudyMaterial(extracted.totalText);
      } else {
        const extracted = await extractTextFromDoc(file);
        setStudyMaterial(extracted.text);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load study file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateNotes = async () => {
    if (!topic.trim() && !studyMaterial.trim()) {
      setError("Please provide either a topic name or study material text.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setNotes("");

    const response = await executeAiTask({
      task: "generate_notes",
      prompt: studyMaterial.slice(0, 45000) || `Generate structured study notes on: ${topic}`,
      options: {
        mode: topic || "Core Concepts",
        difficulty: style,
        temperature: 0.3,
      },
    });

    if (response.success && response.result) {
      setNotes(response.result);
    } else {
      setError(response.error || "Failed to generate study notes.");
    }

    setIsProcessing(false);
  };

  const handleCopy = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotesManager = () => {
    if (!notes) return;
    try {
      const raw = localStorage.getItem("workonline_student_notes");
      const existing = raw ? JSON.parse(raw) : [];
      const newNote = {
        id: "note-" + Date.now(),
        title: topic || (sourceName ? `${sourceName} Notes` : "AI Generated Notes"),
        subject: topic || "AI Notes",
        content: notes,
        tags: ["AI Generated", style],
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem("workonline_student_notes", JSON.stringify([newNote, ...existing]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError("Could not save to local Notes Manager.");
    }
  };

  const handleDownloadTxt = () => {
    if (!notes) return;
    const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(blob, `${(topic || "Study_Notes").replace(/\s+/g, "_")}.txt`);
  };

  const handleDownloadDocx = async () => {
    if (!notes) return;
    const lines = notes.split("\n");
    const docChildren: Paragraph[] = [
      new Paragraph({
        text: topic || "Study & Revision Notes",
        heading: HeadingLevel.TITLE,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated with WorkOnline AI | Style: ${style.toUpperCase()}`,
            italics: true,
            color: "666666",
            size: 20,
          }),
        ],
        spacing: { after: 250 },
      }),
    ];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        docChildren.push(
          new Paragraph({
            text: trimmed.replace(/^###\s*/, ""),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 },
          })
        );
      } else if (trimmed.startsWith("##")) {
        docChildren.push(
          new Paragraph({
            text: trimmed.replace(/^##\s*/, ""),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 220, after: 100 },
          })
        );
      } else if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
        docChildren.push(
          new Paragraph({
            text: trimmed.replace(/^[-•]\s*/, ""),
            bullet: { level: 0 },
            spacing: { after: 60 },
          })
        );
      } else if (trimmed.length > 0) {
        docChildren.push(
          new Paragraph({
            text: trimmed,
            spacing: { after: 100 },
          })
        );
      }
    });

    const doc = new Document({
      sections: [{ children: docChildren }],
    });

    const blob = await Packer.toBlob(doc);
    triggerBlobDownload(blob, `${(topic || "Study_Notes").replace(/\s+/g, "_")}.docx`);
  };

  const handleDownloadPdf = async () => {
    if (!notes) return;
    const pdfBlob = await convertTxtToPdfBlob(notes, topic || "Study Notes — WorkOnline AI");
    triggerBlobDownload(pdfBlob, `${(topic || "Study_Notes").replace(/\s+/g, "_")}.pdf`);
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
          <span className="text-[#202124] font-medium">AI Notes Generator</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-[#F04452]" />
              AI Notes & Study Guide Generator
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Transform syllabus topics, lectures, or uploaded textbooks into structured study notes with high-yield definitions and key takeaways.
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

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Saved to your Student Zone Notes Binder! You can view and manage it under <Link href="/student-zone/notes-manager" className="underline font-semibold">Notes Manager</Link>.</span>
          </div>
        )}

        {/* Style Options */}
        <div className="liquid-glass-card rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#202124]">
            <Sliders className="w-4 h-4 text-[#F04452]" />
            <span>Notes Pedagogy & Depth:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "detailed", label: "Detailed & Rigorous" },
              { id: "beginner", label: "Beginner-Friendly & Intuitive" },
              { id: "revision", label: "Short Exam Revision Cheat-Sheet" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id as NotesStyle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  style === s.id
                    ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-sm"
                    : "bg-white/30 text-[#202124] hover:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Output Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <div>
              <label className="block text-xs font-bold text-[#202124] mb-1.5 uppercase tracking-wider">
                Topic or Course Subject
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Distributed Consensus (Raft vs Paxos) or Cellular Respiration"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 text-xs sm:text-sm text-[#202124] font-medium"
              />
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Source Material / Text (Optional)
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="inline-flex items-center gap-1.5 text-xs text-[#F04452] font-semibold hover:underline"
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
                  <button onClick={() => { setSourceName(null); setStudyMaterial(""); }} className="text-rose-600 hover:underline">Remove</button>
                </div>
              )}

              <textarea
                value={studyMaterial}
                onChange={(e) => setStudyMaterial(e.target.value)}
                placeholder="Optional: Paste raw lecture transcripts, syllabus outline, or chapter excerpts..."
                className="flex-1 w-full min-h-[300px] p-3.5 text-xs sm:text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-sans leading-relaxed resize-none text-[#202124]"
              />
            </div>

            <button
              onClick={handleGenerateNotes}
              disabled={isProcessing || isExtracting || (!topic.trim() && !studyMaterial.trim())}
              className="w-full py-2.5 rounded-xl liquid-btn-primary text-xs sm:text-sm font-semibold disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? "Generating Notes..." : "Generate Structured Notes"}
            </button>
          </div>

          {/* Output Panel */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#202124] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#F04452]" />
                Study Notes Editor
              </h3>

              {notes && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleSaveToNotesManager}
                    className="p-1.5 rounded-lg border border-[#F04452]/25 bg-red-500/10 text-[#D72638] hover:bg-red-500/15 text-xs font-medium"
                    title="Save to Student Zone Notes Manager"
                  >
                    Save to Binder
                  </button>

                  <button
                    onClick={handleDownloadDocx}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium"
                  >
                    DOCX
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium"
                  >
                    PDF
                  </button>
                </div>
              )}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your structured study notes will appear here. You can freely edit, format, or add your own thoughts before exporting..."
              className="flex-1 w-full min-h-[350px] p-4 text-xs sm:text-sm rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-mono leading-relaxed resize-none text-[#202124] bg-white/20"
            />

            {notes && (
              <div className="flex items-center justify-between text-xs text-[#777777] pt-2 border-t border-white/60">
                <span>{notes.trim().split(/\s+/).length} words</span>
                <Link
                  href="/documents/editor"
                  className="text-[#F04452] hover:underline font-semibold flex items-center gap-1"
                >
                  Open in Document Studio <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
