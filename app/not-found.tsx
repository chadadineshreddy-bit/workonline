import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Compass } from "lucide-react";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] apple-canvas-bg flex items-center justify-center px-4 py-16 relative overflow-hidden text-[#202124]">
      <FloatingRedElements variant="subtle" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10 floating-glass-canvas p-8 sm:p-10 shadow-2xl">
        <div className="w-20 h-20 mx-auto relative drop-shadow-[0_0_24px_rgba(220,38,38,0.55)]">
          <Image
            src="/logo.png"
            alt="WorkOnline Logo"
            width={80}
            height={80}
            priority
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F04452]">
            404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
            The page or productivity tool you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="liquid-btn-primary text-xs font-bold inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/tools"
            className="liquid-btn-secondary text-xs font-bold inline-flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#F04452]" />
            <span>Browse All Tools</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/60">
          <p className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider mb-3">
            Popular Workspaces:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/tools?category=pdf"
              className="text-xs px-3 py-1 rounded-full liquid-glass-pill text-[#202124] hover:text-[#F04452] transition-colors"
            >
              PDF Tools
            </Link>
            <Link
              href="/documents"
              className="text-xs px-3 py-1 rounded-full liquid-glass-pill text-[#202124] hover:text-[#F04452] transition-colors"
            >
              Document Studio
            </Link>
            <Link
              href="/student-zone"
              className="text-xs px-3 py-1 rounded-full liquid-glass-pill text-[#202124] hover:text-[#F04452] transition-colors"
            >
              Student Zone
            </Link>
            <Link
              href="/work-zone"
              className="text-xs px-3 py-1 rounded-full liquid-glass-pill text-[#202124] hover:text-[#F04452] transition-colors"
            >
              Work Zone
            </Link>
            <Link
              href="/ai-workspace"
              className="text-xs px-3 py-1 rounded-full liquid-glass-pill text-[#202124] hover:text-[#F04452] transition-colors"
            >
              AI Workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
