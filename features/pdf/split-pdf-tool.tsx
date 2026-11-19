"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors,
  Download,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Archive,
  Layers,
  FileText,
  Sliders,
  CheckCircle2
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { getPdfjs } from "@/lib/pdf/pdfjs-init";
import { validatePdfFile, getSafeFileName, parsePageRanges } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { PdfPageThumbnail } from "@/components/pdf/pdf-page-thumbnail";
import { PdfResultCard } from "@/components/pdf/pdf-result-card";

type SplitMode = "ranges" | "every-page" | "custom-select";

interface SplitResultFile {
  name: string;
  blob: Blob;
  size: number;
}

export function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Split Configuration
  const [splitMode, setSplitMode] = useState<SplitMode>("ranges");
  const [rangeInput, setRangeInput] = useState<string>("1-2");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  // Processing & Output
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputFiles, setOutputFiles] = useState<SplitResultFile[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [singlePdfUrl, setSinglePdfUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setError(null);
    setLoadingDoc(true);

    const val = await validatePdfFile(selectedFile, 50);
    if (!val.valid) {
      setError(val.error || "Invalid PDF file.");
      setLoadingDoc(false);
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfjs = await getPdfjs();
      const loadedPdf = await pdfjs.getDocument({ data: buffer }).promise;

      setFile(selectedFile);
      setPdfDocProxy(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      setRangeInput(`1-${Math.min(2, loadedPdf.numPages)}`);
      setSelectedPages(new Set([1]));
    } catch (err: any) {
      if (err?.name === "PasswordException") {
        setError("This PDF is password-protected. Please remove the password to split it.");
      } else {
        setError("Unable to read this PDF document. The file may be damaged or invalid.");
      }
    } finally {
      setLoadingDoc(false);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    const next = new Set(selectedPages);
    if (next.has(pageNum)) {
      if (next.size > 1) next.delete(pageNum);
    } else {
      next.add(pageNum);
    }
    setSelectedPages(next);
  };

  const handleExecuteSplit = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);

      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const results: SplitResultFile[] = [];

      if (splitMode === "every-page") {
        // Split every single page into its own PDF
        for (let i = 0; i < totalPages; i++) {
          const newDoc = await PDFDocument.create();
          const [copiedPage] = await newDoc.copyPages(sourcePdf, [i]);
          newDoc.addPage(copiedPage);

          const bytes = await newDoc.save({ useObjectStreams: true });
          const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
          results.push({
            name: getSafeFileName(file.name, `page-${i + 1}`, ".pdf"),
            blob,
            size: blob.size,
          });
        }
      } else if (splitMode === "custom-select") {
        // Extract selected pages as a combined document or individual
        const pagesToExtract = Array.from(selectedPages).sort((a, b) => a - b);
        if (pagesToExtract.length === 0) {
          setError("Please select at least one page to extract.");
          setIsProcessing(false);
          return;
        }

        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(
          sourcePdf,
          pagesToExtract.map((p) => p - 1)
        );
        copiedPages.forEach((page) => newDoc.addPage(page));

        const bytes = await newDoc.save({ useObjectStreams: true });
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        results.push({
          name: getSafeFileName(file.name, `extracted-pages`, ".pdf"),
          blob,
          size: blob.size,
        });
      } else {
        // Range Mode (e.g. 1-3, 5)
        const zeroIndexedPages = parsePageRanges(rangeInput, totalPages);
        if (zeroIndexedPages.length === 0) {
          setError(`Invalid page range. Please enter numbers between 1 and ${totalPages}.`);
          setIsProcessing(false);
          return;
        }

        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(sourcePdf, zeroIndexedPages);
        copiedPages.forEach((page) => newDoc.addPage(page));

        const bytes = await newDoc.save({ useObjectStreams: true });
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        results.push({
          name: getSafeFileName(file.name, `range-${rangeInput.replace(/[^0-9-]/g, "_")}`, ".pdf"),
          blob,
          size: blob.size,
        });
      }

      setOutputFiles(results);

      // If single file, create direct PDF download URL
      if (results.length === 1) {
        const url = URL.createObjectURL(results[0].blob);
        setSinglePdfUrl(url);
      }

      // If multiple files, create ZIP archive
      if (results.length > 1) {
        const zip = new JSZip();
        results.forEach((item) => {
          zip.file(item.name, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipDownloadUrl = URL.createObjectURL(zipBlob);
        setZipUrl(zipDownloadUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while splitting the document. Please check page numbers.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    if (singlePdfUrl) URL.revokeObjectURL(singlePdfUrl);
    setFile(null);
    setPdfDocProxy(null);
    setTotalPages(0);
    setOutputFiles([]);
    setZipUrl(null);
    setSinglePdfUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <PdfDropzone
          onFilesSelected={handleFileSelect}
          multiple={false}
          maxSizeMB={50}
          title="Drop PDF file to split, or click to browse"
          description="Upload any PDF to extract custom ranges, split every page, or download separate PDF files as a ZIP."
        />
      ) : (
        <div className="space-y-6">
          {/* Header document card */}
          <div className="relative p-5 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-xs text-[#9E8E93]">
                  {formatBytes(file.size)} • {totalPages} Total Pages
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-[#E2D4D6] hover:text-white hover:border-[#DC2626]/40 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Choose different PDF</span>
            </button>
          </div>

          {/* Split Mode Selector */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FB7185] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] shadow-[0_0_8px_#DC2626]" />
                Select Split Strategy
              </h4>
              <span className="text-xs text-[#9E8E93]">In-Browser Extraction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setSplitMode("ranges")}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  splitMode === "ranges"
                    ? "border-[#DC2626] bg-red-500/10 shadow-[0_0_24px_rgba(220,38,38,0.25)] ring-1 ring-[#DC2626]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="font-bold font-heading text-sm text-white">
                  Page Ranges
                </div>
                <div className="text-xs text-[#E2D4D6] mt-1.5 leading-relaxed">
                  Extract specific intervals (e.g. 1-3, 5).
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode("every-page")}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  splitMode === "every-page"
                    ? "border-[#DC2626] bg-red-500/10 shadow-[0_0_24px_rgba(220,38,38,0.25)] ring-1 ring-[#DC2626]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="font-bold font-heading text-sm text-white">
                  Split Every Page
                </div>
                <div className="text-xs text-[#E2D4D6] mt-1.5 leading-relaxed">
                  Create {totalPages} individual single-page files in a ZIP.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode("custom-select")}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  splitMode === "custom-select"
                    ? "border-[#DC2626] bg-red-500/10 shadow-[0_0_24px_rgba(220,38,38,0.25)] ring-1 ring-[#DC2626]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div className="font-bold font-heading text-sm text-white">
                  Thumbnail Selector
                </div>
                <div className="text-xs text-[#E2D4D6] mt-1.5 leading-relaxed">
                  Click thumbnails below to choose pages.
                </div>
              </button>
            </div>

            {/* Range Input box */}
            {splitMode === "ranges" && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#E2D4D6] mb-2">
                  Page Range Specification (Total Pages: {totalPages})
                </label>
                <div className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl liquid-glass-input text-white font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRangeInput(`1-${totalPages}`)}
                    className="px-4 py-2 text-xs liquid-glass-pill text-white hover:border-[#DC2626]/40 transition-colors"
                  >
                    All Pages
                  </button>
                </div>
                <p className="text-[11px] text-[#9E8E93] mt-1.5">
                  Use hyphens for ranges and commas for separate pages (e.g. &ldquo;1-3, 5, 8-10&rdquo;).
                </p>
              </div>
            )}

            {/* Split Action Button */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={handleExecuteSplit}
                disabled={isProcessing}
                className="liquid-btn-glass-crimson px-8 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Pages...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>
                      {splitMode === "every-page"
                        ? `Split Into ${totalPages} Files (ZIP)`
                        : "Split & Extract Document"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visual Thumbnails Grid (Rendered via PDF.js) */}
          {pdfDocProxy && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#9E8E93]">
                <span className="font-semibold uppercase tracking-wider">
                  Page Thumbnails ({totalPages} Total)
                </span>
                {splitMode === "custom-select" && (
                  <span className="text-[#FB7185] font-medium">
                    {selectedPages.size} pages selected for export
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PdfPageThumbnail
                      key={pageNum}
                      pdfDocument={pdfDocProxy}
                      pageNumber={pageNum}
                      isSelected={
                        splitMode === "custom-select"
                          ? selectedPages.has(pageNum)
                          : undefined
                      }
                      onToggleSelect={
                        splitMode === "custom-select" ? togglePageSelection : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-[#DC2626]/40 flex items-start gap-3 text-white text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-[#FB7185] shrink-0 mt-0.5" />
          <span className="text-[#E2D4D6]">{error}</span>
        </div>
      )}

      {/* Result Display: Single PDF */}
      {singlePdfUrl && outputFiles.length === 1 && (
        <PdfResultCard
          title="PDF Split Complete!"
          message={`Extracted pages successfully into a new document.`}
          fileName={outputFiles[0].name}
          fileSize={outputFiles[0].size}
          originalSize={file?.size}
          downloadUrl={singlePdfUrl}
          onReset={resetAll}
          actionLabel="Download Extracted PDF"
        />
      )}

      {/* Result Display: ZIP Archive with multiple files */}
      {zipUrl && outputFiles.length > 1 && (
        <div className="relative p-6 sm:p-8 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/30">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-white">
                ZIP Archive Ready ({outputFiles.length} PDF Documents)
              </h3>
              <p className="text-xs text-emerald-300 mt-0.5">
                Every page was separated into an individual PDF file and archived into a ZIP.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.035] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
              {file?.name.replace(/\.[^/.]+$/, "")}-split-pages.zip
            </span>
            <a
              href={zipUrl}
              download={`${file?.name.replace(/\.[^/.]+$/, "")}-split-pages.zip`}
              className="liquid-btn-glass-crimson px-6 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP Archive</span>
            </a>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-[#E2D4D6] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Split another document</span>
          </button>
        </div>
      )}
    </div>
  );
}
