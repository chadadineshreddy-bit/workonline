"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, Trash2, X, AlertTriangle, FileText } from "lucide-react";
import { useWordStore } from "./word-state";

interface DocumentInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSanitizeDocument: (removeOptions: {
    removeComments: boolean;
    removeAuthorMetadata: boolean;
    removeWatermark: boolean;
    removeHiddenText: boolean;
  }) => void;
}

export const DocumentInspectorModal: React.FC<DocumentInspectorModalProps> = ({
  isOpen,
  onClose,
  onSanitizeDocument,
}) => {
  const { comments, watermarkText } = useWordStore();

  const [hasScanned, setHasScanned] = useState(false);
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleScan = () => {
    setHasScanned(true);
  };

  const handleRemoveComments = () => {
    onSanitizeDocument({
      removeComments: true,
      removeAuthorMetadata: false,
      removeWatermark: false,
      removeHiddenText: false,
    });
    setRemovedItems((prev) => [...prev, "comments"]);
  };

  const handleRemoveMetadata = () => {
    onSanitizeDocument({
      removeComments: false,
      removeAuthorMetadata: true,
      removeWatermark: false,
      removeHiddenText: false,
    });
    setRemovedItems((prev) => [...prev, "metadata"]);
  };

  const handleRemoveWatermark = () => {
    onSanitizeDocument({
      removeComments: false,
      removeAuthorMetadata: false,
      removeWatermark: true,
      removeHiddenText: false,
    });
    setRemovedItems((prev) => [...prev, "watermark"]);
  };

  const handleRemoveAll = () => {
    onSanitizeDocument({
      removeComments: true,
      removeAuthorMetadata: true,
      removeWatermark: true,
      removeHiddenText: true,
    });
    setRemovedItems(["comments", "metadata", "watermark", "hidden"]);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-slate-100 rounded-lg shadow-2xl border border-slate-300 dark:border-[#333333] overflow-hidden flex flex-col text-sm font-sans">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0F6CBD] text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-white/90" />
            <span className="font-semibold">Document Inspector &amp; Privacy Scrubber</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Before sharing your document, inspect it for hidden data, personal metadata, or tracked revisions that you might not want to disclose.
          </p>

          {!hasScanned ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-[#252526] rounded-lg border border-dashed border-slate-300 dark:border-[#444] space-y-3">
              <ShieldCheck className="w-10 h-10 text-[#0F6CBD] mx-auto opacity-80" />
              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Ready to inspect document
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                DocuFlow will check for comments, revision history, author credentials, watermarks, and hidden elements.
              </p>
              <button
                type="button"
                onClick={handleScan}
                className="px-5 py-2 bg-[#0F6CBD] hover:bg-[#115EA3] text-white rounded text-xs font-semibold shadow-sm transition-colors"
              >
                Inspect Document Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Inspection Item 1: Comments */}
              <div className="p-3 bg-slate-50 dark:bg-[#252526] rounded border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {comments.length > 0 && !removedItems.includes("comments") ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span>Comments &amp; Revision Notes</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {removedItems.includes("comments")
                      ? "All comments removed."
                      : comments.length > 0
                      ? `${comments.length} comment threads found in document.`
                      : "No comments found."}
                  </p>
                </div>
                {comments.length > 0 && !removedItems.includes("comments") && (
                  <button
                    onClick={handleRemoveComments}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium"
                  >
                    Remove All
                  </button>
                )}
              </div>

              {/* Inspection Item 2: Author metadata */}
              <div className="p-3 bg-slate-50 dark:bg-[#252526] rounded border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {!removedItems.includes("metadata") ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span>Document Properties &amp; Author Info</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {removedItems.includes("metadata")
                      ? "Personal author metadata scrubbed."
                      : "Author: Dinesh Reddy Chada, Last Saved timestamp."}
                  </p>
                </div>
                {!removedItems.includes("metadata") && (
                  <button
                    onClick={handleRemoveMetadata}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium"
                  >
                    Remove All
                  </button>
                )}
              </div>

              {/* Inspection Item 3: Watermark */}
              <div className="p-3 bg-slate-50 dark:bg-[#252526] rounded border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {watermarkText && !removedItems.includes("watermark") ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span>Watermark &amp; Background Text</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {removedItems.includes("watermark")
                      ? "Watermark cleared."
                      : watermarkText
                      ? `Active watermark: "${watermarkText}"`
                      : "No active watermark."}
                  </p>
                </div>
                {watermarkText && !removedItems.includes("watermark") && (
                  <button
                    onClick={handleRemoveWatermark}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Remove all button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleRemoveAll}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Scrub All Privacy Data</span>
                </button>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
