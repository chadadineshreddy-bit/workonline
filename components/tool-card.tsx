import React from "react";
import Link from "next/link";
import { ToolItem } from "@/types/tools";
import { ToolIcon } from "@/components/ui/tool-icon";
import { ArrowRight, Sparkles } from "lucide-react";

interface ToolCardProps {
  tool: ToolItem;
  variant?: "default" | "compact" | "featured";
}

export function ToolCard({ tool }: ToolCardProps) {
  const isComingSoon = tool.status === "coming-soon";

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col justify-between p-5 rounded-2xl liquid-glass-card overflow-hidden"
    >
      {/* Specular top glass edge highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div>
        {/* Top bar with icon and category badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-[#DC2626] group-hover:to-[#B91C1C] group-hover:text-white group-hover:border-white/20 group-hover:shadow-[0_0_12px_rgba(220,38,38,0.4)] transition-all duration-300 shrink-0">
            <ToolIcon name={tool.iconName} className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isComingSoon ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-[#FB7185] border border-red-500/20">
                <Sparkles className="w-3 h-3" />
                Coming Soon
              </span>
            ) : tool.badge ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-[#FB7185] border border-white/10">
                {tool.badge}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-[#9E8E93] uppercase tracking-wider">
                {tool.categoryLabel}
              </span>
            )}
          </div>
        </div>

        {/* Title and Short Description */}
        <h3 className="text-sm font-bold font-heading text-white group-hover:text-[#FB7185] transition-colors tracking-tight">
          {tool.title}
        </h3>
        <p className="mt-1 text-xs text-[#9E8E93] leading-relaxed line-clamp-2">
          {tool.shortDescription}
        </p>
      </div>

      {/* Footer link / prompt */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#9E8E93] group-hover:text-[#DC2626]">
        <span className="transition-colors flex items-center gap-1">
          {isComingSoon ? "Preview feature" : "Open tool"}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[#9E8E93] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
