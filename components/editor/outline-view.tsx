"use client";

import React, { useState } from "react";
import {
  ListTree,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  BookMarked,
  FileText,
  X,
  FolderPlus,
} from "lucide-react";
import { useWordStore, MasterSubdocument } from "./word-state";

interface OutlineSection {
  id: string;
  level: number; // 1, 2, 3
  title: string;
  content: string;
  collapsed: boolean;
}

interface OutlineViewProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyOutlineChanges: (newHtml: string) => void;
  documentHtml: string;
}

export const OutlineView: React.FC<OutlineViewProps> = ({
  isOpen,
  onClose,
  onApplyOutlineChanges,
  documentHtml,
}) => {
  const {
    outlineLevelFilter,
    setOutlineLevelFilter,
    masterSubdocuments,
    addMasterSubdocument,
    removeMasterSubdocument,
    toggleSubdocumentExpanded,
  } = useWordStore();

  const [activeTab, setActiveTab] = useState<"outline" | "master">("outline");
  const [newSubDocTitle, setNewSubDocTitle] = useState("");
  const [newSubDocFile, setNewSubDocFile] = useState("");

  // Extract headings and paragraphs from HTML
  const parseSections = (): OutlineSection[] => {
    if (typeof window === "undefined") return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(documentHtml || "", "text/html");
    const headers = doc.querySelectorAll("h1, h2, h3");
    const parsed: OutlineSection[] = [];

    headers.forEach((h, idx) => {
      const level = parseInt(h.tagName.replace("H", ""), 10) || 1;
      let bodyText = "";
      let next = h.nextElementSibling;
      while (next && !["H1", "H2", "H3"].includes(next.tagName)) {
        bodyText += next.outerHTML;
        next = next.nextElementSibling;
      }
      parsed.push({
        id: `sec-${idx}`,
        level,
        title: h.textContent || `Section ${idx + 1}`,
        content: bodyText,
        collapsed: false,
      });
    });

    if (parsed.length === 0) {
      parsed.push({
        id: "sec-0",
        level: 1,
        title: "Main Document Outline",
        content: documentHtml,
        collapsed: false,
      });
    }

    return parsed;
  };

  const [sections, setSections] = useState<OutlineSection[]>(parseSections);
  const [selectedSecIndex, setSelectedSecIndex] = useState<number>(0);

  if (!isOpen) return null;

  const handlePromote = (idx: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx && s.level > 1 ? { ...s, level: s.level - 1 } : s))
    );
  };

  const handleDemote = (idx: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx && s.level < 3 ? { ...s, level: s.level + 1 } : s))
    );
  };

  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return;
    const list = [...sections];
    const temp = list[idx];
    list[idx] = list[idx - 1];
    list[idx - 1] = temp;
    setSections(list);
    setSelectedSecIndex(idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= sections.length - 1) return;
    const list = [...sections];
    const temp = list[idx];
    list[idx] = list[idx + 1];
    list[idx + 1] = temp;
    setSections(list);
    setSelectedSecIndex(idx + 1);
  };

  const handleApply = () => {
    let combinedHtml = "";
    sections.forEach((s) => {
      combinedHtml += `<h${s.level}>${s.title}</h${s.level}>\n${s.content}\n`;
    });
    onApplyOutlineChanges(combinedHtml);
    onClose();
  };

  const handleAddSubdocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubDocTitle.trim()) return;
    const subdoc: MasterSubdocument = {
      id: `sub-${Date.now()}`,
      title: newSubDocTitle.trim(),
      filename: newSubDocFile.trim() || `${newSubDocTitle.toLowerCase().replace(/\s+/g, "_")}.docx`,
      content: `<p>Content of ${newSubDocTitle} subdocument...</p>`,
      expanded: true,
    };
    addMasterSubdocument(subdoc);
    setNewSubDocTitle("");
    setNewSubDocFile("");
  };

  const filteredSections = sections.filter((s) => {
    if (outlineLevelFilter === "all") return true;
    return s.level <= outlineLevelFilter;
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col max-h-[85vh] text-sm">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <ListTree className="w-4 h-4 text-white/90" />
            <span className="font-semibold">Outline Power View &amp; Master Documents</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher & level filter */}
        <div className="flex border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] px-4 py-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("outline")}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeTab === "outline" ? "bg-[#0F6CBD] text-white" : "bg-slate-200 dark:bg-[#333]"
              }`}
            >
              Document Outline
            </button>
            <button
              onClick={() => setActiveTab("master")}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                activeTab === "master" ? "bg-[#0F6CBD] text-white" : "bg-slate-200 dark:bg-[#333]"
              }`}
            >
              Master Document &amp; Subdocuments
            </button>
          </div>

          {activeTab === "outline" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Show Level:</span>
              <select
                value={outlineLevelFilter}
                onChange={(e) =>
                  setOutlineLevelFilter(e.target.value === "all" ? "all" : (Number(e.target.value) as any))
                }
                className="px-2 py-1 bg-white dark:bg-[#2D2D30] border rounded text-xs outline-none"
              >
                <option value="all">All Levels</option>
                <option value="1">Level 1 Only</option>
                <option value="2">Level 1 &amp; 2</option>
                <option value="3">Level 1 – 3</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        {activeTab === "outline" && (
          <div className="px-4 py-2 border-b bg-slate-100 dark:bg-[#222] flex items-center gap-2 text-xs">
            <button
              onClick={() => handlePromote(selectedSecIndex)}
              className="px-2.5 py-1 bg-white dark:bg-[#333] border rounded flex items-center gap-1 hover:bg-slate-50"
              title="Promote (Alt+Shift+Left)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Promote</span>
            </button>
            <button
              onClick={() => handleDemote(selectedSecIndex)}
              className="px-2.5 py-1 bg-white dark:bg-[#333] border rounded flex items-center gap-1 hover:bg-slate-50"
              title="Demote (Alt+Shift+Right)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Demote</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-300 dark:bg-[#444] mx-1" />
            <button
              onClick={() => handleMoveUp(selectedSecIndex)}
              className="px-2.5 py-1 bg-white dark:bg-[#333] border rounded flex items-center gap-1 hover:bg-slate-50"
              title="Move Up (Alt+Shift+Up)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Move Up</span>
            </button>
            <button
              onClick={() => handleMoveDown(selectedSecIndex)}
              className="px-2.5 py-1 bg-white dark:bg-[#333] border rounded flex items-center gap-1 hover:bg-slate-50"
              title="Move Down (Alt+Shift+Down)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Move Down</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === "outline" ? (
            filteredSections.map((sec, idx) => (
              <div
                key={sec.id}
                onClick={() => setSelectedSecIndex(idx)}
                className={`p-2.5 rounded border transition-colors cursor-pointer ${
                  selectedSecIndex === idx
                    ? "border-[#0F6CBD] bg-[#0F6CBD]/10 ring-1 ring-[#0F6CBD]"
                    : "border-slate-200 dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#252526]"
                }`}
                style={{ paddingLeft: `${sec.level * 24}px` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#0F6CBD] text-white flex items-center justify-center text-[10px] font-bold">
                      {sec.level}
                    </span>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSections((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, title: val } : s))
                        );
                      }}
                      className="font-semibold text-xs bg-transparent border-0 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">Level {sec.level}</span>
                </div>
              </div>
            ))
          ) : (
            /* Master Document Mode */
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded text-xs text-blue-900 dark:text-blue-300">
                <strong>Master Document System:</strong> Organize multi-chapter book projects by linking individual subdocuments into one unified master file.
              </div>

              {/* Linked Subdocuments */}
              <div className="space-y-2">
                {masterSubdocuments.map((subdoc) => (
                  <div
                    key={subdoc.id}
                    className="p-3 bg-white dark:bg-[#252526] border rounded-lg shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSubdocumentExpanded(subdoc.id)}
                          className="p-0.5 hover:bg-slate-100 rounded text-slate-500"
                        >
                          {subdoc.expanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <FileText className="w-4 h-4 text-[#0F6CBD]" />
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {subdoc.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#333] text-slate-600 dark:text-slate-300 font-mono">
                          {subdoc.filename}
                        </span>
                      </div>
                      <button
                        onClick={() => removeMasterSubdocument(subdoc.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Unlink Subdocument"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {subdoc.expanded && (
                      <div
                        className="p-2.5 bg-slate-50 dark:bg-[#1E1E1E] rounded border text-xs text-slate-700 dark:text-slate-300 ml-6"
                        dangerouslySetInnerHTML={{ __html: subdoc.content }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Subdocument */}
              <form
                onSubmit={handleAddSubdocument}
                className="p-3 bg-slate-50 dark:bg-[#252526] rounded border space-y-3"
              >
                <div className="font-semibold text-xs text-[#0F6CBD] flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4" />
                  <span>Link New Subdocument</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium block mb-1">Subdocument Title:</label>
                    <input
                      type="text"
                      required
                      value={newSubDocTitle}
                      onChange={(e) => setNewSubDocTitle(e.target.value)}
                      placeholder="e.g. Chapter 3: Implementation..."
                      className="w-full px-2.5 py-1.5 rounded border bg-white dark:bg-[#1E1E1E] text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium block mb-1">Target Filename:</label>
                    <input
                      type="text"
                      value={newSubDocFile}
                      onChange={(e) => setNewSubDocFile(e.target.value)}
                      placeholder="e.g. chapter_03.docx"
                      className="w-full px-2.5 py-1.5 rounded border bg-white dark:bg-[#1E1E1E] text-xs outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold"
                  >
                    Attach Subdocument
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#2D2D2D] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 dark:border-[#444] rounded text-xs hover:bg-slate-100 dark:hover:bg-[#333]"
          >
            Cancel
          </button>
          {activeTab === "outline" && (
            <button
              onClick={handleApply}
              className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold shadow-sm"
            >
              Apply Outline Structure
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
