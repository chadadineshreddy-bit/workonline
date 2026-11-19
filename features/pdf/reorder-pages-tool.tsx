"use client";

import React, { useState } from "react";
import {
  ArrowUpDown,
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
import { validatePdfFile, getSafeFileName } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { PdfPageThumbnail } from "@/components/pdf/pdf-page-thumbnail";
import { PdfResultCard } from "@/components/pdf/pdf-result-card";

export function ReorderPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]); // Array of original 1-indexed page numbers in new sequence
  const [isReordering, setIsReordering] = useState(false);
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
      // Initialize with natural order [1, 2, 3, ...]
      setPageOrder(Array.from({ length: loadedPdf.numPages }, (_, i) => i + 1));
    } catch (err: any) {
      if (err?.name === "PasswordException") {
        setError("This PDF is password-protected. Please remove the password first.");
      } else {
        setError("Unable to read PDF document. The file may be corrupt.");
      }
    }
  };

  const movePageInOrder = (currentIndex: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pageOrder.length) return;

    const nextOrder = [...pageOrder];
    const [moved] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(targetIndex, 0, moved);
    setPageOrder(nextOrder);
  };

  const reverseOrder = () => {
    setPageOrder([...pageOrder].reverse());
  };

  const resetOrder = () => {
    setPageOrder(Array.from({ length: totalPages }, (_, i) => i + 1));
  };

  const executeReorder = async () => {
    if (!file) return;

    try {
      setIsReordering(true);
      setError(null);

      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      // Convert 1-indexed pageOrder to 0-indexed indices for pdf-lib copyPages
      const zeroIndexedIndices = pageOrder.map((p) => p - 1);
      const copiedPages = await newDoc.copyPages(srcDoc, zeroIndexedIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);

      const safeName = getSafeFileName(file.name, `reordered`, ".pdf");
      setOutputFileName(safeName);
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
      setOutputPdfSize(blob.size);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while compiling the reordered PDF.");
    } finally {
      setIsReordering(false);
    }
  };

  const resetAll = () => {
    if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);
    setFile(null);
    setPdfDocProxy(null);
    setTotalPages(0);
    setPageOrder([]);
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
          title="Drop PDF file here to reorder pages"
          description="Visually rearrange page order with drag and directional controls. Download your newly organized PDF in seconds."
        />
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <ArrowUpDown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {formatBytes(file.size)} • {totalPages} {totalPages === 1 ? "page" : "pages"}
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

          {/* Quick Order Actions Toolbar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reverseOrder}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Reverse Order (Last to First)
              </button>
              <button
                type="button"
                onClick={resetOrder}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Reset Original
              </button>
            </div>

            <button
              type="button"
              onClick={executeReorder}
              disabled={isReordering}
              className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all shadow-blue-500/20"
            >
              {isReordering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reorganizing Document...</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Save New Page Order</span>
                </>
              )}
            </button>
          </div>

          {/* Reorderable Thumbnails Grid */}
          {pdfDocProxy && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Sequence (Use Left/Right arrows on cards to move):
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {pageOrder.map((origPageNum, slotIndex) => {
                  return (
                    <div key={`${origPageNum}-${slotIndex}`} className="relative">
                      <div className="absolute top-2 right-2 z-10 text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded shadow">
                        Pos #{slotIndex + 1}
                      </div>

                      <PdfPageThumbnail
                        pdfDocument={pdfDocProxy}
                        pageNumber={origPageNum}
                        showReorderControl={true}
                        isFirst={slotIndex === 0}
                        isLast={slotIndex === pageOrder.length - 1}
                        onMoveLeft={() => movePageInOrder(slotIndex, "left")}
                        onMoveRight={() => movePageInOrder(slotIndex, "right")}
                      />
                    </div>
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
          title="PDF Reordered Successfully!"
          message={`Your pages have been saved in the new custom order.`}
          fileName={outputFileName}
          fileSize={outputPdfSize}
          originalSize={file?.size}
          downloadUrl={outputPdfUrl}
          onReset={resetAll}
          actionLabel="Download Reordered PDF"
        />
      )}
    </div>
  );
}
