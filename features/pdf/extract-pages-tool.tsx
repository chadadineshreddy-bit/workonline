"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  FileText
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import { getPdfjs } from "@/lib/pdf/pdfjs-init";
import { validatePdfFile, getSafeFileName, parsePageRanges } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { PdfPageThumbnail } from "@/components/pdf/pdf-page-thumbnail";
import { PdfResultCard } from "@/components/pdf/pdf-result-card";

export function ExtractPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [customRangeText, setCustomRangeText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [outputPdfSize, setOutputPdfSize] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setError(null);

    const val = await validatePdfFile(selectedFile, 50);
    if (!val.valid) {
      setError(val.error || "Invalid PDF file.");
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfjs = await getPdfjs();
      const loadedPdf = await pdfjs.getDocument({ data: buffer }).promise;

      setFile(selectedFile);
      setPdfDocProxy(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      // Select first page by default
      setSelectedPages(new Set([1]));
      setCustomRangeText("1");
    } catch (err: any) {
      if (err?.name === "PasswordException") {
        setError("This PDF is password-protected. Please remove password first.");
      } else {
        setError("Unable to read PDF document. The file may be corrupt.");
      }
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    const next = new Set(selectedPages);
    if (next.has(pageNumber)) {
      if (next.size > 1) next.delete(pageNumber);
    } else {
      next.add(pageNumber);
    }
    setSelectedPages(next);
    updateRangeTextFromSet(next);
  };

  const selectAll = () => {
    const all = new Set(Array.from({ length: totalPages }, (_, i) => i + 1));
    setSelectedPages(all);
    setCustomRangeText(`1-${totalPages}`);
  };

  const selectOddPages = () => {
    const odds = new Set<number>();
    for (let i = 1; i <= totalPages; i += 2) odds.add(i);
    setSelectedPages(odds);
    updateRangeTextFromSet(odds);
  };

  const selectEvenPages = () => {
    const evens = new Set<number>();
    for (let i = 2; i <= totalPages; i += 2) evens.add(i);
    setSelectedPages(evens);
    updateRangeTextFromSet(evens);
  };

  const updateRangeTextFromSet = (set: Set<number>) => {
    const sorted = Array.from(set).sort((a, b) => a - b);
    setCustomRangeText(sorted.join(", "));
  };

  const applyCustomRange = () => {
    const parsed = parsePageRanges(customRangeText, totalPages);
    if (parsed.length === 0) {
      setError(`Invalid page range. Please use numbers between 1 and ${totalPages}.`);
      return;
    }
    setError(null);
    setSelectedPages(new Set(parsed.map((p) => p + 1))); // 1-indexed
  };

  const executeExtract = async () => {
    if (!file) return;

    if (selectedPages.size === 0) {
      setError("Please select at least one page to extract.");
      return;
    }

    try {
      setIsExtracting(true);
      setError(null);

      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      const zeroIndexed = sortedPages.map((p) => p - 1);

      const copiedPages = await newDoc.copyPages(srcDoc, zeroIndexed);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);

      const safeName = getSafeFileName(file.name, `extracted`, ".pdf");
      setOutputFileName(safeName);
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
      setOutputPdfSize(blob.size);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while extracting the selected pages.");
    } finally {
      setIsExtracting(false);
    }
  };

  const resetAll = () => {
    if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);
    setFile(null);
    setPdfDocProxy(null);
    setTotalPages(0);
    setSelectedPages(new Set());
    setOutputPdfUrl(null);
    setOutputPdfSize(0);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <PdfDropzone
          onFilesSelected={handleFileSelect}
          multiple={false}
          maxSizeMB={50}
          title="Drop PDF file here to extract pages"
          description="Select specific pages or input custom page ranges to compile a clean, standalone PDF document."
        />
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {totalPages} total pages • <strong className="text-blue-600">{selectedPages.size} pages selected for extraction</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose different PDF</span>
            </button>
          </div>

          {/* Quick Presets & Range Bar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">
                  Quick Select:
                </span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  All ({totalPages})
                </button>
                <button
                  type="button"
                  onClick={selectOddPages}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Odd Pages
                </button>
                <button
                  type="button"
                  onClick={selectEvenPages}
                  className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Even Pages
                </button>
              </div>

              <button
                type="button"
                onClick={executeExtract}
                disabled={isExtracting || selectedPages.size === 0}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-500/20"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Extract {selectedPages.size} Selected Pages</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Range Input */}
            <div className="pt-2 flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={customRangeText}
                onChange={(e) => setCustomRangeText(e.target.value)}
                placeholder="e.g. 1-3, 5, 8"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={applyCustomRange}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Apply Range
              </button>
            </div>
          </div>

          {/* Page Thumbnails Selector */}
          {pdfDocProxy && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Click any thumbnail to toggle page inclusion:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PdfPageThumbnail
                      key={pageNum}
                      pdfDocument={pdfDocProxy}
                      pageNumber={pageNum}
                      isSelected={selectedPages.has(pageNum)}
                      onToggleSelect={togglePageSelection}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {outputPdfUrl && (
        <PdfResultCard
          title="Pages Extracted Successfully!"
          message={`New document containing ${selectedPages.size} pages compiled.`}
          fileName={outputFileName}
          fileSize={outputPdfSize}
          originalSize={file?.size}
          downloadUrl={outputPdfUrl}
          onReset={resetAll}
          actionLabel="Download Extracted PDF"
        />
      )}
    </div>
  );
}
