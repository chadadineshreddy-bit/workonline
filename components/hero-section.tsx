"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Layers,
  GraduationCap,
  Briefcase,
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
  Compass,
} from "lucide-react";
import { ALL_TOOLS } from "@/lib/tools-data";
import { ToolIcon } from "@/components/ui/tool-icon";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  // Filter tools based on query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickShortcuts = [
    { label: "Merge PDF", slug: "merge-pdf" },
    { label: "PDF to Word", slug: "pdf-to-word" },
    { label: "Resume Builder", slug: "resume-builder" },
    { label: "CGPA Calculator", slug: "cgpa-calculator" },
    { label: "Word Editor", slug: "word-editor" },
  ];

  return (
    <section className="relative overflow-hidden space-y-8">
      {/* Top Banner Hero Card */}
      <div className="relative z-10">
        <div className="floating-glass-canvas p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          {/* Subtle top specular glass highlight */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto space-y-5 relative z-10">
            {/* Tagline Pill Badge with Official Logo */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 liquid-glass-pill text-xs font-semibold text-[#FB7185] border border-[#DC2626]/30">
              <Image src="/logo.png" alt="WorkOnline" width={16} height={16} className="w-4 h-4 object-contain" />
              <span>WorkOnline • 100% Free Workspace</span>
            </div>

            {/* Main Heading with Crimson Gradient Highlights */}
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Everything You Need to <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185]">
                Work Smarter, 100% Free.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#E2D4D6] max-w-2xl mx-auto leading-relaxed font-sans">
              Convert, edit, compress, and organize your documents effortlessly with WorkOnline.
            </p>

            {/* Hero Call-To-Action Glass Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/tools"
                className="liquid-btn-glass-crimson px-7 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xl shadow-red-600/30 hover:scale-105 transition-transform"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>Explore All Tools</span>
                <ArrowRight className="w-4 h-4 text-white ml-0.5" />
              </Link>

              <Link
                href="/workspace"
                className="liquid-btn-secondary px-7 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg hover:border-red-500/40 hover:scale-105 transition-transform"
              >
                <Sparkles className="w-4 h-4 text-[#FB7185]" />
                <span>Open Free Workspace</span>
              </Link>
            </div>

            {/* Quick Search Capsule */}
            <div className="relative max-w-2xl mx-auto mt-10">
              <form onSubmit={handleSearchSubmit} className="relative z-20">
                <div
                  className={`relative flex items-center rounded-full bg-[#171114]/90 backdrop-blur-2xl border p-1.5 sm:p-2 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.12)] ${
                    isFocused
                      ? "border-[#DC2626] ring-4 ring-[#DC2626]/20 shadow-[0_0_35px_rgba(220,38,38,0.4)]"
                      : "border-white/15 hover:border-white/25"
                  }`}
                >
                  <div className="pl-3.5 sm:pl-4 text-[#9E8E93] shrink-0">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Search 50+ PDF, student, office, and AI tools..."
                    className="search-input w-full py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm bg-transparent border-0 text-white placeholder-white/45 focus:outline-none focus:ring-0 font-medium"
                  />
                  <button
                    type="submit"
                    className="liquid-btn-glass-crimson px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 shadow-lg shadow-red-600/30"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Live Autocomplete Dropdown */}
              {isFocused && filteredTools.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 elevated-panel shadow-2xl z-30 overflow-hidden text-left divide-y divide-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
                  {filteredTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      className="flex items-center gap-3.5 px-4 py-3 hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 text-[#DC2626] flex items-center justify-center border border-red-500/20 shrink-0">
                        <ToolIcon name={tool.iconName} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FB7185] transition-colors">
                            {tool.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#FB7185] border border-red-500/20">
                            {tool.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#9E8E93] truncate">
                          {tool.shortDescription}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#9E8E93] group-hover:text-[#DC2626] transition-colors" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Popular Tool Shortcuts */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-[#9E8E93] font-semibold text-[11px] uppercase tracking-wider mr-1">
                  Trending:
                </span>
                {quickShortcuts.map((sc) => (
                  <Link
                    key={sc.slug}
                    href={`/tools/${sc.slug}`}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#DC2626]/40 text-[#E2D4D6] hover:text-white transition-all font-medium text-xs shadow-xs"
                  >
                    {sc.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Hub Grid inside Floating Container */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Fast PDF Suite */}
              <div className="p-5 rounded-2xl liquid-glass-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#FB7185] bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                      PDF Suite
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    Document Processing
                  </h4>
                  <p className="text-xs text-[#9E8E93] mt-1 leading-relaxed">
                    Merge, compress, split, and convert documents directly in the browser with high-DPI fidelity.
                  </p>
                </div>
                <Link
                  href="/tools?category=pdf"
                  className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#DC2626] font-semibold hover:text-[#FB7185] transition-colors"
                >
                  <span>8 Core Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 2: Academic & Student Suite */}
              <div className="p-5 rounded-2xl liquid-glass-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#FB7185] bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                      Academics
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    Student Zone
                  </h4>
                  <p className="text-xs text-[#9E8E93] mt-1 leading-relaxed">
                    Calculate CGPA/SGPA, predict attendance margins, organize study schedules, and build flashcards.
                  </p>
                </div>
                <Link
                  href="/student-zone"
                  className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#DC2626] font-semibold hover:text-[#FB7185] transition-colors"
                >
                  <span>SGPA / CGPA Ready</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 3: Professional Office Suite */}
              <div className="p-5 rounded-2xl liquid-glass-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#FB7185] bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                      Workplace
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    Work Zone & AI
                  </h4>
                  <p className="text-xs text-[#9E8E93] mt-1 leading-relaxed">
                    Draft professional emails, create invoices, generate meeting minutes, and query documents with AI.
                  </p>
                </div>
                <Link
                  href="/work-zone"
                  className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#DC2626] font-semibold hover:text-[#FB7185] transition-colors"
                >
                  <span>Productivity Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
