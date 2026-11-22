"use client";

import React, { useState } from "react";
import { Keyboard, RotateCcw, Check, X, Search, Sparkles } from "lucide-react";
import { useWordStore } from "./word-state";

interface CustomizeShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_COMMANDS = [
  { id: "save", name: "File: Save Document", category: "File" },
  { id: "find", name: "Edit: Quick Find", category: "Edit" },
  { id: "replace", name: "Edit: Find & Replace", category: "Edit" },
  { id: "cutToSpike", name: "Edit: Cut to Spike (Append)", category: "Edit" },
  { id: "pasteSpike", name: "Edit: Paste Spike & Clear", category: "Edit" },
  { id: "toggleFieldCodes", name: "View: Toggle Field Codes", category: "View" },
  { id: "updateFields", name: "Tools: Update All Dynamic Fields", category: "Tools" },
  { id: "lockFields", name: "Tools: Lock Dynamic Fields", category: "Tools" },
  { id: "unlockFields", name: "Tools: Unlock Dynamic Fields", category: "Tools" },
  { id: "expandSnippet", name: "Insert: Auto-Expand Quick Part", category: "Insert" },
  { id: "revealFormatting", name: "View: Reveal Formatting Inspector", category: "View" },
  { id: "print", name: "File: Print / PDF", category: "File" },
  { id: "fontDialog", name: "Format: Font Dialog Box", category: "Format" },
];

export const CustomizeShortcutsModal: React.FC<CustomizeShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customShortcuts, setCustomShortcut, resetShortcutsToDefault } = useWordStore();

  const [search, setSearch] = useState("");
  const [selectedCmdId, setSelectedCmdId] = useState<string>("cutToSpike");
  const [recordedKeys, setRecordedKeys] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const filteredCommands = ALL_COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    e.preventDefault();

    const parts: string[] = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    if (e.metaKey) parts.push("Meta");

    const key = e.key;
    if (!["Control", "Alt", "Shift", "Meta"].includes(key)) {
      parts.push(key.length === 1 ? key.toUpperCase() : key);
      const combo = parts.join("+");
      setRecordedKeys(combo);
      setIsRecording(false);
    }
  };

  const handleAssign = () => {
    if (!recordedKeys || !selectedCmdId) return;
    setCustomShortcut(selectedCmdId, recordedKeys);
    setRecordedKeys("");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col text-sm font-sans">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <Keyboard className="w-4 h-4 text-white/90" />
            <span className="font-semibold">Customize Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search command name..."
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 dark:border-[#444] bg-white dark:bg-[#1E1E1E] text-xs outline-none focus:ring-1 focus:ring-[#0F6CBD]"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Command list */}
          <div className="border border-slate-200 dark:border-[#333] rounded overflow-y-auto max-h-64 p-1 space-y-1">
            {filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={() => {
                  setSelectedCmdId(cmd.id);
                  setRecordedKeys("");
                  setIsRecording(false);
                }}
                className={`p-2 rounded text-xs cursor-pointer flex justify-between items-center transition-colors ${
                  selectedCmdId === cmd.id
                    ? "bg-[#0F6CBD] text-white font-medium"
                    : "hover:bg-slate-100 dark:hover:bg-[#2A2A2D]"
                }`}
              >
                <span>{cmd.name}</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-black/10 dark:bg-white/10 font-mono">
                  {customShortcuts[cmd.id] || "None"}
                </kbd>
              </div>
            ))}
          </div>

          {/* Key Recorder */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                Assign New Shortcut Key:
              </span>
              <div
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onClick={() => setIsRecording(true)}
                className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-colors outline-none ${
                  isRecording
                    ? "border-[#0F6CBD] bg-blue-50/50 dark:bg-blue-950/20 text-[#0F6CBD]"
                    : "border-dashed border-slate-300 dark:border-[#444] hover:border-slate-400"
                }`}
              >
                <span className="text-xs font-semibold block">
                  {isRecording
                    ? "Press desired key combination now..."
                    : recordedKeys || "Click here to record shortcut"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  e.g., Ctrl+F3, Alt+F9, Shift+F1
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAssign}
                disabled={!recordedKeys}
                className="w-full py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded font-semibold text-xs shadow-sm disabled:opacity-40 transition-colors"
              >
                Assign Shortcut
              </button>
              <button
                type="button"
                onClick={resetShortcutsToDefault}
                className="w-full py-1.5 border border-slate-300 dark:border-[#444] rounded text-xs hover:bg-slate-100 dark:hover:bg-[#333] flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default MS Word Bindings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-[#252526] border-t border-slate-200 dark:border-[#2D2D2D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0F6CBD] text-white rounded text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
