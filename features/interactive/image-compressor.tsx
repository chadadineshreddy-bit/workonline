"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Download,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FileCheck
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, or WebP).");
      return;
    }
    setFile(uploadedFile);
    setOriginalSize(uploadedFile.size);

    const objectUrl = URL.createObjectURL(uploadedFile);
    setOriginalUrl(objectUrl);
    compressImage(objectUrl, quality);
  };

  const compressImage = (imageSrc: string, targetQuality: number) => {
    setIsCompressing(true);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsCompressing(false);
        return;
      }
      ctx.drawImage(img, 0, 0);

      const mimeType = "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (compressedUrl) {
              URL.revokeObjectURL(compressedUrl);
            }
            const newUrl = URL.createObjectURL(blob);
            setCompressedUrl(newUrl);
            setCompressedSize(blob.size);
          }
          setIsCompressing(false);
        },
        mimeType,
        targetQuality / 100
      );
    };
  };

  // Re-run compression when slider changes
  useEffect(() => {
    if (originalUrl) {
      compressImage(originalUrl, quality);
    }
  }, [quality]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const percentReduction =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        /* Upload Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Choose an image or drag & drop here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Supports JPG, PNG, and WebP up to 20MB. Processed entirely in your browser.
          </p>
          <button
            type="button"
            className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20"
          >
            Browse files
          </button>
        </div>
      ) : (
        /* Active Processing & Result View */
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Original: {formatBytes(originalSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Replace file</span>
              </button>
            </div>
          </div>

          {/* Slider and Size Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Compression Quality Slider */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Compression Quality: {quality}%</span>
                </label>
                <span className="text-xs font-medium text-slate-400">
                  {quality > 80 ? "Light compression" : quality > 50 ? "Balanced" : "Maximum compression"}
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="95"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Smallest File (10%)</span>
                <span>Recommended (75%)</span>
                <span>Best Quality (95%)</span>
              </div>
            </div>

            {/* Savings KPI Card */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400">
                  Size Reduction
                </span>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  {percentReduction}% Saved
                </div>
                <div className="mt-2 text-xs text-emerald-800/80 dark:text-emerald-300/80 space-y-0.5">
                  <p>Original: <strong>{formatBytes(originalSize)}</strong></p>
                  <p>Compressed: <strong>{formatBytes(compressedSize)}</strong></p>
                </div>
              </div>

              {compressedUrl && (
                <a
                  href={compressedUrl}
                  download={`compressed-${file.name.replace(/\.[^/.]+$/, "")}.jpg`}
                  className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </a>
              )}
            </div>
          </div>

          {/* Image Preview */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Preview Result
            </h4>
            <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center min-h-[280px] max-h-[450px]">
              {compressedUrl && (
                <img
                  src={compressedUrl}
                  alt="Compressed preview"
                  className="max-h-[420px] max-w-full object-contain mx-auto"
                />
              )}
              {isCompressing && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Compressing image...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
