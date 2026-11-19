"use client";

import React from "react";
import { Download, CheckCircle2, RotateCcw, FileText, ArrowRight } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface PdfResultCardProps {
  title?: string;
  message?: string;
  fileName: string;
  fileSize: number;
  originalSize?: number;
  downloadUrl: string;
  onReset: () => void;
  actionLabel?: string;
}

export function PdfResultCard({
  title = "PDF Processed Successfully!",
  message = "Your document is ready to download.",
  fileName,
  fileSize,
  originalSize,
  downloadUrl,
  onReset,
  actionLabel = "Download PDF",
}: PdfResultCardProps) {
  const percentSaved =
    originalSize && originalSize > fileSize
      ? Math.round(((originalSize - fileSize) / originalSize) * 100)
    : null;

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-6 overflow-hidden">
      {/* Specular sheen highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-white">
              {title}
            </h3>
            <p className="text-xs text-[#E2D4D6] mt-0.5">
              {message}
            </p>
          </div>
        </div>

        {percentSaved !== null && percentSaved > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold self-start sm:self-auto shadow-sm">
            <span>🎉 {percentSaved}% Size Reduction Achieved!</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.035] border border-white/10 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.35)] border border-white/20">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {fileName}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#9E8E93] mt-0.5">
              <span>Ready: <strong className="text-white">{formatBytes(fileSize)}</strong></span>
              {originalSize && (
                <>
                  <span>•</span>
                  <span>Original: {formatBytes(originalSize)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <a
          href={downloadUrl}
          download={fileName}
          className="liquid-btn-glass-crimson px-6 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{actionLabel}</span>
        </a>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-[#E2D4D6] hover:text-white font-medium hover:underline transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Process another document</span>
        </button>

        <span className="text-[#9E8E93] text-[11px]">
          100% Client-Side Privacy Guaranteed
        </span>
      </div>
    </div>
  );
}
