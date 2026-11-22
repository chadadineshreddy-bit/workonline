"use client";

import React, { useState } from "react";
import { Type, Sparkles, X, Check, Sliders, Layers, Palette } from "lucide-react";

interface AdvancedTypographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTypography: (styleObj: Record<string, string>) => void;
}

const TEXT_EFFECT_PRESETS = [
  {
    name: "Classic Shadow",
    preview: "Shadow",
    style: { textShadow: "2px 2px 4px rgba(0,0,0,0.5)", fontWeight: "bold" },
  },
  {
    name: "Azure Glow",
    preview: "Glow",
    style: { textShadow: "0 0 10px #0F6CBD, 0 0 20px #0F6CBD", color: "#004085", fontWeight: "bold" },
  },
  {
    name: "Crimson Blaze",
    preview: "Blaze",
    style: { textShadow: "0 0 8px #EF4444, 2px 2px 2px #7F1D1D", color: "#DC2626", fontWeight: "bold" },
  },
  {
    name: "Emerald Neon",
    preview: "Neon",
    style: { textShadow: "0 0 6px #10B981, 0 0 12px #047857", color: "#059669", fontWeight: "bold" },
  },
  {
    name: "Liquid Gold",
    preview: "Gold",
    style: {
      background: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontWeight: "900",
    },
  },
  {
    name: "Cyber Violet",
    preview: "Violet",
    style: {
      background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontWeight: "800",
    },
  },
  {
    name: "Deep 3D Extrusion",
    preview: "3D Text",
    style: {
      textShadow: "1px 1px #94A3B8, 2px 2px #64748B, 3px 3px #475569, 4px 4px #334155",
      fontWeight: "bold",
    },
  },
  {
    name: "Outline Hollow",
    preview: "Outline",
    style: {
      WebkitTextStroke: "1.5px #0F6CBD",
      color: "transparent",
      fontWeight: "900",
    },
  },
  {
    name: "Soft Edge Fog",
    preview: "Soft",
    style: {
      color: "rgba(15, 108, 189, 0.8)",
      filter: "blur(0.5px)",
      fontWeight: "600",
    },
  },
  {
    name: "Reflective Mirror",
    preview: "Mirror",
    style: {
      fontWeight: "bold",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    },
  },
  {
    name: "Obsidian Metallic",
    preview: "Obsidian",
    style: {
      background: "linear-gradient(180deg, #334155 0%, #0F172A 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontWeight: "800",
    },
  },
  {
    name: "Sunset Gradient",
    preview: "Sunset",
    style: {
      background: "linear-gradient(90deg, #F43F5E, #FB923C, #FBBF24)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontWeight: "800",
    },
  },
];

