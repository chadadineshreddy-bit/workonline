"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Printer,
  Download,
  RotateCcw,
  RefreshCw,
  FileText,
  AlertCircle,
  Menu,
  X
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { getPdfjs } from "@/lib/pdf/pdfjs-init";
import { validatePdfFile } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";

export function PdfPreviewTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    setError(null);
    setLoading(true);

    const val = await validatePdfFile(selectedFile, 50);
    if (!val.valid) {
      setError(val.error || "Invalid PDF file.");
      setLoading(false);
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const pdfjs = await getPdfjs();
      const loadedPdf = await pdfjs.getDocument({ data: buffer }).promise;

      setFile(selectedFile);
      setPdfDocProxy(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      setCurrentPage(1);
      setRotation(0);
      setScale(1.25);
    } catch (err: any) {
      if (err?.name === "PasswordException") {
        setError("This PDF is password-protected. Please enter an unprotected document.");
      } else {
        setError("Unable to render PDF. The file may be corrupt.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render the current page onto main canvas whenever currentPage, scale, or rotation changes
  useEffect(() => {
    let isCancelled = false;

    async function renderCurrentPage() {
      if (!pdfDocProxy || !mainCanvasRef.current) return;

      try {
        setLoading(true);
        const page = await pdfDocProxy.getPage(currentPage);

        if (isCancelled || !mainCanvasRef.current) return;

        const effectiveRotation = (page.rotate + rotation) % 360;
        const viewport = page.getViewport({ scale, rotation: effectiveRotation });

        const canvas = mainCanvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (!isCancelled) setLoading(false);
      } catch (err) {
        console.error("Error rendering main preview page:", err);
        if (!isCancelled) setLoading(false);
      }
    }

    renderCurrentPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDocProxy, currentPage, scale, rotation]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(2.5, prev + 0.25));
  const zoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.25));
  const fitWidth = () => setScale(1.0);
  const rotateClockwise = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadOriginal = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const resetAll = () => {
    setFile(null);
    setPdfDocProxy(null);
    setTotalPages(0);
    setCurrentPage(1);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <PdfDropzone
          onFilesSelected={handleFileSelect}
          multiple={false}
          maxSizeMB={50}
          title="Drop PDF file here to preview & inspect"
          description="High-definition in-browser PDF reader with zoom controls, thumbnail navigation, rotation, and print mode."
        />
      ) : (
        <div className="space-y-4">
          {/* Top Viewer Control Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm print:hidden">
            {/* Left Controls: Sidebar toggle & Page Jump */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`p-2 rounded-xl border transition-colors ${
                  showThumbnails
                    ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:border-blue-900"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
                title="Toggle thumbnails sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => handlePageChange(parseInt(e.target.value, 10) || 1)}
                    className="w-12 text-center py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-400">/ {totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Controls: Zoom & Rotate */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={zoomOut}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-semibold px-2 text-slate-700 dark:text-slate-300">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={rotateClockwise}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 ml-1"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right Controls: Print & Download */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Print Document"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF</span>
              </button>

              <button
                type="button"
                onClick={resetAll}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Close viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Viewer Work Area */}
          <div
            ref={containerRef}
            className="relative rounded-3xl bg-slate-200/60 dark:bg-slate-950 border border-slate-300/80 dark:border-slate-800 overflow-hidden flex min-h-[600px] max-h-[85vh]"
          >
            {/* Left Thumbnails Sidebar Drawer */}
            {showThumbnails && (
              <div className="w-48 sm:w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 space-y-3 z-10 print:hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Pages ({totalPages})</span>
                </div>

                <div className="space-y-3">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                      <div
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`p-2 rounded-xl cursor-pointer border text-center transition-all ${
                          isCurrent
                            ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/40"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Page {pageNum}
                        </span>
                        <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center text-xs text-slate-400">
                          {pageNum}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Document Canvas Viewport */}
            <div className="flex-1 overflow-auto p-6 sm:p-10 flex items-center justify-center">
              <div className="relative shadow-2xl rounded-lg bg-white overflow-hidden">
                <canvas ref={mainCanvasRef} className="block max-w-full h-auto" />

                {loading && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading page {currentPage}...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
