"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Key, ExternalLink, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { checkAiStatus } from "@/lib/ai/ai-client";
import { AiStatusResponse } from "@/lib/ai/types";

export function AiStatusBadge() {
  const [status, setStatus] = useState<AiStatusResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAiStatus().then(setStatus).catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <>
      {status.configured ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-[#DC2626]/30 text-xs font-semibold text-[#FB7185]">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
          <span>Gemini AI Connected</span>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.045] border border-white/10 text-xs font-medium text-[#9E8E93] hover:text-white transition-all"
        >
          <Key className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Setup Gemini API Key</span>
        </button>
      )}

      {/* Setup Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-[24px] bg-[#171114] border border-white/15 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Configure AI Workspace</h3>
                  <p className="text-xs text-[#9E8E93]">Genuine server-side Google Gemini</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-[#9E8E93] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#E2D4D6]">
              <p className="leading-relaxed text-[#9E8E93]">
                WorkOnline uses a <strong className="text-white">genuine server-side Google Gemini model</strong> for document understanding, text generation, and quizzes with zero fake simulated answers.
              </p>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
                <p className="font-bold text-[#FB7185] text-xs uppercase tracking-wider">
                  Quick 2-Minute Setup:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-[#9E8E93]">
                  <li>
                    Get a free API key at{" "}
                    <a
                      href="https://aistudio.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FB7185] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Open or create <code className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-white font-mono">.env.local</code> in your project root.
                  </li>
                  <li>
                    Add your key:
                    <pre className="mt-1.5 p-3 bg-black/50 border border-white/10 text-[#FB7185] rounded-xl text-[11px] font-mono overflow-x-auto">
                      GEMINI_API_KEY=your_actual_key_here
                    </pre>
                  </li>
                  <li>
                    Restart your server (<code className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded font-mono text-white">npm run dev</code>).
                  </li>
                </ol>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-[#E2D4D6]">
                <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#FB7185]">Confidentiality Guarantee:</strong> Your API key is stored strictly on the server and is never exposed in browser JavaScript.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold transition-colors shadow-sm shadow-[#DC2626]/30"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
