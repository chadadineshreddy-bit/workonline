"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Download,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Archive,
  CheckCircle2,
  Sliders,
  FileText
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import JSZip from "jszip";
import { getPdfjs } from "@/lib/pdf/pdfjs-init";
import { validatePdfFile, getSafeFileName, triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { PdfPageThumbnail } from "@/components/pdf/pdf-page-thumbnail";

interface ConvertedPage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  size: number;
  fileName: string;
}

export function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [resolutionScale, setResolutionScale] = useState<number>(1.5); // 1.5x gives crisp 150-200 DPI
  const [jpgQuality, setJpgQuality] = useState<number>(0.85);

  // Conversion State
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

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
      setConvertedPages([]);
    } catch (err: any) {
      if (err?.name === "PasswordException") {
        setError("This PDF is password-protected. Please unlock it before converting.");
      } else {
        setError("Could not read PDF document. The file may be corrupt.");
      }
    }
  };

  const executeConversion = async () => {
    if (!pdfDocProxy || !file) return;

    try {
      setIsConverting(true);
      setError(null);
      setProgress(5);
      const results: ConvertedPage[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDocProxy.getPage(pageNum);
        const viewport = page.getViewport({ scale: resolutionScale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Fill white background (otherwise transparent PDFs turn black in JPEG)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: ctx,
            viewport,
          }).promise;

          // Convert canvas to JPG blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (b) => resolve(b || new Blob()),
              "image/jpeg",
              jpgQuality
            );
          });

          const dataUrl = canvas.toDataURL("image/jpeg", jpgQuality);
          const pageFileName = getSafeFileName(file.name, `page-${pageNum}`, ".jpg");

          results.push({
            pageNumber: pageNum,
            dataUrl,
            blob,
            size: blob.size,
            fileName: pageFileName,
          });
        }

        setProgress(Math.round((pageNum / totalPages) * 100));
      }

      setConvertedPages(results);

      // Create ZIP archive for multiple pages
      if (results.length > 1) {
        const zip = new JSZip();
        results.forEach((item) => {
          zip.file(item.fileName, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        if (zipUrl) URL.revokeObjectURL(zipUrl);
        const newZipUrl = URL.createObjectURL(zipBlob);
        setZipUrl(newZipUrl);
      }
    } catch (err: any) {
      console.error("PDF to JPG conversion error:", err);
      setError("An error occurred while converting pages to JPG images.");
    } finally {
      setIsConverting(false);
    }
  };

  const resetAll = () => {
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setFile(null);
    setPdfDocProxy(null);
    setTotalPages(0);
    setConvertedPages([]);
    setZipUrl(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <PdfDropzone
          onFilesSelected={handleFileSelect}
          multiple={false}
          maxSizeMB={50}
          title="Drop PDF here to convert to JPG images"
          description="Renders high-resolution JPG images for every page. Download individually or as an all-in-one ZIP archive."
        />
      ) : (
        <div className="space-y-6">
          {/* Document Info Header */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {formatBytes(file.size)} • {totalPages} {totalPages === 1 ? "page" : "pages"} ready for extraction
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change PDF</span>
            </button>
          </div>

          {/* Conversion Options */}
          {convertedPages.length === 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Image Resolution & Quality
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Image Resolution
                  </label>
                  <select
                    value={resolutionScale}
                    onChange={(e) => setResolutionScale(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={1.0}>Standard (100 DPI - Faster)</option>
                    <option value={1.5}>High Definition (150 DPI - Recommended)</option>
                    <option value={2.0}>Ultra High DPI (300 DPI - Crisp Text)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    JPEG Compression Quality
                  </label>
                  <select
                    value={jpgQuality}
                    onChange={(e) => setJpgQuality(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={0.75}>Balanced (75% - Smaller file)</option>
                    <option value={0.85}>High Quality (85% - Recommended)</option>
                    <option value={0.95}>Maximum Quality (95% - Zero artifacts)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={executeConversion}
                  disabled={isConverting}
                  className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all shadow-blue-500/20"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Converting {progress}%...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Convert All {totalPages} Pages to JPG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Progress Bar when active */}
          {isConverting && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-center space-y-3">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-medium text-slate-500">
                Rendering canvas pages with PDF.js ({progress}% complete)...
              </p>
            </div>
          )}

          {/* Batch Download Header when converted */}
          {convertedPages.length > 0 && (
            <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {convertedPages.length} Pages Converted to JPG!
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Download individual high-res images below or grab the complete ZIP.
                  </p>
                </div>
              </div>

              {zipUrl && (
                <a
                  href={zipUrl}
                  download={`${file.name.replace(/\.[^/.]+$/, "")}-images.zip`}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all shadow-emerald-600/20 shrink-0"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </a>
              )}
            </div>
          )}

          {/* Converted Pages Gallery or PDF Thumbnails */}
          {convertedPages.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated High-Res JPG Images ({convertedPages.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {convertedPages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center min-h-[180px]">
                      <img
                        src={page.dataUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="max-h-[220px] object-contain"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                        Page {page.pageNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">
                        {formatBytes(page.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerBlobDownload(page.blob, page.fileName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JPG</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            pdfDocProxy && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Page Preview ({totalPages} Pages)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PdfPageThumbnail
                      key={i + 1}
                      pdfDocument={pdfDocProxy}
                      pageNumber={i + 1}
                    />
                  ))}
                </div>
              </div>
            )
          )}
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
