"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  BookOpen,
  HelpCircle,
  Briefcase,
  Mail,
  FileEdit,
  SpellCheck,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Lock,
  Search,
  Layers,
} from "lucide-react";
import { AiStatusBadge } from "./ai-status-badge";

interface AiToolItem {
  title: string;
  description: string;
  href: string;
  icon: any;
  badge: string;
  category: "Document & PDF" | "Study & Revision" | "Writing & Editorial" | "Career & Professional";
}

const AI_TOOLS: AiToolItem[] = [
  {
    title: "AI PDF Document Assistant",
    description:
      "Interact with multi-page PDFs using grounded question-answering with exact page citations and summaries.",
    href: "/ai-workspace/pdf-assistant",
    icon: FileText,
    badge: "Grounded Citations",
    category: "Document & PDF",
  },
  {
    title: "AI Document Summarizer",
    description:
      "Condense lengthy PDFs, Word documents, or research articles into executive briefs and bullet takeaways.",
    href: "/ai-workspace/summarizer",
    icon: Sparkles,
    badge: "PDF / DOCX / TXT",
    category: "Document & PDF",
  },
  {
    title: "AI Notes Generator",
    description:
      "Generate comprehensive study notes, key definitions, and revision outlines directly from syllabus topics.",
    href: "/ai-workspace/notes-generator",
    icon: BookOpen,
    badge: "Study Binders",
    category: "Study & Revision",
  },
  {
    title: "AI Quiz Generator",
    description:
      "Transform textbooks and lecture notes into interactive self-grading quizzes with explanations.",
    href: "/ai-workspace/quiz-generator",
    icon: HelpCircle,
    badge: "Interactive Scoring",
    category: "Study & Revision",
  },
  {
    title: "AI Flashcard Generator",
    description:
      "Produce active recall question-answer flashcard decks with 3D flip study and mastery tracking.",
    href: "/ai-workspace/flashcard-generator",
    icon: Layers,
    badge: "Active Recall",
    category: "Study & Revision",
  },
  {
    title: "AI Resume Assistant",
    description:
      "Audit your CV for executive impact, STAR-method metrics, and job description keyword alignment.",
    href: "/ai-workspace/resume-assistant",
    icon: Briefcase,
    badge: "Keyword Gap Audit",
    category: "Career & Professional",
  },
  {
    title: "AI Email Assistant",
    description:
      "Compose persuasive, polite corporate emails with 6 tone presets and ready-to-send workplace templates.",
    href: "/ai-workspace/email-assistant",
    icon: Mail,
    badge: "6 Tone Presets",
    category: "Writing & Editorial",
  },
  {
    title: "AI Text Rewriter",
    description:
      "Refactor rough drafts into polished executive prose, simplified plain English, or concise bullet points.",
    href: "/ai-workspace/text-rewriter",
    icon: FileEdit,
    badge: "Side-by-Side",
    category: "Writing & Editorial",
  },
  {
    title: "AI Grammar Checker",
    description:
      "Detect spelling, grammatical, and stylistic slips with interactive accept/reject suggestion cards.",
    href: "/ai-workspace/grammar-checker",
    icon: SpellCheck,
    badge: "Editorial Proofreader",
    category: "Writing & Editorial",
  },
  {
    title: "AI Explain Anything",
    description:
      "Deconstruct complex academic or technical topics with clear real-world analogies and step-by-step depth.",
    href: "/ai-workspace/explain-anything",
    icon: Lightbulb,
    badge: "3 Comprehension Levels",
    category: "Study & Revision",
  },
];

export function AiDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All",
    "Document & PDF",
    "Study & Revision",
    "Writing & Editorial",
    "Career & Professional",
  ];

  const filteredTools = AI_TOOLS.filter((tool) => {
    const matchesCat = selectedCategory === "All" || tool.category === selectedCategory;
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Centered Hero Banner */}
      <section className="relative overflow-hidden rounded-[24px] bg-[#171114] border border-white/10 p-6 sm:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-[#DC2626]/30 text-[#FB7185] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] shadow-sm animate-pulse" />
              <span>WorkOnline AI Intelligence Suite</span>
            </div>
            <AiStatusBadge />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Smarter Work.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185]">
              Accelerated with Genuine AI.
            </span>
          </h1>

          <p className="text-[#E2D4D6] text-xs sm:text-sm leading-relaxed max-w-2xl">
            Equip your study, research, and corporate workflows with grounded document chat, automatic summarization, instant quiz generation, and executive text refactoring powered by Google Gemini.
          </p>

          {/* Quick Search Capsule */}
          <div className="pt-2 max-w-lg">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find an AI tool (e.g. PDF Assistant, Quiz, Resume, Email)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.045] text-white placeholder-[#9E8E93] text-xs sm:text-sm border border-white/10 focus:outline-none focus:border-[#DC2626]/60 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Launch Shortcuts Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/ai-workspace/pdf-assistant"
          className="p-3.5 rounded-xl bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.07] transition-all group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-[#FB7185] transition-colors truncate">Chat with PDF</p>
            <p className="text-[10px] text-[#9E8E93]">Grounded citations</p>
          </div>
        </Link>

        <Link
          href="/ai-workspace/summarizer"
          className="p-3.5 rounded-xl bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.07] transition-all group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-[#FB7185] transition-colors truncate">Summarizer</p>
            <p className="text-[10px] text-[#9E8E93]">PDF, Word, or text</p>
          </div>
        </Link>

        <Link
          href="/ai-workspace/quiz-generator"
          className="p-3.5 rounded-xl bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.07] transition-all group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-[#FB7185] transition-colors truncate">Quiz Generator</p>
            <p className="text-[10px] text-[#9E8E93]">Interactive testing</p>
          </div>
        </Link>

        <Link
          href="/ai-workspace/resume-assistant"
          className="p-3.5 rounded-xl bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 hover:bg-white/[0.07] transition-all group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white group-hover:text-[#FB7185] transition-colors truncate">Resume Audit</p>
            <p className="text-[10px] text-[#9E8E93]">Gap analysis</p>
          </div>
        </Link>
      </div>

      {/* Directory Header & Categories */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-white">AI Productivity Directory</h2>
          <p className="text-xs text-[#9E8E93] mt-0.5">
            10 specialized AI instruments for academics and professionals
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#DC2626] text-white shadow-sm shadow-[#DC2626]/30"
                  : "bg-white/[0.045] text-[#E2D4D6] hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative rounded-[20px] bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 p-5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center group-hover:scale-105 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-[#FB7185] border border-[#DC2626]/30">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#FB7185] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-[#E2D4D6] mt-1.5 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#FB7185]">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Security & Grounding Policy Banner */}
      <div className="rounded-[20px] bg-[#171114] border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white">
              Grounded Knowledge & Secret Isolation
            </h3>
            <p className="text-xs text-[#9E8E93] max-w-2xl leading-relaxed">
              WorkOnline executes all model interactions through secure server-side API endpoints with strict prompt injection guardrails. Uploaded document chunks are treated as passive data, and no confidential documents are permanently retained or logged.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/[0.045] border border-white/10 text-[#FB7185]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#DC2626]" />
          Verified Grounding
        </div>
      </div>
    </div>
  );
}
