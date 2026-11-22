"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useEffect } from "react";
import {
  Store,
  QrCode,
  GitGraph,
  Smile,
  Globe,
  FileCode,
  PenTool,
  X,
  Check,
  Download,
  Trash2,
  Search,
} from "lucide-react";
import QRCode from "qrcode";
import { useWordStore } from "./word-state";

interface AddinsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertContent: (html: string) => void;
}

export const AddinsSidebar: React.FC<AddinsSidebarProps> = ({
  isOpen,
  onClose,
  onInsertContent,
}) => {
  const { installedAddins, activeAddinTab, setActiveAddinTab } = useWordStore();

  // QR Code generator state
  const [qrText, setQrText] = useState("https://workonline.io");
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>("");

  // Mermaid Diagram state
  const [mermaidCode, setMermaidCode] = useState(
    "graph TD;\n  A[Client Request] --> B[API Gateway];\n  B --> C[Auth Middleware];\n  C --> D[Microservice];"
  );

  // Wikipedia search state
  const [wikiQuery, setWikiQuery] = useState("Artificial intelligence");
  const [wikiResult, setWikiResult] = useState<string | null>(
    "Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans. (Source: Wikipedia Encyclopedia)"
  );
  const [isSearchingWiki, setIsSearchingWiki] = useState(false);

  // Lorem Ipsum state
  const [loremParagraphs, setLoremParagraphs] = useState(2);

  // Signature Pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Generate QR code on text change
  useEffect(() => {
    if (activeAddinTab === "qrcode" && qrText) {
      QRCode.toDataURL(qrText, { width: 180, margin: 1 }, (err, url) => {
        if (!err && url) setQrPreviewUrl(url);
      });
    }
  }, [qrText, activeAddinTab]);

  if (!isOpen) return null;

  // Add-in 1: Insert QR Code
  const handleInsertQr = () => {
    if (!qrPreviewUrl) return;
    onInsertContent(
      `<div style="text-align: center; margin: 12px 0;"><img src="${qrPreviewUrl}" alt="QR Code" style="width: 140px; height: 140px; border: 1px solid #CBD5E1; border-radius: 4px;" /><div style="font-size: 8pt; color: #64748B; margin-top: 2px;">Scan to open: ${qrText}</div></div>`
    );
  };

  // Add-in 2: Insert Mermaid Diagram
  const handleInsertMermaid = () => {
    const lines = mermaidCode.split("\n").filter((l) => l.trim().length > 0);
    // Render clean SVG diagram simulation
    const svgHtml = `
      <div style="background-color: #F8FAFC; border: 1.5px solid #0F6CBD; border-radius: 8px; padding: 16px; margin: 16px 0; font-family: monospace; text-align: center;">
        <div style="font-size: 9pt; font-weight: bold; color: #0F6CBD; margin-bottom: 8px;">MERMAID FLOWCHART</div>
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          ${lines
            .map(
              (l) =>
                `<div style="background: white; border: 1px solid #CBD5E1; padding: 6px 12px; border-radius: 4px; font-size: 10pt; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${l.replace(
                  /-->/g,
                  "➔"
                )}</div>`
            )
            .join("")}
        </div>
      </div>
    `;
    onInsertContent(svgHtml);
  };

  // Add-in 3: Insert Emoji / Icon
  const handleInsertEmoji = (emoji: string) => {
    onInsertContent(`<span>${emoji}</span>`);
  };

  // Add-in 4: Search Wikipedia
  const handleSearchWiki = async () => {
    if (!wikiQuery.trim()) return;
    setIsSearchingWiki(true);
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setWikiResult(`${data.extract} (Source: Wikipedia - ${data.title})`);
      } else {
        setWikiResult(`No exact Wikipedia match found for "${wikiQuery}".`);
      }
    } catch {
      setWikiResult(`Network research summary for: ${wikiQuery}`);
    } finally {
      setIsSearchingWiki(false);
    }
  };

  const handleInsertWikiQuote = () => {
    if (!wikiResult) return;
    onInsertContent(
      `<blockquote style="border-left: 4px solid #0F6CBD; padding: 8px 16px; margin: 12px 0; background: #F1F5F9; color: #334155; font-style: italic;">${wikiResult}</blockquote>`
    );
  };

  // Add-in 5: Lorem Ipsum Generator
  const handleInsertLorem = () => {
    const p1 =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    const p2 =
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    const p3 =
      "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.";

    const all = [p1, p2, p3];
    const generated = all.slice(0, loremParagraphs).map((p) => `<p>${p}</p>`).join("");
    onInsertContent(generated);
  };

  // Add-in 6: Signature Pad Mouse Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawingSig(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSig(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleInsertSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onInsertContent(
      `<div style="margin: 16px 0;"><img src="${dataUrl}" alt="Digital Signature" style="width: 180px; height: auto;" /><div style="font-size: 8.5pt; color: #64748B; border-top: 1px solid #94A3B8; width: 180px; padding-top: 4px;">Verified Signer: Dinesh Reddy Chada</div></div>`
    );
  };

  const tabs = [
    { id: "qrcode", label: "QR Code", icon: QrCode },
    { id: "mermaid", label: "Mermaid", icon: GitGraph },
    { id: "emoji", label: "Emoji", icon: Smile },
    { id: "wikipedia", label: "Research", icon: Globe },
    { id: "lorem", label: "Lorem", icon: FileCode },
    { id: "signature", label: "Signature", icon: PenTool },
  ];

  return (
    <aside className="w-84 border-l border-slate-300 dark:border-[#333333] bg-[#F9F9FB] dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 flex flex-col h-full z-40 shadow-lg text-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-medium">
          <Store className="w-4 h-4 text-white/90" />
          <span className="font-semibold">Office Add-ins Suite</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Add-in Tab Navigation */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 dark:bg-[#252526] border-b border-slate-200 dark:border-[#2D2D2D]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAddinTab(tab.id)}
              className={`p-2 rounded text-center flex flex-col items-center justify-center gap-1 transition-colors ${
                activeAddinTab === tab.id
                  ? "bg-[#0F6CBD] text-white font-semibold shadow-sm"
                  : "bg-white dark:bg-[#2D2D30] text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Add-in Content Pane */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* 1. QR Code */}
        {activeAddinTab === "qrcode" && (
          <div className="space-y-3">
            <span className="font-semibold block text-slate-900 dark:text-white">QR Code Generator</span>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Target URL or Text:</label>
              <input
                type="text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#252526] border rounded text-xs outline-none"
              />
            </div>
            {qrPreviewUrl && (
              <div className="flex flex-col items-center p-3 bg-white rounded border">
                <img src={qrPreviewUrl} alt="Preview" className="w-32 h-32" />
                <span className="text-[10px] text-slate-400 mt-1">Live Scannable QR Code</span>
              </div>
            )}
            <button
              onClick={handleInsertQr}
              className="w-full py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded font-semibold text-xs transition-colors"
            >
              Insert QR Code into Document
            </button>
          </div>
        )}

        {/* 2. Mermaid */}
        {activeAddinTab === "mermaid" && (
          <div className="space-y-3">
            <span className="font-semibold block text-slate-900 dark:text-white">Mermaid Diagram</span>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Mermaid Code:</label>
              <textarea
                rows={6}
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#252526] border rounded font-mono text-xs outline-none"
              />
            </div>
            <button
              onClick={handleInsertMermaid}
              className="w-full py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded font-semibold text-xs transition-colors"
            >
              Insert Diagram
            </button>
          </div>
        )}

        {/* 3. Emoji Library */}
        {activeAddinTab === "emoji" && (
          <div className="space-y-3">
            <span className="font-semibold block text-slate-900 dark:text-white">Emoji &amp; Icon Library</span>
            <div className="grid grid-cols-6 gap-2 p-2 bg-white dark:bg-[#252526] rounded border">
              {[
                "✅", "❌", "⚠️", "⭐", "🔥", "📌", "💼", "📊", "📈", "💡", "🎯", "🚀",
                "📝", "📅", "🔒", "🔑", "🎓", "🏆", "❤️", "👍", "🤝", "🌐", "💻", "✨",
              ].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleInsertEmoji(emoji)}
                  className="p-2 text-lg hover:bg-slate-100 dark:hover:bg-[#333] rounded transition-transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Wikipedia Research */}
        {activeAddinTab === "wikipedia" && (
          <div className="space-y-3">
            <span className="font-semibold block text-slate-900 dark:text-white">Wikipedia Research</span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={wikiQuery}
                onChange={(e) => setWikiQuery(e.target.value)}
                placeholder="Search topic..."
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-[#252526] border rounded text-xs outline-none"
              />
              <button
                onClick={handleSearchWiki}
                disabled={isSearchingWiki}
                className="px-3 py-1.5 bg-[#0F6CBD] text-white rounded font-medium disabled:opacity-50"
              >
                {isSearchingWiki ? "..." : "Search"}
              </button>
            </div>
            {wikiResult && (
              <div className="p-3 bg-white dark:bg-[#252526] rounded border text-slate-700 dark:text-slate-300 text-xs">
                {wikiResult}
              </div>
            )}
            <button
              onClick={handleInsertWikiQuote}
              disabled={!wikiResult}
              className="w-full py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded font-semibold text-xs disabled:opacity-50"
            >
              Insert Cited Quote
            </button>
          </div>
        )}

        {/* 5. Lorem Ipsum */}
        {activeAddinTab === "lorem" && (
          <div className="space-y-3">
            <span className="font-semibold block text-slate-900 dark:text-white">Lorem Generator</span>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Paragraphs (1-3):</label>
              <input
                type="number"
                min="1"
                max="3"
                value={loremParagraphs}
                onChange={(e) => setLoremParagraphs(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-[#252526] border rounded text-xs"
              />
            </div>
            <button
              onClick={handleInsertLorem}
              className="w-full py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded font-semibold text-xs"
            >
              Insert Dummy Text
            </button>
          </div>
        )}

        {/* 6. Signature Pad */}
        {activeAddinTab === "signature" && (
          <div className="space-y-3">
            <span className="font-semibold block text-slate-900 dark:text-white">Signature Drawing Pad</span>
            <div className="border border-slate-300 bg-white rounded p-1">
              <canvas
                ref={canvasRef}
                width={260}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-28 bg-white cursor-crosshair rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearSignature}
                className="flex-1 py-1.5 border border-slate-300 rounded font-medium hover:bg-slate-100 dark:hover:bg-[#333]"
              >
                Clear Pad
              </button>
              <button
                onClick={handleInsertSignature}
                className="flex-1 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded font-semibold"
              >
                Insert Signature
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
