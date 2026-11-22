"use client";

import React, { useState } from "react";
import { GitBranch, Check, X, ArrowRight, RefreshCw, Circle, Triangle, Grid, Layers } from "lucide-react";

interface SmartArtBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSmartArt: (html: string) => void;
}

type SmartArtType = "hierarchy" | "process" | "cycle" | "venn" | "pyramid";

export const SmartArtBuilderModal: React.FC<SmartArtBuilderModalProps> = ({
  isOpen,
  onClose,
  onInsertSmartArt,
}) => {
  const [diagramType, setDiagramType] = useState<SmartArtType>("process");
  const [colorTheme, setColorTheme] = useState<"blue" | "emerald" | "amber" | "violet">("blue");

  // Bullet list text lines
  const [bulletText, setBulletText] = useState(
    "Discovery & Requirements\nDesign & Architecture\nDevelopment & Verification\nProduction Rollout"
  );

  if (!isOpen) return null;

  const items = bulletText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const colors = {
    blue: { bg: "#0F6CBD", light: "#E0F2FE", border: "#0284C7", text: "#0369A1" },
    emerald: { bg: "#059669", light: "#D1FAE5", border: "#10B981", text: "#047857" },
    amber: { bg: "#D97706", light: "#FEF3C7", border: "#F59E0B", text: "#B45309" },
    violet: { bg: "#7C3AED", light: "#EDE9FE", border: "#8B5CF6", text: "#6D28D9" },
  }[colorTheme];

  // Render SVG or HTML preview
  const generatePreviewHtml = (): string => {
    if (diagramType === "process") {
      return `
        <div style="display: flex; gap: 8px; align-items: center; justify-content: center; margin: 16px 0; font-family: Calibri, sans-serif;">
          ${items
            .map(
              (item, i) => `
            <div style="background-color: ${colors.bg}; color: white; padding: 12px 18px; border-radius: 4px; font-weight: bold; text-align: center; flex: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 100px;">
              <div style="font-size: 9pt; opacity: 0.85;">STEP ${i + 1}</div>
              <div style="font-size: 11pt; margin-top: 2px;">${item}</div>
            </div>
            ${i < items.length - 1 ? '<div style="font-size: 18pt; color: #94A3B8; font-weight: bold;">➔</div>' : ""}
          `
            )
            .join("")}
        </div>
      `;
    }

    if (diagramType === "cycle") {
      return `
        <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 20px 0; font-family: Calibri, sans-serif;">
          ${items
            .map(
              (item, i) => `
            <div style="background: ${colors.light}; border: 2px solid ${colors.border}; color: ${colors.text}; border-radius: 50%; width: 110px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-weight: bold; padding: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
              <span style="font-size: 8pt; opacity: 0.8;">PHASE ${i + 1}</span>
              <span style="font-size: 10pt; line-height: 1.2;">${item}</span>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    if (diagramType === "hierarchy") {
      return `
        <div style="display: flex; flex-direction: column; align-items: center; margin: 20px 0; font-family: Calibri, sans-serif;">
          <div style="background: ${colors.bg}; color: white; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 11pt; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${items[0] || "Executive Director"}
          </div>
          <div style="width: 2px; height: 16px; background-color: #94A3B8;"></div>
          <div style="display: flex; gap: 16px; justify-content: center; border-top: 2px solid #94A3B8; padding-top: 16px;">
            ${items
              .slice(1)
              .map(
                (item) => `
              <div style="background: ${colors.light}; border: 1px solid ${colors.border}; color: ${colors.text}; padding: 8px 14px; border-radius: 4px; font-size: 10pt; font-weight: 600; text-align: center;">
                ${item}
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    if (diagramType === "pyramid") {
      const tiers = [...items].reverse();
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 20px 0; font-family: Calibri, sans-serif;">
          ${tiers
            .map(
              (item, i) => `
            <div style="width: ${200 + i * 70}px; background: ${colors.bg}; opacity: ${1 - i * 0.15}; color: white; padding: 8px 16px; text-align: center; border-radius: 4px; font-weight: bold; font-size: 10pt;">
              ${item}
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    // Venn Diagram / Matrix
    return `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; max-width: 420px; margin: 20px auto; font-family: Calibri, sans-serif;">
        ${items.slice(0, 4).map(
          (item, i) => `
          <div style="background: ${colors.light}; border: 1.5px solid ${colors.border}; border-radius: 8px; padding: 14px; text-align: center; color: ${colors.text}; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-size: 9pt; opacity: 0.8;">QUADRANT ${i + 1}</div>
            <div style="font-size: 11pt; margin-top: 4px;">${item}</div>
          </div>
        `
        ).join("")}
      </div>
    `;
  };

  const handleInsert = () => {
    onInsertSmartArt(generatePreviewHtml());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col max-h-[85vh] text-sm">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <GitBranch className="w-4 h-4" />
            <span className="font-semibold">SmartArt Graphic Builder</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagram Type Selector */}
        <div className="flex border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] px-4 py-2 justify-between items-center">
          <div className="flex gap-2">
            {[
              { id: "process", label: "Process Flow" },
              { id: "hierarchy", label: "Hierarchy / Org Chart" },
              { id: "cycle", label: "Cycle Loop" },
              { id: "pyramid", label: "Pyramid" },
              { id: "venn", label: "Matrix / Venn" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDiagramType(d.id as SmartArtType)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  diagramType === d.id
                    ? "bg-[#0F6CBD] text-white"
                    : "bg-slate-200 dark:bg-[#333333] text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Color Theme:</span>
            <div className="flex gap-1.5">
              {(["blue", "emerald", "amber", "violet"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setColorTheme(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    colorTheme === c ? "scale-110 border-slate-800 dark:border-white" : "border-transparent"
                  }`}
                  style={{
                    backgroundColor:
                      c === "blue" ? "#0F6CBD" : c === "emerald" ? "#059669" : c === "amber" ? "#D97706" : "#7C3AED",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Builder Content: Left Text Pane + Right Visual Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Text Pane */}
          <div className="w-2/5 p-4 border-r border-slate-200 dark:border-[#2D2D2D] flex flex-col justify-between bg-slate-50 dark:bg-[#252526]">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                Type Diagram Text Here (1 item per line):
              </label>
              <textarea
                rows={9}
                value={bulletText}
                onChange={(e) => setBulletText(e.target.value)}
                placeholder="Enter points here..."
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#1E1E1E] text-xs font-sans outline-none focus:ring-1 focus:ring-[#0F6CBD]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Each line dynamically updates an interactive node in the diagram.
              </span>
            </div>
          </div>

          {/* Right Visual Preview */}
          <div className="w-3/5 p-6 flex flex-col justify-center items-center bg-white dark:bg-[#1A1A1A] overflow-y-auto">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: generatePreviewHtml() }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#2D2D2D] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 dark:border-[#444] rounded text-xs hover:bg-slate-100 dark:hover:bg-[#333]"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Insert SmartArt Graphic</span>
          </button>
        </div>
      </div>
    </div>
  );
};
