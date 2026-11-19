"use client";

import React, { useState } from "react";
import {
  FileImage,
  Download,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Plus,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { PDFDocument, PageSizes } from "pdf-lib";
import { validateImageFile, getSafeFileName } from "@/lib/pdf/pdf-utils";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { PdfResultCard } from "@/components/pdf/pdf-result-card";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
}

type Orientation = "portrait" | "landscape" | "auto";
type MarginSize = "none" | "small" | "large";

export function JpgToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<MarginSize>("none");
  const [isConverting, setIsConverting] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string | null>(null);
  const [outputPdfSize, setOutputPdfSize] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setError(null);
    const newItems: ImageItem[] = [];

    for (const file of files) {
      const val = validateImageFile(file, 25);
      if (!val.valid) {
        setError(val.error || `Invalid image: ${file.name}`);
        return;
      }

      const dataUrl = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        dataUrl,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setImages(next);
  };

  const removeImage = (id: string) => {
    const target = images.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.dataUrl);
    setImages(images.filter((i) => i.id !== id));
  };

  const executeJpgToPdf = async () => {
    if (images.length === 0) return;

    try {
      setIsConverting(true);
      setError(null);

      const pdfDoc = await PDFDocument.create();

      // Standard A4 dimensions in points: 595.28 x 841.89
      const a4Width = PageSizes.A4[0];
      const a4Height = PageSizes.A4[1];

      for (const item of images) {
        const fileBuffer = await item.file.arrayBuffer();
        let embeddedImage;

        // Determine if JPG or PNG or convert WebP/Canvas
        const lowerName = item.file.name.toLowerCase();
        if (lowerName.endsWith(".png") || item.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(fileBuffer);
        } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || item.file.type === "image/jpeg") {
          embeddedImage = await pdfDoc.embedJpg(fileBuffer);
        } else {
          // Fallback for WebP or other formats: render to canvas and convert to JPG bytes
          const img = new Image();
          img.src = item.dataUrl;
          await new Promise((res) => (img.onload = res));

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const jpgBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));
            const jpgBytes = await jpgBlob.arrayBuffer();
            embeddedImage = await pdfDoc.embedJpg(jpgBytes);
          } else {
            continue;
          }
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        // Page Orientation
        let pageWidth = a4Width;
        let pageHeight = a4Height;

        if (orientation === "landscape") {
          pageWidth = a4Height;
          pageHeight = a4Width;
        } else if (orientation === "auto") {
          if (imgWidth > imgHeight) {
            pageWidth = a4Height;
            pageHeight = a4Width;
          } else {
            pageWidth = a4Width;
            pageHeight = a4Height;
          }
        }

        // Margin calculation
        const marginPts = margin === "none" ? 0 : margin === "small" ? 20 : 40;
        const availableWidth = pageWidth - marginPts * 2;
        const availableHeight = pageHeight - marginPts * 2;

        // Fit image preserving aspect ratio
        const scaleFactor = Math.min(
          availableWidth / imgWidth,
          availableHeight / imgHeight
        );

        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;

        // Center on page
        const xPos = marginPts + (availableWidth - scaledWidth) / 2;
        const yPos = marginPts + (availableHeight - scaledHeight) / 2;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

      if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);

      const safeName = getSafeFileName(images[0].name, "converted", ".pdf");
      setOutputFileName(safeName);
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);
      setOutputPdfSize(blob.size);
    } catch (err: any) {
      console.error("JPG to PDF error:", err);
      setError("Failed to generate PDF from images. Please check image integrity.");
    } finally {
      setIsConverting(false);
    }
  };

  const resetAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.dataUrl));
    if (outputPdfUrl) URL.revokeObjectURL(outputPdfUrl);
    setImages([]);
    setOutputPdfUrl(null);
    setOutputPdfSize(0);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {images.length === 0 ? (
        <PdfDropzone
          onFilesSelected={handleFilesSelected}
          multiple={true}
          isImageMode={true}
          acceptTypes=".jpg,.jpeg,.png,.webp"
          maxSizeMB={25}
          title="Drop JPG, PNG, or WebP images here"
          description="Select multiple images to combine into a cleanly formatted, printable PDF booklet."
        />
      ) : (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <FileImage className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {images.length} {images.length === 1 ? "Image" : "Images"} Ready for PDF
                </h3>
                <p className="text-xs text-slate-400">
                  Arrange page order below or change orientation settings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Images</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Configuration Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PDF Layout & Margin Options
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      orientation === "portrait"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Portrait (A4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      orientation === "landscape"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation("auto")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      orientation === "auto"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Auto Match
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Page Margins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMargin("none")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      margin === "none"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    No Margin (Full Fit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMargin("small")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      margin === "small"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Small Margin
                  </button>
                  <button
                    type="button"
                    onClick={() => setMargin("large")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      margin === "large"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Booklet Margin
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={executeJpgToPdf}
                disabled={isConverting}
                className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all shadow-blue-500/20"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling PDF Document...</span>
                  </>
                ) : (
                  <>
                    <FileImage className="w-4 h-4" />
                    <span>Generate PDF Document Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visual Image Cards & Sequence Controller */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Page Sequence (Drag or use arrows to sort)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Page {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[140px] max-h-[170px]">
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="max-h-[160px] object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, "left")}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Move left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                      {formatBytes(item.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveImage(index, "right")}
                      disabled={index === images.length - 1}
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Move right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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

      {outputPdfUrl && (
        <PdfResultCard
          title="PDF Generated Successfully!"
          message={`Combined ${images.length} images into a standardized PDF.`}
          fileName={outputFileName}
          fileSize={outputPdfSize}
          downloadUrl={outputPdfUrl}
          onReset={resetAll}
          actionLabel="Download Converted PDF"
        />
      )}
    </div>
  );
}
