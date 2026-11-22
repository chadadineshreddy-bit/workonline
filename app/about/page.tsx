import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Code2,
  Heart,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export const metadata = {
  title: "About WorkOnline — Designed & Engineered by Dinesh Reddy Chada",
  description:
    "Learn about WorkOnline: the unified, privacy-first productivity suite uniting 117+ tools and Google Gemini AI, created by Dinesh Reddy Chada.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen saas-canvas-bg relative overflow-hidden text-slate-900 dark:text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        
        {/* =========================================================================
            1. HERO BRAND BANNER
           ========================================================================= */}
        <div className="floating-glass-canvas p-8 sm:p-12 text-center rounded-[28px] space-y-5 shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-[#DC2626] dark:text-[#FB7185] border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
            <span>About WorkOnline</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            One Unified Platform. <br />
            <span className="bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
              Every Everyday Task.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-[#E2D4D6] max-w-2xl mx-auto leading-relaxed">
            WorkOnline was built to eliminate the chaos of juggling 15 different ad-heavy, fragmented websites just to convert a PDF, calculate college grades, generate a workplace invoice, or summarize study materials.
          </p>
        </div>

        {/* =========================================================================
            2. CREATOR & ARCHITECT SPOTLIGHT (Dinesh Reddy Chada)
           ========================================================================= */}
        <div className="liquid-glass-card rounded-[28px] p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
            {/* Avatar / Brand Emblem */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#DC2626] via-[#E11D48] to-[#B91C1C] text-white flex items-center justify-center p-3 shadow-[0_12px_32px_rgba(220,38,38,0.45)] border-2 border-white/20">
                <Image
                  src="/logo.png"
                  alt="WorkOnline Emblem"
                  width={64}
                  height={64}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DC2626] text-white shadow-md">
                Lead
              </span>
            </div>

            {/* Creator Bio & Vision */}
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-[#DC2626] dark:text-[#FB7185] border border-red-500/20">
                <Heart className="w-3 h-3 fill-[#DC2626]" />
                <span>Creator & Architect</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Made by Dinesh Reddy Chada
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#E2D4D6] leading-relaxed">
                WorkOnline is an end-to-end full-stack productivity ecosystem envisioned, designed, and engineered by <strong>Dinesh Reddy Chada</strong>.
              </p>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#E2D4D6] leading-relaxed">
                Created with the vision of providing students, developers, and working professionals with a completely free, privacy-first alternative to commercial paywalled tools. By combining high-speed browser client-side WebAssembly engines with serverless Google Gemini AI, WorkOnline ensures your files remain private, tasks finish in milliseconds, and real intelligence is always available with zero paywalls.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Free Forever</span>
                </div>
                <span className="text-slate-300 dark:text-white/20">•</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
                  <span>Client-Side Privacy</span>
                </div>
                <span className="text-slate-300 dark:text-white/20">•</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-white">
                  <Cpu className="w-4 h-4 text-[#FB7185]" />
                  <span>Gemini AI Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. THREE CORE PILLARS
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass-card p-6 rounded-[24px] shadow-sm space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Client-First Privacy</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9E8E93] leading-relaxed">
              Files are converted in browser memory using WebAssembly and client APIs. We never sell, store, or profile your personal files.
            </p>
          </div>

          <div className="liquid-glass-card p-6 rounded-[24px] shadow-sm space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Zero Bloatware or Ads</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9E8E93] leading-relaxed">
              No software installations, no intrusive popups, and no artificial page limits on tools like PDF merging, DOCX export, and compression.
            </p>
          </div>

          <div className="liquid-glass-card p-6 rounded-[24px] shadow-sm space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Live Gemini AI</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9E8E93] leading-relaxed">
              Genuine Google Gemini AI powering document summarization, PDF grounded question answering, quiz generation, and executive polishing.
            </p>
          </div>
        </div>

        {/* =========================================================================
            4. QUICK ACCESS BUTTONS
           ========================================================================= */}
        <div className="floating-glass-canvas p-6 sm:p-8 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Ready to explore your workspace?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9E8E93] mt-1">
              Access all 117+ tools, calculators, and AI features freely.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workspace"
              className="px-5 py-2.5 rounded-full liquid-btn-primary font-bold text-xs sm:text-sm shadow-md shadow-[#DC2626]/30 inline-flex items-center gap-2"
            >
              <span>Personal Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tools"
              className="px-4 py-2.5 rounded-full liquid-btn-secondary font-semibold text-xs sm:text-sm"
            >
              All Tools
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
