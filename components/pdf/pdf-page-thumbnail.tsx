"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  RotateCw,
  Trash2,
  Check,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from "lucide-react";

interface PdfPageThumbnailProps {
  pdfDocument: any; // PDFDocumentProxy from PDF.js
  pageNumber: number; // 1-indexed
  rotation?: number; // 0, 90, 180, 270
  isSelected?: boolean;
  onToggleSelect?: (pageNumber: number) => void;
  onRotate?: (pageNumber: number) => void;
  onDelete?: (pageNumber: number) => void;
  onMoveLeft?: (pageNumber: number) => void;
  onMoveRight?: (pageNumber: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
  isMarkedForDeletion?: boolean;
  scale?: number;
  showRotateControl?: boolean;
  showDeleteControl?: boolean;
  showReorderControl?: boolean;
}

export function PdfPageThumbnail({
  pdfDocument,
  pageNumber,
  rotation = 0,
  isSelected = false,
  onToggleSelect,
  onRotate,
  onDelete,
  onMoveLeft,
  onMoveRight,
  isFirst = false,
  isLast = false,
  isMarkedForDeletion = false,
  scale = 0.35,
  showRotateControl = false,
  showDeleteControl = false,
  showReorderControl = false,
}: PdfPageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDocument || !canvasRef.current) return;
      try {
        setLoading(true);
        setRenderError(false);
        const page = await pdfDocument.getPage(pageNumber);

        if (isCancelled || !canvasRef.current) return;

        // Apply page default rotation + custom rotation
        const effectiveRotation = (page.rotate + rotation) % 360;
        const viewport = page.getViewport({ scale, rotation: effectiveRotation });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        if (!isCancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error rendering thumbnail page ${pageNumber}:`, err);
        if (!isCancelled) {
          setRenderError(true);
          setLoading(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDocument, pageNumber, rotation, scale]);

  return (
    <div
      onClick={() => onToggleSelect && onToggleSelect(pageNumber)}
      className={`group relative flex flex-col rounded-2xl bg-white/[0.045] backdrop-blur-xl border transition-all duration-200 overflow-hidden shadow-md ${
        isMarkedForDeletion
          ? "border-red-500/60 bg-red-950/30 opacity-60"
          : isSelected
          ? "border-[#DC2626] ring-2 ring-[#DC2626]/40 bg-red-500/10 shadow-[0_0_20px_rgba(220,38,38,0.35)]"
          : "border-white/12 hover:border-[#DC2626]/40 hover:bg-white/[0.07] hover:shadow-lg"
      } ${onToggleSelect ? "cursor-pointer" : ""}`}
    >
      {/* Top action header badge */}
      <div className="px-3 py-2 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-xs">
        <span className="font-bold font-heading text-white">
          Page {pageNumber}
        </span>

        {/* Checkbox indicator */}
        {onToggleSelect && (
          <div
            className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white shadow-xs"
                : "border border-white/20 bg-white/5"
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        )}

        {isMarkedForDeletion && (
          <span className="text-[10px] font-bold text-[#FB7185] bg-red-500/20 px-1.5 py-0.5 rounded">
            Delete
          </span>
        )}
      </div>

      {/* Canvas Thumbnail Area */}
      <div className="relative p-3 flex items-center justify-center min-h-[160px] max-h-[220px] bg-black/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="shadow-sm rounded border border-white/15 max-w-full max-h-[190px] object-contain transition-transform"
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-[#FB7185]" />
          </div>
        )}

        {renderError && (
          <div className="text-center p-2 text-xs text-[#9E8E93]">
            Page {pageNumber}
          </div>
        )}

        {rotation !== 0 && (
          <span className="absolute bottom-2 right-2 text-[10px] bg-[#171114]/90 border border-white/15 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
            {rotation}°
          </span>
        )}
      </div>

      {/* Bottom Tool Controls (Rotate, Delete, Reorder) */}
      {(showRotateControl || showDeleteControl || showReorderControl) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-2 py-1.5 bg-white/[0.03] border-t border-white/10 flex items-center justify-around text-xs"
        >
          {showReorderControl && onMoveLeft && (
            <button
              type="button"
              onClick={() => onMoveLeft(pageNumber)}
              disabled={isFirst}
              className="p-1 text-[#9E8E93] hover:text-white disabled:opacity-20 hover:bg-white/10 rounded transition-colors"
              title="Move left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {showRotateControl && onRotate && (
            <button
              type="button"
              onClick={() => onRotate(pageNumber)}
              className="p-1 text-[#9E8E93] hover:text-[#FB7185] hover:bg-white/10 rounded transition-colors"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {showDeleteControl && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(pageNumber)}
              className={`p-1 rounded transition-colors ${
                isMarkedForDeletion
                  ? "text-[#FB7185] bg-red-500/20"
                  : "text-[#9E8E93] hover:text-[#FB7185] hover:bg-white/10"
              }`}
              title={isMarkedForDeletion ? "Restore page" : "Mark page for deletion"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {showReorderControl && onMoveRight && (
            <button
              type="button"
              onClick={() => onMoveRight(pageNumber)}
              disabled={isLast}
              className="p-1 text-[#9E8E93] hover:text-white disabled:opacity-20 hover:bg-white/10 rounded transition-colors"
              title="Move right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
