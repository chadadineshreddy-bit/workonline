"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  FileText,
  GraduationCap,
  Briefcase,
  Sparkles,
  Sliders,
  Flame,
  Clock,
  Layers,
} from "lucide-react";
import { ALL_TOOLS } from "@/lib/tools-data";
import { ToolCard } from "@/components/tool-card";

function ToolsDirectoryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [filterView, setFilterView] = useState<"all" | "popular" | "recent">("all");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const categories: { id: string; label: string; icon: any; count: number }[] = [
    {
      id: "all",
      label: "All Tools",
      icon: Layers,
      count: ALL_TOOLS.length,
    },
    {
      id: "pdf",
      label: "PDF & Docs",
      icon: FileText,
      count: ALL_TOOLS.filter((t) => t.category === "pdf").length,
    },
    {
      id: "student",
      label: "Student Zone",
      icon: GraduationCap,
      count: ALL_TOOLS.filter((t) => t.category === "student").length,
    },
    {
      id: "work",
      label: "Work Zone",
      icon: Briefcase,
      count: ALL_TOOLS.filter((t) => t.category === "work").length,
    },
    {
      id: "ai",
      label: "AI Workspace",
      icon: Sparkles,
      count: ALL_TOOLS.filter((t) => t.category === "ai").length,
    },
    {
      id: "image",
      label: "Image Tools",
      icon: Sliders,
      count: ALL_TOOLS.filter((t) => t.category === "image").length,
    },
  ];

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      // Category filter
      if (activeCategory !== "all" && tool.category !== activeCategory) {
        return false;
      }

      // Quick filter
      if (filterView === "popular" && !tool.isPopular) {
        return false;
      }
      if (filterView === "recent" && tool.status === "coming-soon") {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = tool.title.toLowerCase().includes(query);
        const matchesDesc = tool.shortDescription.toLowerCase().includes(query);
        const matchesCat = tool.categoryLabel.toLowerCase().includes(query);
        const matchesFeatures = tool.features?.some((f) =>
          f.toLowerCase().includes(query)
        );
        return matchesTitle || matchesDesc || matchesCat || matchesFeatures;
      }

      return true;
    });
  }, [activeCategory, filterView, searchQuery]);

  return (
    <div className="space-y-6 text-white">
      {/* Directory Hero Banner */}
      <div className="floating-glass-canvas p-6 sm:p-10 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold liquid-glass-pill text-[#FB7185] border border-red-500/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] shadow-[0_0_8px_#DC2626]" />
            <span>Full Productivity Directory</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            WorkOnline{" "}
            <span className="bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
              Tools Catalog.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#E2D4D6] leading-relaxed">
            Browse our complete library of 50+ browser-based utilities for PDF editing, student calculations, workplace documents, and AI tools.
          </p>
        </div>

        {/* Search bar inside header */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E8E93]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, action (e.g. merge, compress, cgpa)..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl liquid-glass-input text-white placeholder-[#9E8E93] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E8E93] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Views: All / Popular / Recently added */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.045] border border-slate-200 dark:border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterView("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterView === "all"
                  ? "bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white shadow-xs"
                  : "text-slate-600 dark:text-[#9E8E93] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterView("popular")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterView === "popular"
                  ? "bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white shadow-xs"
                  : "text-slate-600 dark:text-[#9E8E93] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${filterView === "popular" ? "text-amber-300 fill-amber-300/30" : "text-[#DC2626]"}`} />
              <span>Popular</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterView("recent")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterView === "recent"
                  ? "bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white shadow-xs"
                  : "text-slate-600 dark:text-[#9E8E93] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${filterView === "recent" ? "text-white" : "text-slate-400 dark:text-[#9E8E93]"}`} />
              <span>Recent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Main Grid */}
      <div className="space-y-4">
        {/* Horizontal Category Nav */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#DC2626]/20 text-white border border-[#DC2626]/40 shadow-xs"
                    : "bg-white/[0.045] hover:bg-white/[0.08] text-[#E2D4D6] hover:text-white border border-white/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#DC2626]" : "text-[#9E8E93]"}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    isActive
                      ? "bg-red-500/20 text-[#FB7185]"
                      : "bg-white/5 text-[#9E8E93]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status / Results Count */}
        <div className="flex items-center justify-between text-xs text-[#9E8E93] px-1">
          <span>
            Showing <strong className="text-white">{filteredTools.length}</strong>{" "}
            {filteredTools.length === 1 ? "tool" : "tools"}
            {activeCategory !== "all" && ` in ${categories.find((c) => c.id === activeCategory)?.label}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          {(searchQuery || activeCategory !== "all" || filterView !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setFilterView("all");
              }}
              className="text-[#DC2626] hover:underline flex items-center gap-1 font-bold"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 rounded-2xl liquid-glass-card max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">No tools match your search</h3>
            <p className="text-xs text-[#9E8E93] mt-1.5 max-w-xs mx-auto leading-relaxed">
              We couldn&apos;t find any tool matching &quot;{searchQuery}&quot;. Try adjusting your keywords or clearing category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setFilterView("all");
              }}
              className="mt-4 liquid-btn-primary px-4 py-2 text-xs font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ToolsDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#9E8E93]">
          Loading tools catalog...
        </div>
      }
    >
      <ToolsDirectoryContent />
    </Suspense>
  );
}
