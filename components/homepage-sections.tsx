import React from "react";
import Link from "next/link";
import {
  FileText,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sliders,
} from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import {
  POPULAR_TOOLS,
  PDF_TOOLS,
  STUDENT_TOOLS,
  WORK_TOOLS,
  AI_TOOLS,
} from "@/lib/tools-data";

export function PopularToolsSection() {
  return (
    <section className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold liquid-glass-pill text-[#FB7185] border border-red-500/20 mb-2.5 shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Most Used by 40,000+ Users</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Popular Tools
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#E2D4D6] max-w-xl">
            The everyday utilities students and professionals reach for first.
          </p>
        </div>

        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#FB7185] group px-4 py-2 rounded-full liquid-glass-pill transition-all hover:border-[#DC2626]/40 shadow-xs"
        >
          <span>Explore all 50+ tools</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {POPULAR_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function PdfSection() {
  return (
    <section id="pdf" className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold liquid-glass-pill text-[#FB7185] border border-red-500/20 mb-2.5 shadow-xs">
            <FileText className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>PDF & Document Suite</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            PDF & Document Tools
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#E2D4D6] max-w-xl">
            Convert, merge, compress, split, and edit documents with client-side zero-leak security.
          </p>
        </div>

        <Link
          href="/tools?category=pdf"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#FB7185] group px-4 py-2 rounded-full liquid-glass-pill transition-all hover:border-[#DC2626]/40 shadow-xs"
        >
          <span>Filter PDF suite</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PDF_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function StudentSection() {
  return (
    <section id="student" className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold liquid-glass-pill text-[#FB7185] border border-red-500/20 mb-2.5 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Academic Utilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Student Zone
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#E2D4D6] max-w-xl">
            Calculate semester grades, track lecture attendance, and create active recall study flashcards.
          </p>
        </div>

        <Link
          href="/student-zone"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#FB7185] group px-4 py-2 rounded-full liquid-glass-pill transition-all hover:border-[#DC2626]/40 shadow-xs"
        >
          <span>Open Student Hub</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Student Zone Highlight Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl floating-glass-canvas flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC2626]">
            Student Productivity Suite
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
            WorkOnline Student Zone
          </h3>
          <p className="text-xs sm:text-sm text-[#E2D4D6] max-w-xl leading-relaxed">
            Credit-weighted CGPA/SGPA calculators, lecture attendance bunk planner, timetable generator, assignment trackers, and active recall flashcards.
          </p>
        </div>
        <Link
          href="/student-zone"
          className="liquid-btn-glass-crimson px-7 py-3 text-xs sm:text-sm font-semibold shrink-0 inline-flex items-center gap-2 shadow-lg"
        >
          <span>Launch Student Zone</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STUDENT_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function WorkSection() {
  return (
    <section id="work" className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold liquid-glass-pill text-[#FB7185] border border-red-500/20 mb-2.5 shadow-xs">
            <Briefcase className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Office & Career Tools</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Work Zone
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#E2D4D6] max-w-xl">
            Accelerate applications, draft polished correspondence, and create freelance invoices.
          </p>
        </div>

        <Link
          href="/tools?category=work"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#FB7185] group px-4 py-2 rounded-full liquid-glass-pill transition-all hover:border-[#DC2626]/40 shadow-xs"
        >
          <span>Explore Work tools</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Document Studio Highlight Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl floating-glass-canvas flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC2626]">
            Integrated Document Studio
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
            WorkOnline Document Studio
          </h3>
          <p className="text-xs sm:text-sm text-[#E2D4D6] max-w-xl leading-relaxed">
            Complete browser-based Word editor, 4-template ATS resume builder, cover letters, formal letters, invoices, and DOCX/PDF converters with zero server uploads.
          </p>
        </div>
        <Link
          href="/documents"
          className="liquid-btn-glass-crimson px-7 py-3 text-xs sm:text-sm font-semibold shrink-0 inline-flex items-center gap-2 shadow-lg"
        >
          <span>Launch Document Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORK_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function AiSection() {
  return (
    <section id="ai" className="py-12 sm:py-16 border-b border-white/10 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold liquid-glass-pill text-[#FB7185] border border-red-500/20 mb-2.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Next-Gen Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            AI Workspace
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#E2D4D6] max-w-xl">
            Advanced Google Gemini generative assistance for research, synthesis, and career advancement.
          </p>
        </div>

        <Link
          href="/ai-workspace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:text-[#FB7185] group px-4 py-2 rounded-full liquid-glass-pill transition-all hover:border-[#DC2626]/40 shadow-xs"
        >
          <span>Open AI Workspace</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function ValuePropsSection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#DC2626]">
          Engineered For Excellence
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading mt-1 tracking-tight text-white">
          Why Professionals Choose WorkOnline
        </h2>
        <p className="text-[#E2D4D6] text-xs sm:text-sm mt-2 leading-relaxed">
          No bloated installs, no sketchy redirects, and zero compromise on document privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-7 rounded-3xl liquid-glass-card shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] flex items-center justify-center text-white mb-5 shadow-[0_0_16px_rgba(220,38,38,0.45)] border border-white/20">
            <ShieldCheck className="w-6 h-6 drop-shadow" />
          </div>
          <h3 className="text-lg font-bold font-heading text-white tracking-tight">Client-First Privacy</h3>
          <p className="mt-2 text-xs text-[#E2D4D6] leading-relaxed">
            Your files and calculations process directly within your browser session whenever possible. We never sell your data or read your confidential documents.
          </p>
        </div>

        <div className="p-7 rounded-3xl liquid-glass-card shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] flex items-center justify-center text-white mb-5 shadow-[0_0_16px_rgba(220,38,38,0.45)] border border-white/20">
            <Zap className="w-6 h-6 drop-shadow" />
          </div>
          <h3 className="text-lg font-bold font-heading text-white tracking-tight">Lightning Fast Engine</h3>
          <p className="mt-2 text-xs text-[#E2D4D6] leading-relaxed">
            Optimized WASM and client-side compilation allow near-instant document conversions, calculations, and PDF generation without lag or server timeouts.
          </p>
        </div>

        <div className="p-7 rounded-3xl liquid-glass-card shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] flex items-center justify-center text-white mb-5 shadow-[0_0_16px_rgba(220,38,38,0.45)] border border-white/20">
            <Sliders className="w-6 h-6 drop-shadow" />
          </div>
          <h3 className="text-lg font-bold font-heading text-white tracking-tight">Unified Workspace</h3>
          <p className="mt-2 text-xs text-[#E2D4D6] leading-relaxed">
            Eliminate browser tab chaos. Switch effortlessly between academic GPA calculators, resume builders, and PDF compressors all under one clean interface.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AboutCreatorSection() {
  return (
    <section className="py-14 relative overflow-hidden border-t border-white/10">
      <div className="liquid-glass-card rounded-[28px] p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
          {/* Avatar emblem */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#DC2626] via-[#E11D48] to-[#B91C1C] text-white flex items-center justify-center p-2 shadow-[0_12px_32px_rgba(220,38,38,0.4)] border border-white/20 shrink-0 font-extrabold text-2xl tracking-wider">
            CD
          </div>

          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold liquid-glass-pill text-[#FB7185] border border-red-500/20">
              <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>About WorkOnline • Creator &amp; Lead Architect</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Made by Dinesh Reddy Chada
            </h3>

            <p className="text-xs sm:text-sm text-[#E2D4D6] leading-relaxed max-w-3xl">
              WorkOnline was designed, engineered, and brought to life by <strong>Dinesh Reddy Chada</strong> to provide students, professionals, and developers with a unified, privacy-first alternative to ad-filled, paywalled tool websites. With 117+ high-speed client-side tools, native Microsoft Word desktop document processing, and serverless Google Gemini AI, your files stay private while your productivity scales effortlessly.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-md transition-colors"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/documents/editor"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-colors"
              >
                <span>Launch Document Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
