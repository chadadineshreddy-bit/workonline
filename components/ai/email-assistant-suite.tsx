"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Sliders,
  Send,
  ExternalLink,
  Edit2
} from "lucide-react";
import { executeAiTask } from "@/lib/ai/ai-client";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { AiStatusBadge } from "./ai-status-badge";

const EMAIL_TEMPLATES = [
  {
    name: "Job Application",
    purpose: "Apply for a Senior Software Engineer position highlighting full-stack TypeScript experience",
    recipient: "Hiring Manager",
    subject: "Application for Senior Software Engineer — Alex Harrison",
    points: "5+ years building scalable SaaS applications, strong React & Node.js background, aligned with company mission.",
  },
  {
    name: "Leave Request",
    purpose: "Request 3 days of annual PTO for family commitments",
    recipient: "Operations Manager",
    subject: "Annual Leave Request — Dec 18 to Dec 20",
    points: "All ongoing deliverables handed over to Sarah; will monitor critical Slack escalations if urgent.",
  },
  {
    name: "Meeting Follow-up",
    purpose: "Summarize key decisions from today's client sync and confirm next deliverables",
    recipient: "Client Stakeholders",
    subject: "Follow-Up: WorkOnline Q4 Roadmap Review & Action Items",
    points: "Agreed on sprint timelines, API spec finalized by Thursday, next status check-in next Tuesday 10 AM.",
  },
  {
    name: "Client Project Proposal",
    purpose: "Introduce our team's proposal for the new enterprise workspace integration",
    recipient: "Acme Corp Procurement",
    subject: "Proposal: Enterprise Productivity Workspace Integration",
    points: "Addresses current communication fragmentation, estimated 4-week rollout, pricing breakdown attached.",
  },
  {
    name: "Salary Review",
    purpose: "Request a compensation and performance review meeting following successful project delivery",
    recipient: "Department Lead",
    subject: "Performance Review & Compensation Discussion Request",
    points: "Exceeded delivery goals for Q3, led cross-functional team, took on lead architectural duties.",
  },
  {
    name: "Thank You Note",
    purpose: "Express gratitude following an insightful panel interview or mentorship discussion",
    recipient: "Interview Panel",
    subject: "Thank You — Discussion regarding Senior Product Role",
    points: "Appreciated the thoughtful discussion about engineering culture, excited about the opportunity.",
  },
];

