"use client";

import React, { useState } from "react";
import {
  Trash2,
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

export function DeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
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
      setDeletedPages(new Set());
    } catch (err: any) {
      if (err?.name === "PasswordException") {
        setError("This PDF is password-protected. Please unlock it before deleting pages.");
      } else {
        setError("Unable to read PDF document. The file may be corrupt.");
      }
    }
  };

  const togglePageDeletion = (pageNumber: number) => {
    const next = new Set(deletedPages);
    if (next.has(pageNumber)) {
      next.delete(pageNumber);
    } else {
      // Don't allow selecting all pages
      if (next.size >= totalPages - 1) {
        setError("A PDF document must retain at least one page. You cannot delete all pages.");
        return;
      }
      setError(null);
      next.add(pageNumber);
    }
    setDeletedPages(next);
  };

  const executeDelete = async () => {
    if (!file) return;

    if (deletedPages.size === 0) {
      setError("Please click on at least one page thumbnail to select it for deletion.");
      return;
    }

    if (deletedPages.size >= totalPages) {
      setError("Cannot delete all pages. At least one page must remain in the document.");
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      // Collect 0-indexed page indices that are KEPT
      const pagesToKeep: number[] = [];
      for (let i = 1; i <= totalPages; i++) {
        if (!deletedPages.has(i)) {
          pagesToKeep.push(i - 1);
        }
      }

      const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeep);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);

      const safeName = getSafeFileName(file.name, `pages-removed`, ".pdf");
      setOutputFileName(safeName);
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
      setOutputPdfSize(blob.size);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while deleting the selected pages.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetAll = () => {
    if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);
    setFile(null);
    setPdfDocProxy(null);
    setTotalPages(0);
    setDeletedPages(new Set());
    setOutputPdfUrl(null);
    setOutputPdfSize(0);
    setError(null);
  };

  const remainingPagesCount = totalPages - deletedPages.size;

  return (
    <div className="space-y-6">
      {!file ? (
        <PdfDropzone
          onFilesSelected={handleFileSelect}
          multiple={false}
          maxSizeMB={50}
          title="Drop PDF here to remove unwanted pages"
          description="Click any page thumbnail to mark it for deletion. Export a clean PDF with unwanted sheets removed."
        />
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {totalPages} total pages •{" "}
                  <span className="text-rose-600 font-semibold">{deletedPages.size} marked for deletion</span> •{" "}
                  <span className="text-emerald-600 font-semibold">{remainingPagesCount} pages will remain</span>
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

          {/* Action Toolbar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Click on any thumbnail to mark or unmark it for removal.</span>
              {deletedPages.size > 0 && (
                <button
                  type="button"
                  onClick={() => setDeletedPages(new Set())}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Unmark all
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={executeDelete}
              disabled={isDeleting || deletedPages.size === 0}
              className="px-7 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all shadow-rose-600/20"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Removing Pages...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>
                    Delete {deletedPages.size} {deletedPages.size === 1 ? "Page" : "Pages"} & Download
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Page Thumbnails */}
          {pdfDocProxy && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Pages to Delete ({totalPages} Pages)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isMarked = deletedPages.has(pageNum);
                  return (
                    <PdfPageThumbnail
                      key={pageNum}
                      pdfDocument={pdfDocProxy}
                      pageNumber={pageNum}
                      isMarkedForDeletion={isMarked}
                      onDelete={togglePageDeletion}
                      onToggleSelect={togglePageDeletion}
                      showDeleteControl={true}
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
          title="Pages Deleted Successfully!"
          message={`Removed ${deletedPages.size} pages. New document contains ${remainingPagesCount} pages.`}
          fileName={outputFileName}
          fileSize={outputPdfSize}
          originalSize={file?.size}
          downloadUrl={outputPdfUrl}
          onReset={resetAll}
          actionLabel="Download Cleaned PDF"
        />
      )}
    </div>
  );
}
