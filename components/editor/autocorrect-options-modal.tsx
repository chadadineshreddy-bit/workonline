"use client";

import React, { useState } from "react";
import { Settings, Plus, Trash2, X, Check, CheckSquare } from "lucide-react";
import { useWordStore } from "./word-state";

interface AutoCorrectOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoCorrectOptionsModal: React.FC<AutoCorrectOptionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    autoCorrectRules,
    addAutoCorrectRule,
    deleteAutoCorrectRule,
    autoFormatAsYouType,
    setAutoFormatOption,
  } = useWordStore();

  const [activeTab, setActiveTab] = useState<"autocorrect" | "autoformat" | "math">("autocorrect");
  const [newShortcut, setNewShortcut] = useState("");
  const [newReplacement, setNewReplacement] = useState("");

  if (!isOpen) return null;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcut.trim() || !newReplacement.trim()) return;
    addAutoCorrectRule(newShortcut.trim(), newReplacement.trim());
    setNewShortcut("");
    setNewReplacement("");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col max-h-[85vh] text-sm font-sans">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <Settings className="w-4 h-4 text-white/90" />
            <span className="font-semibold">AutoCorrect &amp; AutoFormat Options</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] px-3 pt-2">
          <button
            onClick={() => setActiveTab("autocorrect")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "autocorrect"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            AutoCorrect
          </button>
          <button
            onClick={() => setActiveTab("autoformat")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "autoformat"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            AutoFormat As You Type
          </button>
          <button
            onClick={() => setActiveTab("math")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "math"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            Math AutoCorrect
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === "autocorrect" && (
            <div className="space-y-4">
              <span className="text-xs text-slate-500 block">
                Automatically replace text as you type across all documents:
              </span>

              {/* Add form */}
              <form onSubmit={handleAddRule} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Replace (e.g., (c), btw)"
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded text-xs bg-white dark:bg-[#252526] outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="With (e.g., ©, by the way)"
                  value={newReplacement}
                  onChange={(e) => setNewReplacement(e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded text-xs bg-white dark:bg-[#252526] outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Rules List */}
              <div className="border rounded overflow-y-auto max-h-56 divide-y">
                {autoCorrectRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-[#252526]"
                  >
                    <div className="flex items-center gap-4">
                      <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-[#333] rounded font-mono text-slate-800 dark:text-slate-200">
                        {rule.shortcut}
                      </code>
                      <span className="text-slate-400">➔</span>
                      <strong className="text-slate-900 dark:text-white">{rule.replacement}</strong>
                    </div>
                    <button
                      onClick={() => deleteAutoCorrectRule(rule.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "autoformat" && (
            <div className="space-y-3">
              <span className="text-xs text-slate-500 block">
                Enable or disable automatic conversions while typing:
              </span>

              {[
                { key: "smartQuotes", label: 'Straight quotes "" with smart curly quotes “”' },
                { key: "hyphensToDashes", label: "Hyphens (--) with en-dash (–) or em-dash (—)" },
                { key: "fractions", label: "Fractions (1/2, 1/4) with fraction characters (½, ¼)" },
                { key: "ordinals", label: "Ordinals (1st, 2nd) with superscript (1ˢᵗ, 2ⁿᵈ)" },
                { key: "horizontalRules", label: "Hyphens (---) with full horizontal border rule" },
                { key: "autoHyperlinks", label: "Internet and email addresses with hyperlinks" },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 dark:hover:bg-[#252526] cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={(autoFormatAsYouType as any)[opt.key]}
                    onChange={(e) => setAutoFormatOption(opt.key, e.target.checked)}
                    className="rounded text-[#0F6CBD]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {activeTab === "math" && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoFormatAsYouType.mathAutoCorrect}
                  onChange={(e) => setAutoFormatOption("mathAutoCorrect", e.target.checked)}
                  className="rounded text-[#0F6CBD]"
                />
                <span>Use Math AutoCorrect rules outside of math regions</span>
              </label>

              <div className="border rounded overflow-y-auto max-h-56 p-2 space-y-1.5 text-xs bg-slate-50 dark:bg-[#252526]">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "\\alpha", sym: "α" },
                    { code: "\\beta", sym: "β" },
                    { code: "\\pi", sym: "π" },
                    { code: "\\sum", sym: "∑" },
                    { code: "\\infty", sym: "∞" },
                    { code: "\\neq", sym: "≠" },
                    { code: "\\leq", sym: "≤" },
                    { code: "\\geq", sym: "≥" },
                    { code: "\\times", sym: "×" },
                    { code: "\\sqrt", sym: "√" },
                    { code: "\\pm", sym: "±" },
                    { code: "\\degree", sym: "°" },
                  ].map((m) => (
                    <div key={m.code} className="p-1.5 bg-white dark:bg-[#1E1E1E] rounded border flex justify-between">
                      <code className="text-[11px] text-[#0F6CBD]">{m.code}</code>
                      <span className="font-bold">{m.sym}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 dark:bg-[#252526] border-t border-slate-200 dark:border-[#2D2D2D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0F6CBD] text-white rounded text-xs font-semibold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
