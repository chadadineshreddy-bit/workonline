"use client";

import React, { useState } from "react";
import { Search, Replace, Sparkles, X, ChevronDown, Check, ArrowRight, Eye, RefreshCw } from "lucide-react";
import { useWordStore, FindReplaceFormat } from "./word-state";

interface AdvancedFindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindNext: (query: string, options: FindOptions) => boolean;
  onReplaceCurrent: (findText: string, replaceText: string, options: FindOptions) => void;
  onReplaceAll: (findText: string, replaceText: string, options: FindOptions) => number;
  onHighlightAll: (findText: string, options: FindOptions) => void;
  onClearHighlight: () => void;
}

export interface FindOptions {
  matchCase: boolean;
  wholeWord: boolean;
  useWildcards: boolean;
  scope: "main" | "header-footer" | "footnotes";
  findFormat?: FindReplaceFormat;
  replaceFormat?: FindReplaceFormat;
}

const SPECIAL_TOKENS = [
  { label: "Paragraph Mark (^p)", token: "^p", desc: "Paragraph break or newline" },
  { label: "Tab Character (^t)", token: "^t", desc: "Horizontal tab spacing" },
  { label: "Manual Line Break (^l)", token: "^l", desc: "Shift+Enter soft break" },
  { label: "Manual Page Break (^m)", token: "^m", desc: "Ctrl+Enter page break" },
  { label: "Section Break (^b)", token: "^b", desc: "Next section boundary" },
  { label: "Any Digit (^#)", token: "^#", desc: "Matches 0-9 digits" },
  { label: "Any Letter (^$)", token: "^$", desc: "Matches a-z, A-Z letters" },
  { label: "Any Character (^?)", token: "^?", desc: "Matches any single symbol" },
  { label: "Find What Text (^&)", token: "^&", desc: "Used in Replace box to retain matched string" },
  { label: "Clipboard Contents (^c)", token: "^c", desc: "Replaces with current clipboard item" },
];

