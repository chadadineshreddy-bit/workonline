"use client";

import React, { useState } from "react";
import { Info, X, CheckSquare, Square, ArrowRight, Layers } from "lucide-react";
import { useWordStore } from "./word-state";

interface FormattingDetails {
  fontFamily: string;
  fontSize: string;
  fontColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: string;
  lineSpacing: string;
  margins: string;
  orientation: string;
  styleName: string;
}

interface RevealFormattingPaneProps {
  isOpen: boolean;
  onClose: () => void;
  currentFormatting: FormattingDetails;
}

export const RevealFormattingPane: React.FC<RevealFormattingPaneProps> = ({
  isOpen,
  onClose,
  currentFormatting,
}) => {
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparisonTarget, setComparisonTarget] = useState<FormattingDetails | null>(null);

  if (!isOpen) return null;

  const handleSetComparisonTarget = () => {
    setComparisonTarget({ ...currentFormatting });
    setCompareEnabled(true);
  };

  return (
    <aside className="w-80 border-l border-slate-300 dark:border-[#333333] bg-[#F9F9FB] dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 flex flex-col h-full z-40 shadow-lg text-xs">
      {/* Title */}
      <div className="px-4 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 text-white/90" />
          <span className="font-semibold">Reveal Formatting (Shift+F1)</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Selected text description */}
        <div className="p-2.5 bg-white dark:bg-[#252526] rounded border border-slate-200 dark:border-[#333333]">
          <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
            Active Selection Style
          </span>
          <div className="font-semibold text-sm text-[#0F6CBD]">{currentFormatting.styleName || "Normal"}</div>
        </div>

        {/* Font section */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[11px] block border-b pb-1">
            Font Formatting
          </span>
          <div className="space-y-1 pl-2 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Font:</span>
              <strong className="text-slate-900 dark:text-slate-100">{currentFormatting.fontFamily}</strong>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <strong className="text-slate-900 dark:text-slate-100">{currentFormatting.fontSize}</strong>
            </div>
            <div className="flex justify-between">
              <span>Color:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-slate-400"
                  style={{ backgroundColor: currentFormatting.fontColor }}
                />
                <strong className="text-slate-900 dark:text-slate-100">{currentFormatting.fontColor}</strong>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Attributes:</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {[
                  currentFormatting.bold ? "Bold" : "",
                  currentFormatting.italic ? "Italic" : "",
                  currentFormatting.underline ? "Underline" : "",
                ]
                  .filter(Boolean)
                  .join(", ") || "Regular"}
              </strong>
            </div>
          </div>
        </div>

        {/* Paragraph section */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[11px] block border-b pb-1">
            Paragraph Formatting
          </span>
          <div className="space-y-1 pl-2 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Alignment:</span>
              <strong className="text-slate-900 dark:text-slate-100 capitalize">
                {currentFormatting.alignment}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Line Spacing:</span>
              <strong className="text-slate-900 dark:text-slate-100">{currentFormatting.lineSpacing}x</strong>
            </div>
          </div>
        </div>

        {/* Section formatting */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[11px] block border-b pb-1">
            Section &amp; Page
          </span>
          <div className="space-y-1 pl-2 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Margins:</span>
              <strong className="text-slate-900 dark:text-slate-100 capitalize">
                {currentFormatting.margins}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Orientation:</span>
              <strong className="text-slate-900 dark:text-slate-100 capitalize">
                {currentFormatting.orientation}
              </strong>
            </div>
          </div>
        </div>

        {/* Compare to another selection */}
        <div className="p-3 bg-slate-100 dark:bg-[#252526] rounded border border-slate-200 dark:border-[#333333] space-y-2">
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={compareEnabled}
              onChange={(e) => {
                if (e.target.checked) {
                  handleSetComparisonTarget();
                } else {
                  setCompareEnabled(false);
                  setComparisonTarget(null);
                }
              }}
              className="rounded text-[#0F6CBD]"
            />
            <span>Compare to another selection</span>
          </label>

          {compareEnabled && comparisonTarget && (
            <div className="space-y-2 pt-2 border-t border-slate-300 dark:border-[#3E3E42]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Formatting Differences:
              </span>
              <div className="space-y-1 text-[11px]">
                {currentFormatting.fontFamily !== comparisonTarget.fontFamily && (
                  <div className="text-amber-600 dark:text-amber-400">
                    Font differs: <strong>{currentFormatting.fontFamily}</strong> vs{" "}
                    <strong>{comparisonTarget.fontFamily}</strong>
                  </div>
                )}
                {currentFormatting.fontSize !== comparisonTarget.fontSize && (
                  <div className="text-amber-600 dark:text-amber-400">
                    Size differs: <strong>{currentFormatting.fontSize}</strong> vs{" "}
                    <strong>{comparisonTarget.fontSize}</strong>
                  </div>
                )}
                {currentFormatting.bold !== comparisonTarget.bold && (
                  <div className="text-amber-600 dark:text-amber-400">
                    Weight differs: <strong>{currentFormatting.bold ? "Bold" : "Regular"}</strong> vs{" "}
                    <strong>{comparisonTarget.bold ? "Bold" : "Regular"}</strong>
                  </div>
                )}
                {currentFormatting.fontColor !== comparisonTarget.fontColor && (
                  <div className="text-amber-600 dark:text-amber-400">
                    Color differs: <strong>{currentFormatting.fontColor}</strong> vs{" "}
                    <strong>{comparisonTarget.fontColor}</strong>
                  </div>
                )}
                {currentFormatting.fontFamily === comparisonTarget.fontFamily &&
                  currentFormatting.fontSize === comparisonTarget.fontSize &&
                  currentFormatting.bold === comparisonTarget.bold &&
                  currentFormatting.fontColor === comparisonTarget.fontColor && (
                    <div className="text-emerald-600 dark:text-emerald-400">
                      ✓ Both selections have identical formatting.
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
