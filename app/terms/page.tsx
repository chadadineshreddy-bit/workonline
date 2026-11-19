import React from "react";
import { FileText } from "lucide-react";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

export default function TermsPage() {
  return (
    <div className="min-h-screen apple-canvas-bg relative overflow-hidden text-[#202124] pb-20">
      <div className="pt-8 pb-6 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative floating-glass-canvas p-8 sm:p-10 overflow-hidden">
            <FloatingRedElements variant="subtle" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 text-[#F04452] border border-red-200/80 mb-3 shadow-sm">
                <FileText className="w-3.5 h-3.5 text-[#F04452]" />
                <span>Legal Terms</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#202124] tracking-tight leading-tight">
                Terms of Service
              </h1>
              <p className="mt-2 text-sm text-[#777777]">
                Last modified: November 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        <div className="floating-glass-canvas p-8 sm:p-10 space-y-8 text-sm text-[#777777] leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using WorkOnline (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              2. Permitted Use & Ownership
            </h2>
            <p>
              WorkOnline grants you a personal, worldwide, non-assignable license to use the productivity tools for educational, personal, and lawful business operations. All converted documents, calculated spreadsheets, and exported PDFs remain your exclusive property.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              3. Service Availability & Disclaimers
            </h2>
            <p>
              The platform and utilities are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While we strive for 99.9% uptime and accurate calculation formulas (such as CGPA and attendance margins), users are advised to verify official university and tax regulations for their specific jurisdictions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              4. Modifications to Service
            </h2>
            <p>
              WorkOnline reserves the right to modify or discontinue any tool, feature, or service with reasonable advance notice where practical.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
