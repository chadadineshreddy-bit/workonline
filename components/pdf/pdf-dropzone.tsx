"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, AlertCircle, ShieldCheck, Zap, FileText } from "lucide-react";
import { validatePdfFile, validateImageFile } from "@/lib/pdf/pdf-utils";

interface PdfDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  acceptTypes?: string;
  maxSizeMB?: number;
  title?: string;
  description?: string;
  isImageMode?: boolean;
}

export function PdfDropzone({
  onFilesSelected,
  multiple = false,
  acceptTypes = ".pdf",
  maxSizeMB = 50,
  title = "Drop your PDF here, or browse files",
  description,
  isImageMode = false,
}: PdfDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultDescription = isImageMode
    ? `Supports high-resolution JPG, PNG, and WebP up to ${maxSizeMB}MB.`
    : `Supports genuine PDF documents up to ${maxSizeMB}MB. Safe browser-side processing.`;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (isImageMode) {
        const val = validateImageFile(file, maxSizeMB);
        if (!val.valid) {
          setErrorMessage(val.error || "Invalid image file format.");
          return;
        }
      } else {
        const val = await validatePdfFile(file, maxSizeMB);
        if (!val.valid) {
          setErrorMessage(val.error || "Invalid PDF document.");
          return;
        }
      }

      validFiles.push(file);
      if (!multiple) break;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`group relative rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
          isDragging
            ? "border-2 border-[#DC2626] bg-[#DC2626]/10 shadow-[0_0_35px_rgba(220,38,38,0.35)] scale-[1.01]"
            : "border-2 border-dashed border-white/15 hover:border-[#DC2626]/50 bg-white/[0.035] hover:bg-white/[0.055] shadow-xl"
        }`}
      >
        {/* Specular top glass reflection */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Floating Upload Icon with Ambient Red Core */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#DC2626]/20 to-[#B91C1C]/10 text-[#FB7185] border border-[#DC2626]/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(220,38,38,0.25)] group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(220,38,38,0.45)] group-hover:border-[#DC2626] transition-all duration-300">
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" />
        </div>

        <h3 className="text-lg sm:text-2xl font-bold font-heading text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#E2D4D6] mt-2 max-w-md mx-auto leading-relaxed">
          {description || defaultDescription}
        </p>

        {/* Button & Feature Pills */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            className="liquid-btn-glass-crimson px-7 py-3 text-xs sm:text-sm font-semibold tracking-tight shadow-lg"
          >
            {multiple ? "Browse Files to Add" : "Choose Document"}
          </button>
        </div>

        {/* Trust & Spec Chips */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-[#9E8E93]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Client-Side Privacy
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FB7185]" />
            Instant In-Browser Speed
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#E2D4D6]" />
            Up to {maxSizeMB}MB
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-[#DC2626]/40 flex items-start gap-3 text-white text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-[#FB7185] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-[#FB7185]">Upload validation notice:</span>{" "}
            <span className="text-[#E2D4D6]">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
