"use client";

import React from "react";
import { Layers, Eye, EyeOff, ArrowUp, ArrowDown, Anchor, Lock, X } from "lucide-react";
import { useWordStore, FloatingLayerItem } from "./word-state";

interface SelectionLayerPaneProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SelectionLayerPane: React.FC<SelectionLayerPaneProps> = ({ isOpen, onClose }) => {
  const {
    floatingLayers,
    toggleLayerVisibility,
    reorderLayer,
    selectedLayerId,
    setSelectedLayerId,
    setFloatingLayers,
  } = useWordStore();

  if (!isOpen) return null;

  const handleToggleLockAnchor = (id: string) => {
    setFloatingLayers(
      floatingLayers.map((l) => (l.id === id ? { ...l, lockAnchor: !l.lockAnchor } : l))
    );
  };

  const handleToggleMoveWithText = (id: string) => {
    setFloatingLayers(
      floatingLayers.map((l) => (l.id === id ? { ...l, moveWithText: !l.moveWithText } : l))
    );
  };

  return (
    <aside className="w-80 border-l border-slate-300 dark:border-[#333333] bg-[#F9F9FB] dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 flex flex-col h-full z-40 shadow-lg text-xs">
      {/* Title */}
      <div className="px-4 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-medium">
          <Layers className="w-4 h-4 text-white/90" />
          <span className="font-semibold">Selection &amp; Layer Pane (Alt+F10)</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Bar */}
      <div className="p-2 border-b border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase">
          Z-Index Stack ({floatingLayers.length} objects)
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => selectedLayerId && reorderLayer(selectedLayerId, "up")}
            disabled={!selectedLayerId}
            title="Bring Forward"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#333] disabled:opacity-40"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedLayerId && reorderLayer(selectedLayerId, "down")}
            disabled={!selectedLayerId}
            title="Send Backward"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#333] disabled:opacity-40"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1.5">
        {floatingLayers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => setSelectedLayerId(layer.id)}
            className={`p-2 rounded border flex items-center justify-between transition-colors cursor-pointer ${
              selectedLayerId === layer.id
                ? "border-[#0F6CBD] bg-[#0F6CBD]/10 text-slate-900 dark:text-white"
                : "border-slate-200 dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#252526]"
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-0.5"
                title={layer.visible ? "Hide object" : "Show object"}
              >
                {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
              </button>
              <span className={`truncate font-medium text-xs ${!layer.visible ? "line-through opacity-50" : ""}`}>
                {layer.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLockAnchor(layer.id);
                }}
                className={`p-1 rounded ${
                  layer.lockAnchor ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40" : "text-slate-400 hover:text-slate-600"
                }`}
                title="Lock Anchor to paragraph"
              >
                <Anchor className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMoveWithText(layer.id);
                }}
                className={`p-1 rounded ${
                  layer.moveWithText ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600"
                }`}
                title="Move object with text"
              >
                <Lock className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Layer Settings */}
      {selectedLayerId && (
        <div className="p-3 border-t border-slate-200 dark:border-[#2D2D2D] bg-slate-50 dark:bg-[#252526] space-y-2">
          <div className="font-semibold text-xs text-slate-700 dark:text-slate-200">
            Selected Object Properties
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => reorderLayer(selectedLayerId, "front")}
              className="px-2 py-1 bg-white dark:bg-[#333] border rounded text-xs hover:bg-slate-100"
            >
              Bring to Front
            </button>
            <button
              onClick={() => reorderLayer(selectedLayerId, "back")}
              className="px-2 py-1 bg-white dark:bg-[#333] border rounded text-xs hover:bg-slate-100"
            >
              Send to Back
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
