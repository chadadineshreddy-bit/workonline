"use client";

import React from "react";
import { History, RotateCcw, Trash2, X, FileCheck, AlertCircle } from "lucide-react";
import { useWordStore } from "./word-state";

interface CrashRecoveryPaneProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreContent: (html: string) => void;
}

export const CrashRecoveryPane: React.FC<CrashRecoveryPaneProps> = ({
  isOpen,
  onClose,
  onRestoreContent,
}) => {
  const { autoRecoverSnapshot, setAutoRecoverSnapshot, setHasRecoverySession } = useWordStore();

  if (!isOpen || !autoRecoverSnapshot) return null;

  const handleRestore = () => {
    onRestoreContent(autoRecoverSnapshot.html);
    setHasRecoverySession(false);
    onClose();
  };

  const handleDiscard = () => {
    setAutoRecoverSnapshot(null);
    setHasRecoverySession(false);
    onClose();
  };

  return (
    <aside className="w-80 border-l border-slate-300 dark:border-[#333333] bg-[#F9F9FB] dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 flex flex-col h-full z-40 shadow-lg text-xs">
      {/* Title */}
      <div className="px-4 py-3 bg-[#D97706] text-white flex items-center justify-between select-none">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-white/90" />
          <span className="font-semibold">Document Recovery</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Word recovered the following document files. Save the ones you want to keep.
        </p>

        {/* Recovered File Card */}
        <div className="p-3 bg-white dark:bg-[#252526] rounded-lg border border-amber-300 dark:border-amber-700/60 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                {autoRecoverSnapshot.title || "Recovered Document"}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                AutoSaved: {autoRecoverSnapshot.timestamp}
              </span>
              <span className="text-[10px] text-slate-400">
                Word count: ~{autoRecoverSnapshot.wordCount || 0} words
              </span>
            </div>
            <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>

          <div className="flex gap-2 pt-1 border-t">
            <button
              onClick={handleRestore}
              className="flex-1 py-1.5 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded font-semibold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </button>
            <button
              onClick={handleDiscard}
              className="py-1.5 px-3 border border-slate-300 hover:bg-slate-100 dark:hover:bg-[#333] rounded text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
              title="Discard backup"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
