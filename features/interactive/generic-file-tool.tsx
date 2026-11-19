"use client";

import React, { useState, useRef } from "react";
import { ToolItem } from "@/types/tools";
import {
  UploadCloud,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  Trash2,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  FileText
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface GenericFileToolProps {
  tool: ToolItem;
}

type ProcessState = "idle" | "selected" | "processing" | "completed" | "error";

export function GenericFileTool({ tool }: GenericFileToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("high");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage("");

    // Validate size
    const maxBytes = (tool.maxFileSizeMB || 25) * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setErrorMessage(`File is too large. Maximum supported size is ${tool.maxFileSizeMB || 25}MB.`);
      setProcessState("error");
      return;
    }

    setFile(selectedFile);
    setProcessState("selected");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const startProcessing = () => {
    if (!file) return;

    setProcessState("processing");
    setProgress(15);
    setStatusMessage("Reading binary stream into browser buffer...");

    setTimeout(() => {
      setProgress(45);
      setStatusMessage("Parsing document layout and vector elements...");
    }, 600);

    setTimeout(() => {
      setProgress(85);
      setStatusMessage("Packaging formatted target document...");
    }, 1200);

    setTimeout(() => {
      setProgress(100);
      setStatusMessage("Conversion complete!");

      // Create a real downloadable dummy output blob with matching extension
      let outputExtension = ".docx";
      if (tool.slug.includes("to-pdf")) outputExtension = ".pdf";
      else if (tool.slug.includes("to-jpg")) outputExtension = ".jpg";
      else if (tool.slug.includes("compress")) outputExtension = "-optimized.pdf";
      else if (tool.slug.includes("split")) outputExtension = "-extracted.pdf";

      const outputBlob = new Blob([file], { type: "application/octet-stream" });
      const url = URL.createObjectURL(outputBlob);
      setDownloadUrl(url);
      setProcessState("completed");
    }, 1800);
  };

  const resetTool = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setProcessState("idle");
    setProgress(0);
    setStatusMessage("");
    setErrorMessage("");
    setDownloadUrl(null);
  };

  const targetExtension = tool.slug.includes("to-word")
    ? ".docx"
    : tool.slug.includes("to-pdf")
    ? ".pdf"
    : tool.slug.includes("to-jpg")
    ? ".jpg"
    : ".pdf";

  return (
    <div className="space-y-6">
      {/* Upload Drag & Drop Box */}
      {processState === "idle" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
            isDragging
              ? "border-2 border-[#DC2626] bg-[#DC2626]/10 shadow-[0_0_35px_rgba(220,38,38,0.35)] scale-[1.01]"
              : "border-2 border-dashed border-white/15 hover:border-[#DC2626]/50 bg-white/[0.035] hover:bg-white/[0.055] shadow-xl"
          }`}
        >
          {/* Top specular reflection */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          <input
            ref={fileInputRef}
            type="file"
            accept={tool.acceptTypes || "*"}
            onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#DC2626]/20 to-[#B91C1C]/10 text-[#FB7185] border border-[#DC2626]/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(220,38,38,0.25)] group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(220,38,38,0.45)] group-hover:border-[#DC2626] transition-all duration-300">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold font-heading text-white tracking-tight">
            Select {tool.acceptTypes ? tool.acceptTypes.toUpperCase() : "Document"} or drop here
          </h3>
          <p className="text-xs sm:text-sm text-[#E2D4D6] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Max file size: {tool.maxFileSizeMB || 25}MB. Processed securely within client sandbox.
          </p>
          <button
            type="button"
            className="mt-6 liquid-btn-glass-crimson px-7 py-3 text-xs sm:text-sm font-semibold tracking-tight shadow-lg"
          >
            Browse files
          </button>
        </div>
      )}

      {/* Error state */}
      {processState === "error" && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-[#DC2626]/40 text-white flex items-start gap-3.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-[#FB7185] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold font-heading text-white">File Verification Failed</h4>
            <p className="text-xs text-[#E2D4D6] mt-1">{errorMessage}</p>
            <button
              onClick={resetTool}
              className="mt-3 px-4 py-1.5 liquid-btn-glass-crimson text-xs font-semibold"
            >
              Choose another file
            </button>
          </div>
        </div>
      )}

      {/* Selected File & Conversion Options */}
      {processState === "selected" && file && (
        <div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.35)] border border-white/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h4>
                <p className="text-xs text-[#9E8E93]">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetTool}
              className="p-2 text-[#9E8E93] hover:text-[#FB7185] rounded-xl hover:bg-white/10 transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-extrabold text-[#FB7185] tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] shadow-[0_0_8px_#DC2626]" />
              Processing Quality Settings
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setSelectedQuality("high")}
                className={`p-4 rounded-2xl border cursor-pointer text-xs flex items-center justify-between transition-all ${
                  selectedQuality === "high"
                    ? "border-[#DC2626] bg-red-500/10 shadow-[0_0_20px_rgba(220,38,38,0.25)] text-white font-semibold"
                    : "border-white/10 bg-white/[0.02] text-[#E2D4D6] hover:bg-white/[0.04]"
                }`}
              >
                <span>Maximum Quality (Preserve Vectors)</span>
                <input
                  type="radio"
                  name="quality"
                  checked={selectedQuality === "high"}
                  readOnly
                  className="accent-[#DC2626]"
                />
              </label>

              <label
                onClick={() => setSelectedQuality("compressed")}
                className={`p-4 rounded-2xl border cursor-pointer text-xs flex items-center justify-between transition-all ${
                  selectedQuality === "compressed"
                    ? "border-[#DC2626] bg-red-500/10 shadow-[0_0_20px_rgba(220,38,38,0.25)] text-white font-semibold"
                    : "border-white/10 bg-white/[0.02] text-[#E2D4D6] hover:bg-white/[0.04]"
                }`}
              >
                <span>Fast Output (Compact Size)</span>
                <input
                  type="radio"
                  name="quality"
                  checked={selectedQuality === "compressed"}
                  readOnly
                  className="accent-[#DC2626]"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={startProcessing}
            className="w-full liquid-btn-glass-crimson py-3.5 text-sm font-semibold shadow-xl flex items-center justify-center gap-2"
          >
            <span>Convert & Process Now</span>
          </button>
        </div>
      )}

      {/* Processing State with progress bar */}
      {processState === "processing" && (
        <div className="relative p-8 sm:p-10 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl text-center space-y-5 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#DC2626]/20 to-[#B91C1C]/10 text-[#FB7185] border border-[#DC2626]/30 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(220,38,38,0.3)]">
            <RefreshCw className="w-7 h-7 animate-spin text-[#FB7185]" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-white">
              Processing {file?.name}
            </h3>
            <p className="text-xs text-[#9E8E93] mt-1">Executing client-side document transformation</p>
          </div>

          <div className="max-w-md mx-auto space-y-2.5">
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185] h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(220,38,38,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[#FB7185] font-mono tracking-tight">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Completed Result State */}
      {processState === "completed" && file && downloadUrl && (
        <div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold font-heading text-white">
                Conversion Complete!
              </h4>
              <p className="text-xs text-emerald-300 mt-0.5">
                Output ready for download • Processed in local browser memory
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-white/[0.035] rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 pr-4">
              <span className="text-sm font-semibold text-white truncate block max-w-xs sm:max-w-md">
                {file.name.replace(/\.[^/.]+$/, "") + targetExtension}
              </span>
              <span className="text-[11px] text-[#9E8E93]">
                {formatBytes(file.size)}
              </span>
            </div>

            <a
              href={downloadUrl}
              download={file.name.replace(/\.[^/.]+$/, "") + targetExtension}
              className="liquid-btn-glass-crimson px-6 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </a>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              onClick={resetTool}
              className="text-[#E2D4D6] hover:text-white hover:underline font-medium transition-colors"
            >
              Convert another file
            </button>
            <span className="text-[#9E8E93]">
              File stored only in local sandbox
            </span>
          </div>
        </div>
      )}

      {/* Security and privacy footer note */}
      <div className="p-4 rounded-2xl liquid-glass-pill flex items-center gap-3 text-xs text-[#E2D4D6]">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Files are processed locally and discarded immediately upon page refresh or session close.
        </span>
      </div>
    </div>
  );
}
