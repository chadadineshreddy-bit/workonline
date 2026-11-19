"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PenTool,
  RotateCcw,
  Trash2,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Info,
  ChevronRight,
  FileCheck2,
  Palette,
  Sliders,
  Type,
  Maximize2
} from "lucide-react";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  color: string;
  width: number;
  points: StrokePoint[];
}

const PEN_COLORS = [
  { label: "Classic Black", value: "#0f172a" },
  { label: "Corporate Blue", value: "#1d4ed8" },
  { label: "Deep Navy", value: "#091e42" },
  { label: "Executive Indigo", value: "#312e81" }
];

const STROKE_WIDTHS = [
  { label: "Fine", value: 2 },
  { label: "Regular", value: 3 },
  { label: "Medium", value: 5 },
  { label: "Bold", value: 7 }
];

const CURSIVE_FONTS = [
  { name: "Signature Classic", font: "'Brush Script MT', cursive" },
  { name: "Modern Flow", font: "'Segoe Script', cursive" },
  { name: "Executive Script", font: "cursive, 'Lucida Handwriting'" }
];

export function SignatureSuite() {
  const [mode, setMode] = useState<"draw" | "type">("draw");

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#0f172a");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [canvasBg, setCanvasBg] = useState<"transparent" | "white">("transparent");

  // Typed signature state
  const [typedName, setTypedName] = useState("Alex Harrison");
  const [selectedFont, setSelectedFont] = useState(CURSIVE_FONTS[0].font);
  const [typedFontSize, setTypedFontSize] = useState(48);

  const [copied, setCopied] = useState(false);
  const [hasDrawnContent, setHasDrawnContent] = useState(false);

  // Redraw canvas whenever strokes or currentStroke change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mode === "draw") {
      const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
      setHasDrawnContent(allStrokes.length > 0);

      allStrokes.forEach((stroke) => {
        if (stroke.points.length === 0) return;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.points.length === 1) {
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.color;
          ctx.fill();
        } else {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      });
    } else {
      // Draw typed signature
      setHasDrawnContent(typedName.trim().length > 0);
      if (typedName.trim().length > 0) {
        ctx.fillStyle = penColor;
        ctx.font = `italic ${typedFontSize}px ${selectedFont}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      }
    }
  }, [strokes, currentStroke, mode, typedName, selectedFont, typedFontSize, penColor]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Coordinate helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.x) * scaleX,
      y: (clientY - rect.y) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    if ("touches" in e && e.touches.length > 1) return; // ignore multi-touch
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    setCurrentStroke({
      color: penColor,
      width: strokeWidth,
      points: [coords]
    });
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || mode !== "draw") return;
    const coords = getCanvasCoords(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, coords]
      };
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing || mode !== "draw") return;
    setIsDrawing(false);
    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const undoLastStroke = () => {
    if (strokes.length === 0) return;
    setStrokes((prev) => prev.slice(0, -1));
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke(null);
    if (mode === "type") setTypedName("");
  };

  // Export as PNG (transparent)
  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      triggerBlobDownload(blob, "workonline_signature.png");
    }, "image/png");
  };

  // Export as JPG (white background)
  const downloadJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an offscreen canvas with white background
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      triggerBlobDownload(blob, "workonline_signature.jpg");
    }, "image/jpeg", 0.95);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      }, "image/png");
    } catch {
      alert("Direct clipboard image copying is not supported in this browser. Please use the Download PNG button.");
    }
  };

  return (
    <div className="text-white space-y-8/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[#777777]">
          <Link href="/" className="hover:text-[#F04452] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/work-zone" className="hover:text-[#F04452] transition-colors">
            Work Zone
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#202124] font-medium">Digital Signature</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <PenTool className="w-7 h-7 text-[#F04452]" />
              Digital Signature Tool
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Draw or generate clean, transparent electronic signatures for workplace contracts, approvals, and documents.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl w-fit">
            <button
              onClick={() => setMode("draw")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === "draw"
                  ? "bg-white text-[#D72638] shadow-sm"
                  : "text-[#777777] hover:text-[#202124]"
              }`}
            >
              Draw Freehand
            </button>
            <button
              onClick={() => setMode("type")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                mode === "type"
                  ? "bg-white text-[#D72638] shadow-sm"
                  : "text-[#777777] hover:text-[#202124]"
              }`}
            >
              Type Signature
            </button>
          </div>
        </div>

        {/* Canvas & Controls Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Drawing Area (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="liquid-glass-card rounded-2xl/80 p-4 sm:p-6 shadow-sm">
              {/* Canvas header controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#202124]">Preview Background:</span>
                  <button
                    onClick={() => setCanvasBg("transparent")}
                    className={`px-2.5 py-1 rounded text-xs font-medium border ${
                      canvasBg === "transparent"
                        ? "bg-red-500/10 border-[#F04452]/30 text-[#D72638]"
                        : "bg-white border-white/80 text-[#777777]"
                    }`}
                  >
                    Checkerboard (Transparent)
                  </button>
                  <button
                    onClick={() => setCanvasBg("white")}
                    className={`px-2.5 py-1 rounded text-xs font-medium border ${
                      canvasBg === "white"
                        ? "bg-red-500/10 border-[#F04452]/30 text-[#D72638]"
                        : "bg-white border-white/80 text-[#777777]"
                    }`}
                  >
                    Pure White
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {mode === "draw" && (
                    <button
                      onClick={undoLastStroke}
                      disabled={strokes.length === 0}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/80 hover:bg-white/20 text-[#202124] disabled:opacity-40 text-xs font-medium transition-colors"
                      title="Undo last stroke"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Undo
                    </button>
                  )}
                  <button
                    onClick={clearCanvas}
                    disabled={!hasDrawnContent}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40 text-xs font-medium transition-colors"
                    title="Clear canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              {/* The Canvas Box */}
              <div
                className={`relative w-full rounded-xl border-2 border-dashed border-white/80 overflow-hidden select-none touch-none ${
                  canvasBg === "transparent"
                    ? "bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] bg-white/30"
                    : "bg-white"
                }`}
                style={{ height: "300px" }}
              >
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={320}
                  className="w-full h-full cursor-crosshair block"
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  onTouchCancel={handlePointerUp}
                />

                {/* Subtle Baseline indicator */}
                <div className="pointer-events-none absolute bottom-12 left-8 right-8 border-b border-white/80/60 flex justify-end">
                  <span className="text-[10px] text-[#777777] select-none pb-0.5">Signature Line</span>
                </div>

                {!hasDrawnContent && mode === "draw" && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#777777] text-sm">
                    Draw your signature here using mouse or touchscreen
                  </div>
                )}
              </div>

              {/* Export Action Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/60">
                <div className="text-xs text-[#777777]">
                  Resolution: <span className="font-semibold text-[#202124]">800 × 320 px (High DPI)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!hasDrawnContent}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-white/80 hover:bg-white/30 text-[#202124] disabled:opacity-40 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied PNG!" : "Copy to Clipboard"}
                  </button>

                  <button
                    onClick={downloadJpg}
                    disabled={!hasDrawnContent}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-white/80 hover:bg-white/30 text-[#202124] disabled:opacity-40 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download JPG
                  </button>

                  <button
                    onClick={downloadPng}
                    disabled={!hasDrawnContent}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold liquid-btn-primary disabled:opacity-40 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Transparent PNG
                  </button>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer Box */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-amber-900 leading-relaxed shadow-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950 mb-1">Electronic Signature Disclaimer</h4>
                <p>
                  WorkOnline provides an electronic image representation of handwritten signatures for routine business communications, approval slips, internal memos, invoices, and standard documents. This tool does not provide cryptographic public-key infrastructure (PKI) digital certificates or qualified electronic signatures (such as eIDAS Qualified or Adobe Certified Document Signatures). Verify the compliance standards required by your local legal jurisdiction before executing notarized or regulated legal contracts.
                </p>
              </div>
            </div>
          </div>

          {/* Settings Sidebar (1 Col) */}
          <div className="space-y-5">
            {mode === "draw" ? (
              <div className="liquid-glass-card rounded-2xl/80 p-5 shadow-sm space-y-5">
                <h3 className="font-semibold text-[#202124] text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#F04452]" />
                  Pen Settings
                </h3>

                {/* Pen Color */}
                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-2">Ink Color</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PEN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setPenColor(c.value)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                          penColor === c.value
                            ? "border-blue-600 bg-red-500/10 text-[#202124] shadow-sm"
                            : "border-white/80 hover:bg-white/20 text-[#202124]"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/80 shrink-0"
                          style={{ backgroundColor: c.value }}
                        />
                        <span className="truncate">{c.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-[#777777]">Custom ink:</span>
                    <input
                      type="color"
                      value={penColor}
                      onChange={(e) => setPenColor(e.target.value)}
                      className="w-7 h-7 rounded border border-white/80 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-[#777777] uppercase">{penColor}</span>
                  </div>
                </div>

                {/* Stroke Width */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#202124]">Pen Thickness</label>
                    <span className="text-xs font-mono text-[#777777]">{strokeWidth}px</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {STROKE_WIDTHS.map((w) => (
                      <button
                        key={w.value}
                        onClick={() => setStrokeWidth(w.value)}
                        className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          strokeWidth === w.value
                            ? "border-blue-600 bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white"
                            : "border-white/80 hover:bg-white/20 text-[#202124]"
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="liquid-glass-card rounded-2xl/80 p-5 shadow-sm space-y-5">
                <h3 className="font-semibold text-[#202124] text-sm flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#F04452]" />
                  Typed Signature Options
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 font-medium text-[#202124]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-1.5">Script Style</label>
                  <div className="space-y-1.5">
                    {CURSIVE_FONTS.map((f) => (
                      <button
                        key={f.font}
                        onClick={() => setSelectedFont(f.font)}
                        className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${
                          selectedFont === f.font
                            ? "border-blue-600 bg-red-500/10 font-semibold text-[#202124]"
                            : "border-white/80 hover:bg-white/20 text-[#202124]"
                        }`}
                        style={{ fontFamily: f.font }}
                      >
                        {typedName || f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202124] mb-2">Ink Color</label>
                  <div className="flex items-center gap-2">
                    {PEN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setPenColor(c.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          penColor === c.value ? "ring-2 ring-blue-500 scale-110" : ""
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#202124]">Font Size</label>
                    <span className="text-xs font-mono text-[#777777]">{typedFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="72"
                    step="2"
                    value={typedFontSize}
                    onChange={(e) => setTypedFontSize(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-white/20 rounded-2xl border border-white/80 p-4 space-y-2 text-xs text-[#777777]">
              <div className="font-semibold text-[#202124] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#F04452]" />
                Best Practice Recommendations
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                <li>Download as <strong>Transparent PNG</strong> to paste onto PDF or Word without a white box.</li>
                <li>For formal corporate documents, Navy or Classic Black ink is generally preferred.</li>
                <li>On mobile devices or touchscreens, use your finger or stylus for maximum precision.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
