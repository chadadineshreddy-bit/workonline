import React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Users, ArrowRight } from "lucide-react";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

export default function AboutPage() {
  return (
    <div className="min-h-screen apple-canvas-bg relative overflow-hidden text-[#202124] pb-20">
      {/* Header Banner - Centered Floating Glass Canvas */}
      <div className="pt-8 pb-6 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative floating-glass-canvas p-8 sm:p-12 text-center overflow-hidden">
            <FloatingRedElements variant="subtle" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 text-[#F04452] border border-red-200/80 shadow-sm">
                <span className="w-2 h-2 rounded-full sphere-3d-red shadow-sm" />
                <span>About WorkOnline</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#202124] tracking-tight leading-tight">
                One platform. Every task. <br />
                <span className="bg-gradient-to-r from-[#F04452] via-[#FF737D] to-[#D72638] bg-clip-text text-transparent">
                  Simplified.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#777777] max-w-2xl mx-auto leading-relaxed">
                We are building the modern productivity standard for students and working professionals worldwide — uniting documents, calculators, career tools, and AI under one clean unified workspace.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass-card p-6 rounded-[24px] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-[#F04452] border border-red-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#202124] text-base">Privacy by Design</h3>
            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
              Files are converted in browser memory using WebAssembly and client APIs whenever possible. We never sell, store, or profile your personal files.
            </p>
          </div>

          <div className="liquid-glass-card p-6 rounded-[24px] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-[#F04452] border border-red-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#202124] text-base">Zero Bloatware</h3>
            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
              No bloated desktop software to install, no annoying popups, and no artificial page limits on basic utilities like merging and compressing.
            </p>
          </div>

          <div className="liquid-glass-card p-6 rounded-[24px] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-[#F04452] border border-red-500/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#202124] text-base">Dual-Focus Utility</h3>
            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
              Equally calibrated for university students calculating CGPA and attendance margins, to corporate professionals preparing executive resumes and invoices.
            </p>
          </div>
        </div>

        <div className="floating-glass-canvas p-8 sm:p-10 space-y-4 shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">Our Mission</h2>
          <p className="text-sm text-[#777777] leading-relaxed">
            Every day, millions of people juggle 10 different single-purpose websites filled with spam ads, deceptive download buttons, and paywalls just to convert a document or format an invoice.
          </p>
          <p className="text-sm text-[#777777] leading-relaxed">
            WorkOnline was built to eliminate this friction entirely: offering high-speed, reliable, commercial-grade tools with transparent privacy, modern aesthetics, and a trustworthy interface you can depend on daily.
          </p>
          <div className="pt-4 flex">
            <Link
              href="/tools"
              className="liquid-btn-primary text-xs sm:text-sm font-bold inline-flex items-center gap-2"
            >
              <span>Explore All 25+ Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