export const AdvancedFindReplaceModal: React.FC<AdvancedFindReplaceModalProps> = ({
  isOpen,
  onClose,
  onFindNext,
  onReplaceCurrent,
  onReplaceAll,
  onHighlightAll,
  onClearHighlight,
}) => {
  const [activeTab, setActiveTab] = useState<"find" | "replace">("replace");
  const [findInput, setFindInput] = useState("");
  const [replaceInput, setReplaceInput] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useWildcards, setUseWildcards] = useState(false);
  const [scope, setScope] = useState<"main" | "header-footer" | "footnotes">("main");
  const [showSpecialMenu, setShowSpecialMenu] = useState(false);
  const [showFormatSection, setShowFormatSection] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Format filtering
  const [findFormat, setFindFormat] = useState<FindReplaceFormat>({});
  const [replaceFormat, setReplaceFormat] = useState<FindReplaceFormat>({});

  if (!isOpen) return null;

  const currentOptions: FindOptions = {
    matchCase,
    wholeWord,
    useWildcards,
    scope,
    findFormat: Object.keys(findFormat).length > 0 ? findFormat : undefined,
    replaceFormat: Object.keys(replaceFormat).length > 0 ? replaceFormat : undefined,
  };

  const handleInsertToken = (token: string, targetBox: "find" | "replace") => {
    if (targetBox === "find") {
      setFindInput((prev) => prev + token);
    } else {
      setReplaceInput((prev) => prev + token);
    }
    setShowSpecialMenu(false);
  };

  const handleFind = () => {
    if (!findInput.trim() && Object.keys(findFormat).length === 0) {
      setStatusMessage("Please enter search text or select format criteria.");
      return;
    }
    const found = onFindNext(findInput, currentOptions);
    setStatusMessage(found ? "Match found and highlighted." : "No matching items found.");
  };

  const handleReplace = () => {
    if (!findInput.trim()) return;
    onReplaceCurrent(findInput, replaceInput, currentOptions);
    setStatusMessage("Replaced current occurrence.");
  };

  const handleReplaceAll = () => {
    if (!findInput.trim()) return;
    const count = onReplaceAll(findInput, replaceInput, currentOptions);
    setStatusMessage(`Word has completed search and made ${count} replacement${count === 1 ? "" : "s"}.`);
  };

  const handleHighlightAll = () => {
    if (!findInput.trim()) return;
    onHighlightAll(findInput, currentOptions);
    setStatusMessage("Reading highlight applied to all occurrences.");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col text-sm font-sans">
        {/* Title Bar */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#0F6CBD] to-[#115EA3] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <Search className="w-4 h-4 text-white/90" />
            <span>Find and Replace (Advanced Engine)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] px-3 pt-2">
          <button
            onClick={() => setActiveTab("replace")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "replace"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Replace
          </button>
          <button
            onClick={() => setActiveTab("find")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "find"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Find
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Find What Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-200">Find what:</label>
              <span className="text-[11px] text-slate-500">Supports Word wildcards (^p, ^t, ^m)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={findInput}
                onChange={(e) => setFindInput(e.target.value)}
                placeholder="Enter text, pattern, or special character code..."
                className="flex-1 px-3 py-1.5 rounded border border-slate-300 dark:border-[#3E3E42] bg-white dark:bg-[#2D2D30] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#0F6CBD] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSpecialMenu(!showSpecialMenu)}
                className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-[#2D2D30] hover:bg-slate-200 dark:hover:bg-[#3E3E42] border border-slate-300 dark:border-[#4E4E52] rounded flex items-center gap-1 text-slate-700 dark:text-slate-200"
              >
                <span>Special</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Special Character Dropdown Menu */}
          {showSpecialMenu && (
            <div className="p-2 bg-slate-50 dark:bg-[#252526] border border-slate-300 dark:border-[#3E3E42] rounded-md grid grid-cols-2 gap-1 text-xs">
              {SPECIAL_TOKENS.map((item) => (
                <button
                  key={item.token}
                  onClick={() => handleInsertToken(item.token, "find")}
                  className="p-1.5 text-left hover:bg-[#0F6CBD]/10 hover:text-[#0F6CBD] rounded flex flex-col"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                  <span className="text-[10px] text-slate-500">{item.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Replace With Input (if tab is replace) */}
          {activeTab === "replace" && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-200">Replace with:</label>
                <span className="text-[11px] text-slate-500">Use ^&amp; to keep found text, ^c for clipboard</span>
              </div>
              <input
                type="text"
                value={replaceInput}
                onChange={(e) => setReplaceInput(e.target.value)}
                placeholder="Enter replacement string or format..."
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-[#3E3E42] bg-white dark:bg-[#2D2D30] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-[#0F6CBD] outline-none"
              />
            </div>
          )}

          {/* Search Options & Flags */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 dark:border-[#2D2D2D]">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded border-slate-300 text-[#0F6CBD] focus:ring-[#0F6CBD]"
              />
              <span>Match case</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="rounded border-slate-300 text-[#0F6CBD] focus:ring-[#0F6CBD]"
              />
              <span>Find whole words only</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useWildcards}
                onChange={(e) => setUseWildcards(e.target.checked)}
                className="rounded border-slate-300 text-[#0F6CBD] focus:ring-[#0F6CBD]"
              />
              <span>Use wildcards (Regex)</span>
            </label>
          </div>

          {/* Search Scope & Reading Highlight */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#2D2D2D] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">Search In:</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="px-2 py-1 bg-white dark:bg-[#2D2D30] border border-slate-300 dark:border-[#4E4E52] rounded text-xs outline-none"
              >
                <option value="main">Main Document</option>
                <option value="header-footer">Headers &amp; Footers</option>
                <option value="footnotes">Footnotes &amp; Endnotes</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleHighlightAll}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-xs flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3 h-3" />
                <span>Reading Highlight (All)</span>
              </button>
              <button
                type="button"
                onClick={onClearHighlight}
                className="px-2.5 py-1 bg-slate-100 dark:bg-[#2D2D30] hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#4E4E52] rounded text-xs"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Format-Based Search Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowFormatSection(!showFormatSection)}
              className="text-xs text-[#0F6CBD] hover:underline flex items-center gap-1 font-medium"
            >
              <span>{showFormatSection ? "Hide Format Criteria" : "Format-Based Search & Replace..."}</span>
            </button>

            {showFormatSection && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333333] rounded space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  {/* Find Criteria */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block border-b pb-1">
                      Find Formatting:
                    </span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={findFormat.bold || false}
                        onChange={(e) => setFindFormat({ ...findFormat, bold: e.target.checked || undefined })}
                      />
                      <span>Bold text only</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={findFormat.italic || false}
                        onChange={(e) => setFindFormat({ ...findFormat, italic: e.target.checked || undefined })}
                      />
                      <span>Italic text only</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span>Color:</span>
                      <input
                        type="color"
                        value={findFormat.color || "#000000"}
                        onChange={(e) => setFindFormat({ ...findFormat, color: e.target.value })}
                        className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Replace Formatting */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block border-b pb-1">
                      Apply Formatting on Replace:
                    </span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={replaceFormat.bold || false}
                        onChange={(e) => setReplaceFormat({ ...replaceFormat, bold: e.target.checked || undefined })}
                      />
                      <span>Apply Bold</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span>Apply Style:</span>
                      <select
                        value={replaceFormat.style || ""}
                        onChange={(e) => setReplaceFormat({ ...replaceFormat, style: e.target.value || undefined })}
                        className="px-2 py-0.5 bg-white dark:bg-[#2D2D30] border rounded text-xs"
                      >
                        <option value="">(No Style Change)</option>
                        <option value="Heading 1">Heading 1</option>
                        <option value="Heading 2">Heading 2</option>
                        <option value="Title">Title</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status notification */}
          {statusMessage && (
            <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage(null)}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#2D2D2D] flex items-center justify-end gap-2">
          {activeTab === "replace" && (
            <>
              <button
                type="button"
                onClick={handleReplaceAll}
                className="px-3 py-1.5 bg-slate-200 dark:bg-[#333333] hover:bg-slate-300 dark:hover:bg-[#444444] rounded text-xs font-medium text-slate-800 dark:text-slate-100 transition-colors"
              >
                Replace All
              </button>
              <button
                type="button"
                onClick={handleReplace}
                className="px-3 py-1.5 bg-slate-200 dark:bg-[#333333] hover:bg-slate-300 dark:hover:bg-[#444444] rounded text-xs font-medium text-slate-800 dark:text-slate-100 transition-colors"
              >
                Replace
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleFind}
            className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Next</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 dark:border-[#444444] hover:bg-slate-100 dark:hover:bg-[#2D2D30] rounded text-xs text-slate-700 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