export function EmailAssistantSuite() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");

  const [emailDraft, setEmailDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const applyTemplate = (t: (typeof EMAIL_TEMPLATES)[0]) => {
    setRecipient(t.recipient);
    setSubject(t.subject);
    setPurpose(t.purpose);
    setKeyPoints(t.points);
  };

  const handleGenerateEmail = async (overrideTone?: string) => {
    if (!purpose.trim() && !keyPoints.trim()) {
      setError("Please describe the email purpose or key points.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const activeTone = overrideTone || tone;

    const response = await executeAiTask({
      task: "write_email",
      prompt: `Purpose: ${purpose}\nRecipient: ${recipient}\nSubject: ${subject}\nPoints: ${keyPoints}`,
      options: {
        tone: activeTone,
        mode: length,
        temperature: 0.3,
      },
    });

    if (response.success && response.result) {
      setEmailDraft(response.result);
    } else {
      setError(response.error || "Failed to generate email.");
    }

    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!emailDraft) return;
    navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!emailDraft) return;
    const blob = new Blob([emailDraft], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(blob, "workonline_email.txt");
  };

  const handleDownloadDocx = async () => {
    if (!emailDraft) return;
    const lines = emailDraft.split("\n");
    const docChildren = lines.map(
      (line) =>
        new Paragraph({
          text: line,
          spacing: { after: 120 },
        })
    );

    const doc = new Document({
      sections: [{ children: docChildren }],
    });

    const blob = await Packer.toBlob(doc);
    triggerBlobDownload(blob, "workonline_email.docx");
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
          <span className="text-[#202124] font-medium">AI Email Assistant</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <Mail className="w-7 h-7 text-[#F04452]" />
              AI Workplace Email Assistant
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Draft courteous, persuasive, and grammatically flawless workplace communications with customized tone and length controls.
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

        {/* Templates Carousel */}
        <div className="liquid-glass-card rounded-2xl p-4 shadow-sm space-y-2">
          <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Quick Ready-Made Workplace Presets:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {EMAIL_TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => applyTemplate(tpl)}
                className="px-3 py-1.5 rounded-lg border border-white/80 hover:border-blue-400 hover:bg-red-500/10/50 text-xs font-medium text-[#202124] whitespace-nowrap transition-colors"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Parameters */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Recipient Name / Title</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Sarah Jenkins / Hiring Lead"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9E8E93] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Project Delivery Update"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9E8E93] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Email Purpose / Objective</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Propose moving the sprint review to Thursday due to product testing"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9E8E93] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Key Points / Context to Include</label>
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Enter bullet points, dates, or details you want incorporated into the message..."
                className="w-full h-32 p-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9E8E93] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Tone & Length Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1.5">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30"
                >
                  <option value="Professional" className="text-slate-900 dark:text-white bg-white dark:bg-[#171114]">Professional (Corporate Standard)</option>
                  <option value="Formal" className="text-slate-900 dark:text-white bg-white dark:bg-[#171114]">Formal & Executive</option>
                  <option value="Friendly" className="text-slate-900 dark:text-white bg-white dark:bg-[#171114]">Friendly & Approachable</option>
                  <option value="Polite" className="text-slate-900 dark:text-white bg-white dark:bg-[#171114]">Polite & Courteous</option>
                  <option value="Concise" className="text-slate-900 dark:text-white bg-white dark:bg-[#171114]">Concise & Direct</option>
                  <option value="Apologetic" className="text-slate-900 dark:text-white bg-white dark:bg-[#171114]">Apologetic & Empathetic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1.5">Length</label>
                <div className="flex gap-1.5">
                  {["Short", "Medium", "Detailed"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`flex-1 py-1.5 rounded-lg text-xs transition-all border ${
                        length === l
                          ? "bg-[#DC2626] text-white border-[#DC2626] shadow-sm font-bold"
                          : "bg-white dark:bg-white/[0.07] text-slate-900 dark:text-slate-100 border-slate-300 dark:border-white/20 hover:border-[#DC2626]/60 font-semibold"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleGenerateEmail()}
              disabled={isGenerating || (!purpose.trim() && !keyPoints.trim())}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#DC2626] via-[#B91C1C] to-[#991B1B] hover:from-[#EF4444] hover:to-[#DC2626] font-bold text-sm text-white disabled:opacity-50 transition-all shadow-md shadow-[#DC2626]/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white shrink-0" />
              <span className="text-white font-bold">{isGenerating ? "Composing Email Draft..." : "Generate Email Draft"}</span>
            </button>
          </div>

          {/* Generated Draft Output */}
          <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#DC2626]" />
                Draft Email Output
              </h3>

              {emailDraft && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-medium flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium"
                  >
                    TXT
                  </button>

                  <button
                    onClick={handleDownloadDocx}
                    className="p-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] text-xs font-medium"
                  >
                    DOCX
                  </button>
                </div>
              )}
            </div>

            <textarea
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="Your generated email draft will appear here. You can freely edit recipient names or sign-offs before copying..."
              className="flex-1 w-full min-h-[300px] p-4 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 font-sans leading-relaxed resize-none text-slate-900 dark:text-white bg-slate-50 dark:bg-white/[0.03] placeholder-slate-400 dark:placeholder-[#9E8E93]"
            />

            {emailDraft && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9E8E93]">Quick AI Polish Actions:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleGenerateEmail("Concise")}
                    disabled={isGenerating}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-[#E2D4D6] border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    Make More Concise
                  </button>
                  <button
                    onClick={() => handleGenerateEmail("Polite")}
                    disabled={isGenerating}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-[#E2D4D6] border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    Make More Polite
                  </button>
                  <button
                    onClick={() => handleGenerateEmail("Formal")}
                    disabled={isGenerating}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-[#E2D4D6] border border-slate-200 dark:border-white/10 transition-colors"
                  >
                    Make More Formal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
