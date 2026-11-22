"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Trash2, Check, X, FileText, Layout, Sparkles, Layers } from "lucide-react";
import { useWordStore, BuildingBlockItem } from "./word-state";

interface BuildingBlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet: (html: string) => void;
  currentSelectedHtml?: string;
}

export const BuildingBlocksModal: React.FC<BuildingBlocksModalProps> = ({
  isOpen,
  onClose,
  onInsertSnippet,
  currentSelectedHtml = "",
}) => {
  const { buildingBlocks, addBuildingBlock, deleteBuildingBlock } = useWordStore();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedBlockId, setSelectedBlockId] = useState<string>(buildingBlocks[0]?.id || "");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Block form fields
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<BuildingBlockItem["category"]>("AutoText");
  const [newDesc, setNewDesc] = useState("");
  const [newContent, setNewContent] = useState(currentSelectedHtml || "<p>Reusable snippet content</p>");

  if (!isOpen) return null;

  const categories = ["All", "AutoText", "Callout", "Header", "Cover Page", "Table", "Signature"];

  const filteredBlocks =
    activeCategory === "All"
      ? buildingBlocks
      : buildingBlocks.filter((b) => b.category === activeCategory);

  const selectedBlock = buildingBlocks.find((b) => b.id === selectedBlockId) || filteredBlocks[0];

  const handleSaveNewBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const block: BuildingBlockItem = {
      id: `bb-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      description: newDesc.trim() || `${newCategory} building block`,
      content: newContent,
    };

    addBuildingBlock(block);
    setSelectedBlockId(block.id);
    setShowCreateForm(false);
    setNewName("");
    setNewDesc("");
  };

  const handleInsert = (block?: BuildingBlockItem) => {
    const target = block || selectedBlock;
    if (target) {
      onInsertSnippet(target.content);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col max-h-[85vh] text-sm">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white/90" />
            <span className="font-semibold">Building Blocks Organizer (Quick Parts &amp; AutoText)</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2D2D2D] px-4 py-2 bg-slate-50 dark:bg-[#252526]">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-[#0F6CBD] text-white"
                    : "bg-slate-200 dark:bg-[#333333] text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowCreateForm(true);
              if (currentSelectedHtml) setNewContent(currentSelectedHtml);
            }}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Selection as Quick Part</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Blocks List */}
          <div className="w-1/2 border-r border-slate-200 dark:border-[#2D2D2D] overflow-y-auto p-3 space-y-2">
            {filteredBlocks.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No building blocks found in this category. Click &quot;Save Selection&quot; to create one.
              </div>
            ) : (
              filteredBlocks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBlockId(b.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedBlock?.id === b.id
                      ? "border-[#0F6CBD] bg-[#0F6CBD]/10 text-slate-900 dark:text-white ring-1 ring-[#0F6CBD]"
                      : "border-slate-200 dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#2A2A2D]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">{b.name}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#3E3E42] text-slate-600 dark:text-slate-300">
                      {b.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{b.description}</p>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-[#333] rounded">F3</kbd> in document to expand &quot;{b.name}&quot;
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Block Preview Pane */}
          <div className="w-1/2 p-4 flex flex-col justify-between bg-slate-50 dark:bg-[#1A1A1A] overflow-y-auto">
            {showCreateForm ? (
              <form onSubmit={handleSaveNewBlock} className="space-y-3">
                <div className="font-semibold text-xs border-b pb-1 text-[#0F6CBD]">
                  Create Reusable AutoText / Quick Part
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Snippet Name:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Company Disclaimer, Signature..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] text-xs outline-none"
                  >
                    <option value="AutoText">AutoText</option>
                    <option value="Callout">Callout</option>
                    <option value="Header">Header</option>
                    <option value="Cover Page">Cover Page</option>
                    <option value="Table">Table</option>
                    <option value="Signature">Signature</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Description:</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Brief description of this block..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">HTML Content:</label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#252526] text-xs font-mono outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 border rounded text-xs hover:bg-slate-200 dark:hover:bg-[#333]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold"
                  >
                    Save Building Block
                  </button>
                </div>
              </form>
            ) : selectedBlock ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {selectedBlock.name}
                      </h4>
                      <p className="text-xs text-slate-500">{selectedBlock.description}</p>
                    </div>
                    {selectedBlock.id.startsWith("bb-") && (
                      <button
                        onClick={() => deleteBuildingBlock(selectedBlock.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                        title="Delete block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1.5">
                      Visual Preview:
                    </span>
                    <div
                      className="p-3 bg-white text-slate-900 border border-slate-200 rounded-md shadow-inner max-h-48 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: selectedBlock.content }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Category: <strong>{selectedBlock.category}</strong>
                  </span>
                  <button
                    onClick={() => handleInsert(selectedBlock)}
                    className="px-4 py-2 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Insert into Document</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-10">Select a block to preview</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-[#252526] border-t border-slate-200 dark:border-[#2D2D2D] text-xs text-slate-500 flex justify-between items-center">
          <span>Tip: Type the building block name in your document and press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-[#333] rounded">F3</kbd> for instant insertion.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 border border-slate-300 dark:border-[#444] rounded text-xs hover:bg-slate-200 dark:hover:bg-[#333]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
