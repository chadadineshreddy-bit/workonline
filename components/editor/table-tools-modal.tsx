"use client";

import React, { useState } from "react";
import { Table, Calculator, Sliders, Check, X, Split, ShieldCheck } from "lucide-react";

interface TableToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFormula: (formulaText: string, numberFormat: string) => void;
  onInsertNestedTable: (rows: number, cols: number) => void;
  onApplyTableFormatting: (options: TableFormattingOptions) => void;
}

export interface TableFormattingOptions {
  diagonalBorder?: "none" | "tl-br" | "bl-tr";
  allowRowBreak?: boolean;
  repeatHeader?: boolean;
  cellPadding?: string;
  cellSpacing?: string;
}

export const TableToolsModal: React.FC<TableToolsModalProps> = ({
  isOpen,
  onClose,
  onApplyFormula,
  onInsertNestedTable,
  onApplyTableFormatting,
}) => {
  const [activeTab, setActiveTab] = useState<"formula" | "nested" | "borders-pagination">("formula");

  // Formula Tab State
  const [formulaExpression, setFormulaExpression] = useState("=SUM(ABOVE)");
  const [numberFormat, setNumberFormat] = useState("$#,##0.00");

  // Nested Table Tab State
  const [nestedRows, setNestedRows] = useState(2);
  const [nestedCols, setNestedCols] = useState(2);

  // Borders & Pagination Tab State
  const [diagonalBorder, setDiagonalBorder] = useState<"none" | "tl-br" | "bl-tr">("none");
  const [allowRowBreak, setAllowRowBreak] = useState(true);
  const [repeatHeader, setRepeatHeader] = useState(true);
  const [cellPadding, setCellPadding] = useState("8px 12px");
  const [cellSpacing, setCellSpacing] = useState("0px");

  if (!isOpen) return null;

  const handleApplyFormula = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFormula(formulaExpression, numberFormat);
    onClose();
  };

  const handleInsertNested = () => {
    onInsertNestedTable(nestedRows, nestedCols);
    onClose();
  };

  const handleApplyFormatting = () => {
    onApplyTableFormatting({
      diagonalBorder,
      allowRowBreak,
      repeatHeader,
      cellPadding,
      cellSpacing,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col text-sm">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <Table className="w-4 h-4" />
            <span>Table Tools &amp; Advanced Formulas</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] px-3 pt-2">
          <button
            onClick={() => setActiveTab("formula")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "formula"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            Formula (=SUM, etc.)
          </button>
          <button
            onClick={() => setActiveTab("nested")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "nested"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            Nested Table
          </button>
          <button
            onClick={() => setActiveTab("borders-pagination")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t border-t border-x transition-colors ${
              activeTab === "borders-pagination"
                ? "bg-white dark:bg-[#1E1E1E] border-slate-300 dark:border-[#333333] text-[#0F6CBD] border-b-white dark:border-b-[#1E1E1E]"
                : "border-transparent text-slate-600 dark:text-slate-400"
            }`}
          >
            Pagination &amp; Diagonal Borders
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {activeTab === "formula" && (
            <form onSubmit={handleApplyFormula} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Formula Expression:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formulaExpression}
                    onChange={(e) => setFormulaExpression(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] font-mono text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
                  />
                  <select
                    onChange={(e) => e.target.value && setFormulaExpression(e.target.value)}
                    className="px-2 py-1.5 bg-slate-100 dark:bg-[#333] border rounded text-xs"
                  >
                    <option value="">Paste Function...</option>
                    <option value="=SUM(ABOVE)">=SUM(ABOVE)</option>
                    <option value="=SUM(LEFT)">=SUM(LEFT)</option>
                    <option value="=AVERAGE(ABOVE)">=AVERAGE(ABOVE)</option>
                    <option value="=COUNT(ABOVE)">=COUNT(ABOVE)</option>
                    <option value="=MAX(ABOVE)">=MAX(ABOVE)</option>
                    <option value="=MIN(ABOVE)">=MIN(ABOVE)</option>
                    <option value="=PRODUCT(LEFT)">=PRODUCT(LEFT)</option>
                    <option value="=B2*C2">=B2*C2 (Cell Reference)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Number Format:</label>
                <select
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] text-xs outline-none"
                >
                  <option value="$#,##0.00">$#,##0.00 (Currency)</option>
                  <option value="#,##0">#,##0 (Integer)</option>
                  <option value="#,##0.00">#,##0.00 (Decimal)</option>
                  <option value="0.00%">0.00% (Percentage)</option>
                  <option value="0%">0% (Whole percent)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded text-xs text-blue-800 dark:text-blue-300">
                Word calculates numbers dynamically from adjacent table cells above or to the left of the active cell.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border rounded text-xs hover:bg-slate-100 dark:hover:bg-[#333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold"
                >
                  Calculate &amp; Insert Result
                </button>
              </div>
            </form>
          )}

          {activeTab === "nested" && (
            <div className="space-y-4">
              <div className="font-medium text-xs text-slate-600 dark:text-slate-300">
                Insert a complete secondary table directly inside the selected table cell:
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Nested Rows:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={nestedRows}
                    onChange={(e) => setNestedRows(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Nested Columns:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={nestedCols}
                    onChange={(e) => setNestedCols(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border rounded text-xs hover:bg-slate-100 dark:hover:bg-[#333]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertNested}
                  className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold"
                >
                  Insert Nested Table
                </button>
              </div>
            </div>
          )}

          {activeTab === "borders-pagination" && (
            <div className="space-y-4">
              {/* Diagonal borders */}
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Diagonal Cell Border:</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "none", label: "None" },
                    { id: "tl-br", label: "Top-Left to Bottom-Right (\\)" },
                    { id: "bl-tr", label: "Bottom-Left to Top-Right (/)" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDiagonalBorder(d.id as any)}
                      className={`p-2 rounded border text-center transition-colors ${
                        diagonalBorder === d.id
                          ? "border-[#0F6CBD] bg-[#0F6CBD]/10 text-[#0F6CBD] font-bold"
                          : "border-slate-300 dark:border-[#444]"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row pagination */}
              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-semibold block">Row Pagination Rules:</label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowRowBreak}
                    onChange={(e) => setAllowRowBreak(e.target.checked)}
                    className="rounded text-[#0F6CBD]"
                  />
                  <span>Allow row to break across pages</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={repeatHeader}
                    onChange={(e) => setRepeatHeader(e.target.checked)}
                    className="rounded text-[#0F6CBD]"
                  />
                  <span>Repeat as header row at the top of each page</span>
                </label>
              </div>

              {/* Cell Margins & Spacing */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <label className="text-xs font-semibold block mb-1">Cell Padding:</label>
                  <select
                    value={cellPadding}
                    onChange={(e) => setCellPadding(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#252526] border rounded text-xs"
                  >
                    <option value="4px 8px">Compact (4pt 8pt)</option>
                    <option value="8px 12px">Normal (8pt 12pt)</option>
                    <option value="12px 16px">Spacious (12pt 16pt)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Cell Spacing:</label>
                  <select
                    value={cellSpacing}
                    onChange={(e) => setCellSpacing(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-[#252526] border rounded text-xs"
                  >
                    <option value="0px">None (Border Collapse)</option>
                    <option value="2px">2 pt (Separated)</option>
                    <option value="4px">4 pt (Separated)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border rounded text-xs hover:bg-slate-100 dark:hover:bg-[#333]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFormatting}
                  className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold"
                >
                  Apply Table Properties
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