export const AdvancedTypographyModal: React.FC<AdvancedTypographyModalProps> = ({
  isOpen,
  onClose,
  onApplyTypography,
}) => {
  const [tab, setTab] = useState<"opentype" | "border-shading" | "wordart">("opentype");

  // OpenType parameters
  const [ligatures, setLigatures] = useState("normal");
  const [numberSpacing, setNumberSpacing] = useState("tabular-nums");
  const [numberForms, setNumberForms] = useState("lining-nums");
  const [kerning, setKerning] = useState(true);
  const [charSpacingPt, setCharSpacingPt] = useState(0);
  const [verticalPositionPt, setVerticalPositionPt] = useState(0);
  const [charScale, setCharScale] = useState(100);

  // Character Borders & Shading
  const [charBorder, setCharBorder] = useState(false);
  const [charBorderColor, setCharBorderColor] = useState("#0F6CBD");
  const [charBorderWidth, setCharBorderWidth] = useState("1px");
  const [charShading, setCharShading] = useState(false);
  const [charShadingColor, setCharShadingColor] = useState("#E0F2FE");

  // Selected preset
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    const styles: Record<string, string> = {};

    if (tab === "opentype") {
      styles["font-variant-ligatures"] = ligatures;
      styles["font-variant-numeric"] = `${numberSpacing} ${numberForms}`;
      styles["font-kerning"] = kerning ? "normal" : "none";
      if (charSpacingPt !== 0) {
        styles["letter-spacing"] = `${charSpacingPt}pt`;
      }
      if (verticalPositionPt !== 0) {
        styles["vertical-align"] = `${verticalPositionPt}pt`;
      }
      if (charScale !== 100) {
        styles["transform"] = `scaleX(${charScale / 100})`;
        styles["display"] = "inline-block";
      }
    } else if (tab === "border-shading") {
      if (charBorder) {
        styles["border"] = `${charBorderWidth} solid ${charBorderColor}`;
        styles["padding"] = "1px 4px";
        styles["border-radius"] = "2px";
      }
      if (charShading) {
        styles["background-color"] = charShadingColor;
        styles["padding"] = "1px 4px";
        styles["border-radius"] = "2px";
      }
    } else if (tab === "wordart" && selectedPreset) {
      Object.entries(selectedPreset.style).forEach(([k, v]) => {
        styles[k] = v as string;
      });
    }

    onApplyTypography(styles);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col text-sm">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <Type className="w-4 h-4" />
            <span>Advanced Typography &amp; OpenType Controls</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] px-3 pt-2">
          <button
            onClick={() => setTab("opentype")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              tab === "opentype"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            OpenType Features
          </button>
          <button
            onClick={() => setTab("border-shading")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              tab === "border-shading"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            Character Borders &amp; Shading
          </button>
          <button
            onClick={() => setTab("wordart")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              tab === "wordart"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            WordArt &amp; Text Effects (15+)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {tab === "opentype" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Ligatures:</label>
                  <select
                    value={ligatures}
                    onChange={(e) => setLigatures(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#2D2D30] border rounded text-xs outline-none"
                  >
                    <option value="none">None</option>
                    <option value="normal">Standard Only</option>
                    <option value="contextual">Standard &amp; Contextual</option>
                    <option value="historical">Historical Ligatures</option>
                    <option value="all">All Ligatures</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Number Spacing:</label>
                  <select
                    value={numberSpacing}
                    onChange={(e) => setNumberSpacing(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#2D2D30] border rounded text-xs outline-none"
                  >
                    <option value="normal">Default</option>
                    <option value="proportional-nums">Proportional</option>
                    <option value="tabular-nums">Tabular (Columns)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Number Forms:</label>
                  <select
                    value={numberForms}
                    onChange={(e) => setNumberForms(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#2D2D30] border rounded text-xs outline-none"
                  >
                    <option value="lining-nums">Lining (Modern)</option>
                    <option value="oldstyle-nums">Old-style (Classical)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="kerning-toggle"
                    checked={kerning}
                    onChange={(e) => setKerning(e.target.checked)}
                    className="rounded text-[#0F6CBD]"
                  />
                  <label htmlFor="kerning-toggle" className="text-xs cursor-pointer font-medium">
                    Kerning for fonts above 12 pt
                  </label>
                </div>
              </div>

              {/* Character Spacing & Scaling */}
              <div className="p-3 bg-slate-50 dark:bg-[#252526] rounded border space-y-3">
                <div className="font-semibold text-xs border-b pb-1">Advanced Spacing &amp; Scale</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block">Scaling ({charScale}%):</label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={charScale}
                      onChange={(e) => setCharScale(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Character Spacing (pt):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={charSpacingPt}
                      onChange={(e) => setCharSpacingPt(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-[#2D2D30] border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Vertical Position (pt):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={verticalPositionPt}
                      onChange={(e) => setVerticalPositionPt(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white dark:bg-[#2D2D30] border rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "border-shading" && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-[#252526] rounded border space-y-3">
                <label className="flex items-center gap-2 font-semibold text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={charBorder}
                    onChange={(e) => setCharBorder(e.target.checked)}
                    className="rounded text-[#0F6CBD]"
                  />
                  <span>Apply Character Border (Box around word)</span>
                </label>
                {charBorder && (
                  <div className="flex items-center gap-4 pl-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span>Border Color:</span>
                      <input
                        type="color"
                        value={charBorderColor}
                        onChange={(e) => setCharBorderColor(e.target.value)}
                        className="w-6 h-6 border-0 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Width:</span>
                      <select
                        value={charBorderWidth}
                        onChange={(e) => setCharBorderWidth(e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-[#2D2D30] border rounded text-xs"
                      >
                        <option value="1px">1 pt</option>
                        <option value="1.5px">1.5 pt</option>
                        <option value="2px">2 pt</option>
                        <option value="3px">3 pt</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#252526] rounded border space-y-3">
                <label className="flex items-center gap-2 font-semibold text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={charShading}
                    onChange={(e) => setCharShading(e.target.checked)}
                    className="rounded text-[#0F6CBD]"
                  />
                  <span>Apply Character Shading (Background tint)</span>
                </label>
                {charShading && (
                  <div className="flex items-center gap-4 pl-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span>Shading Color:</span>
                      <input
                        type="color"
                        value={charShadingColor}
                        onChange={(e) => setCharShadingColor(e.target.value)}
                        className="w-6 h-6 border-0 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "wordart" && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-medium">
                Choose a typography preset to apply to selected text:
              </div>
              <div className="grid grid-cols-3 gap-3">
                {TEXT_EFFECT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPreset?.name === preset.name
                        ? "border-[#0F6CBD] bg-[#0F6CBD]/10 ring-2 ring-[#0F6CBD]"
                        : "border-slate-200 dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#252526]"
                    }`}
                  >
                    <span className="text-lg py-1" style={preset.style as any}>
                      {preset.preview}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Preview Bar */}
          <div className="p-3 bg-slate-100 dark:bg-[#222] border rounded text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Preview</span>
            <span
              className="text-base"
              style={{
                letterSpacing: `${charSpacingPt}pt`,
                fontVariantLigatures: ligatures,
                border: charBorder ? `${charBorderWidth} solid ${charBorderColor}` : undefined,
                backgroundColor: charShading ? charShadingColor : undefined,
                padding: charBorder || charShading ? "2px 6px" : undefined,
                ...(selectedPreset?.style || {}),
              }}
            >
              DocuFlow Professional Typography
            </span>
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
            onClick={handleApply}
            className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Selection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
