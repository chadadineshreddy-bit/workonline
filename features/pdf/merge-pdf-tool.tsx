"use client";

import React, { useState } from "react";
import {
  Layers,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  Plus,
  FileText
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import { validatePdfFile, getSafeFileName, triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { PdfResultCard } from "@/components/pdf/pdf-result-card";

interface PdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

export function MergePdfTool() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>("workonline-merged-document.pdf");
  const [error, setError] = useState<string | null>(null);
  const [readingPages, setReadingPages] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    setError(null);
    setReadingPages(true);

    const loadedItems: PdfItem[] = [];

    for (const file of newFiles) {
      // 1. Validate signature & size
      const val = await validatePdfFile(file, 50);
      if (!val.valid) {
        setError(val.error || `Invalid PDF: ${file.name}`);
        setReadingPages(false);
        return;
      }

      // 2. Read page count and check if password-protected
      let pageCount = 0;
      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
        pageCount = doc.getPageCount();
      } catch (err: any) {
        if (err?.message?.includes("encrypted") || err?.message?.includes("password")) {
          setError(`File "${file.name}" is password-protected. Please unlock it before merging.`);
          setReadingPages(false);
          return;
        }
        setError(`Unable to parse "${file.name}". The document may be corrupted.`);
        setReadingPages(false);
        return;
      }

      loadedItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        pageCount,
      });
    }

    setItems((prev) => [...prev, ...loadedItems]);
    setReadingPages(false);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const executeMerge = async () => {
    if (items.length < 2) {
      setError("Please add at least 2 PDF documents to merge.");
      return;
    }

    try {
      setIsMerging(true);
      setError(null);

      const mergedPdf = await PDFDocument.create();

      for (const item of items) {
        const fileBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }

      const safeName = getSafeFileName(items[0].name, "merged", ".pdf");
      setOutputFileName(safeName);
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      setMergedSize(blob.size);
    } catch (err: any) {
      console.error(err);
      setError("An unexpected error occurred while merging PDF files. Please verify that files are valid and unencrypted.");
    } finally {
      setIsMerging(false);
    }
  };

  const resetAll = () => {
    if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    setItems([]);
    setMergedPdfUrl(null);
    setMergedSize(0);
    setError(null);
  };

  const totalInputSize = items.reduce((sum, i) => sum + i.size, 0);
  const totalInputPages = items.reduce((sum, i) => sum + (i.pageCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {items.length === 0 ? (
        <PdfDropzone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          maxSizeMB={50}
          title="Drop PDF files here to merge, or click to browse"
          description="Select 2 or more PDF documents. You can rearrange their exact sequence before merging."
        />
      ) : (
        /* Selected Files List & Merge Controller */
        <div className="space-y-6">
          <div className="relative rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden">
            {/* Top specular reflection */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-white/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-white">
                    {items.length} PDF Documents Ready to Merge
                  </h3>
                  <p className="text-xs text-[#9E8E93]">
                    Total: {totalInputPages} pages • {formatBytes(totalInputSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-white hover:border-[#DC2626]/40 transition-all">
                  <Plus className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Add More PDFs</span>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={resetAll}
                  className="px-3 py-1.5 text-xs text-[#9E8E93] hover:text-[#FB7185] transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Reorderable List */}
            <div className="divide-y divide-white/5">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#DC2626]/20 border border-[#DC2626]/40 text-[#FB7185] text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#9E8E93]">
                        {formatBytes(item.size)} • {item.pageCount || 1} {item.pageCount === 1 ? "page" : "pages"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 text-[#9E8E93] hover:text-white disabled:opacity-20 rounded-lg hover:bg-white/10 transition-colors"
                      title="Move earlier in merge order"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className="p-1.5 text-[#9E8E93] hover:text-white disabled:opacity-20 rounded-lg hover:bg-white/10 transition-colors"
                      title="Move later in merge order"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-[#9E8E93] hover:text-[#FB7185] rounded-lg hover:bg-red-500/10 ml-1 transition-colors"
                      title="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Merge Trigger */}
            <div className="p-4 sm:p-5 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#9E8E93]">
                Pages will combine strictly in the numbered order displayed above.
              </span>
              <button
                type="button"
                onClick={executeMerge}
                disabled={isMerging || items.length < 2 || readingPages}
                className="w-full sm:w-auto liquid-btn-glass-crimson px-7 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
              >
                {isMerging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Combining Pages...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Merge {items.length} Documents Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-[#DC2626]/40 flex items-start gap-3 text-white text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-[#FB7185] shrink-0 mt-0.5" />
          <span className="text-[#E2D4D6]">{error}</span>
        </div>
      )}

      {/* Merged Success Result */}
      {mergedPdfUrl && (
        <PdfResultCard
          title="PDFs Merged Successfully!"
          message={`Combined ${items.length} files (${totalInputPages} total pages) into one document.`}
          fileName={outputFileName}
          fileSize={mergedSize}
          downloadUrl={mergedPdfUrl}
          onReset={resetAll}
          actionLabel="Download Merged PDF"
        />
      )}
    </div>
  );
}
