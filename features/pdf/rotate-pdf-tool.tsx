"use client";

import React, { useState } from "react";
import {
  RotateCw,
  Download,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  FileText
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { PDFDocument, degrees } from "pdf-lib";
import { getPdfjs } from "@/lib/pdf/pdfjs-init";
import { validatePdfFile, getSafeFileName } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { PdfPageThumbnail } from "@/components/pdf/pdf-page-thumbnail";
import { PdfResultCard } from "@/components/pdf/pdf-result-card";

export function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
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
      setRotations({});
    } catch (err: any) {
      if (err?.name === "PasswordException") {
        setError("This PDF is password-protected. Please remove encryption first.");
      } else {
        setError("Unable to read PDF document. The file may be damaged.");
      }
    }
  };

  const rotatePage = (pageNumber: number) => {
    setRotations((prev) => {
      const current = prev[pageNumber] || 0;
      const nextAngle = (current + 90) % 360;
      return { ...prev, [pageNumber]: nextAngle };
    });
  };

  const rotateAllPages = (angle: number) => {
    setRotations((prev) => {
      const updated: Record<number, number> = {};
      for (let i = 1; i <= totalPages; i++) {
        const current = prev[i] || 0;
        updated[i] = (current + angle) % 360;
      }
      return updated;
    });
  };

  const resetRotations = () => {
    setRotations({});
  };

  const executeSaveRotatedPdf = async () => {
    if (!file) return;

    try {
      setIsSaving(true);
      setError(null);

      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        const pageNum = index + 1;
        const additionalRotation = rotations[pageNum] || 0;
        if (additionalRotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + additionalRotation) % 360));
        }
      });

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);

      const safeName = getSafeFileName(file.name, "rotated", ".pdf");
      setOutputFileName(safeName);
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
      setOutputPdfSize(blob.size);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while saving the rotated PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetAll = () => {
    if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);
    setFile(null);
    setPdfDocProxy(null);
    setTotalPages(0);
    setRotations({});
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
          title="Drop PDF file here to rotate pages"
          description="Rotate all pages or individual pages 90°, 180°, or 270° clockwise with permanent orientation saving."
        />
      ) : (
        <div className="space-y-6">
          {/* Header document card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <RotateCw className="w-5 h-5" />
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

          {/* Bulk Rotation Controls Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">
                Rotate All:
              </span>
              <button
                type="button"
                onClick={() => rotateAllPages(90)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3 text-blue-600" />
                <span>+90° All</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAllPages(180)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3 text-blue-600" />
                <span>+180° All</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAllPages(270)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3 text-blue-600" />
                <span>+270° All</span>
              </button>
              <button
                type="button"
                onClick={resetRotations}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Reset
              </button>
            </div>

            <button
              type="button"
              onClick={executeSaveRotatedPdf}
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all shadow-blue-500/20"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying Rotation...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>Save & Download PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Pages Thumbnails Grid */}
          {pdfDocProxy && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Click any page or thumbnail button to rotate individual pages:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PdfPageThumbnail
                      key={pageNum}
                      pdfDocument={pdfDocProxy}
                      pageNumber={pageNum}
                      rotation={rotations[pageNum] || 0}
                      onRotate={rotatePage}
                      showRotateControl={true}
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
          title="PDF Rotated Successfully!"
          message="Your page rotations have been applied and permanently saved."
          fileName={outputFileName}
          fileSize={outputPdfSize}
          downloadUrl={outputPdfUrl}
          onReset={resetAll}
          actionLabel="Download Rotated PDF"
        />
      )}
    </div>
  );
}
