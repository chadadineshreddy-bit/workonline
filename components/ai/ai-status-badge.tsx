"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Trash2,
  Server,
  Cloud,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import {
  checkAiStatus,
  getClientGeminiKey,
  setClientGeminiKey,
  WORKONLINE_KEY_EVENT,
} from "@/lib/ai/ai-client";
import { AiStatusResponse } from "@/lib/ai/types";

export function AiStatusBadge() {
  const [status, setStatus] = useState<AiStatusResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"instant" | "vercel">("instant");
  const [copiedKey, setCopiedKey] = useState(false);

  const refreshStatus = async (runTest = false) => {
    try {
      const data = await checkAiStatus(runTest);
      setStatus(data);
      return data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    refreshStatus();
    const stored = getClientGeminiKey();
    if (stored) {
      setApiKeyInput(stored);
    }

    const handleKeyUpdated = () => {
      refreshStatus();
    };

    window.addEventListener(WORKONLINE_KEY_EVENT, handleKeyUpdated);
    return () => window.removeEventListener(WORKONLINE_KEY_EVENT, handleKeyUpdated);
  }, []);

  const handleSaveAndTest = async () => {
    const key = apiKeyInput.trim();
    if (!key) {
      setTestResult({ success: false, message: "Please enter a valid Gemini API key." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Temporarily save to localStorage so checkAiStatus will attach it
    setClientGeminiKey(key);

    try {
      const res = await checkAiStatus(true);
      if (res.testPassed) {
        setStatus(res);
        setTestResult({
          success: true,
          message: `Connected successfully! Google Gemini (${res.model}) is ready to use.`,
        });
      } else {
        setTestResult({
          success: false,
          message: res.instructions || "Invalid API key or model unreachable.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to reach AI verification endpoint.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearKey = () => {
    setClientGeminiKey("");
    setApiKeyInput("");
    setTestResult(null);
    refreshStatus();
  };

  const handleCopyEnvSnippet = () => {
    navigator.clipboard.writeText("GEMINI_API_KEY=" + (apiKeyInput || "your_api_key_here") + "\nAI_MODEL=gemini-3.5-flash");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!status) return null;

  return (
    <>
      {status.configured ? (
        <button
          onClick={() => {
            setTestResult(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-xs"
          title="Click to view AI status or change API key"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini AI Connected</span>
          <span className="text-[10px] opacity-75 font-mono">({status.source === "server" ? "Vercel Env" : "Saved Key"})</span>
        </button>
      ) : (
        <button
          onClick={() => {
            setTestResult(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] dark:text-[#FB7185] hover:bg-red-500/20 transition-all cursor-pointer animate-pulse"
        >
          <Key className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Setup Gemini API Key</span>
        </button>
      )}

      {/* Setup & Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-[24px] bg-white dark:bg-[#171114] border border-slate-200 dark:border-white/15 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-800 dark:text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Configure Gemini AI</h3>
                  <p className="text-xs text-slate-500 dark:text-[#9E8E93]">
                    Active Model: <code className="font-mono text-[#DC2626] dark:text-[#FB7185]">{status.model || "gemini-3.5-flash"}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-[#9E8E93] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selection */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setActiveTab("instant")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "instant"
                    ? "bg-[#DC2626] text-white shadow-sm"
                    : "text-slate-600 dark:text-[#9E8E93] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Quick Instant Key</span>
              </button>
              <button
                onClick={() => setActiveTab("vercel")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "vercel"
                    ? "bg-[#DC2626] text-white shadow-sm"
                    : "text-slate-600 dark:text-[#9E8E93] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Vercel Deploy Env</span>
              </button>
            </div>

            {/* Tab 1: Instant Browser Key */}
            {activeTab === "instant" && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-[#9E8E93] leading-relaxed">
                  Enter your Google Gemini API key to activate real AI across document summarization, PDF QA, note taking, and quiz generation.
                </p>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Google Gemini API Key</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#DC2626] dark:text-[#FB7185] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      Get Free Key at AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <div className="relative">
                    <input
                      type={showKeyText ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste AIzaSy... or AQ.Ab8..."
                      className="w-full px-3.5 py-2.5 pr-20 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowKeyText(!showKeyText)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        title={showKeyText ? "Hide key" : "Show key"}
                      >
                        {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {apiKeyInput && (
                        <button
                          type="button"
                          onClick={handleClearKey}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Clear key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validation Test Alert */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      testResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-tight">{testResult.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSaveAndTest}
                    disabled={isTesting || !apiKeyInput.trim()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-[#DC2626]/30 cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying with Google...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save & Connect Key</span>
                      </>
                    )}
                  </button>
                  {status.configured && status.source === "client" && (
                    <button
                      onClick={handleClearKey}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-[#9E8E93] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {/* Privacy Guarantee Note */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#9E8E93] text-[11px] leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Your key is saved locally in your own browser&apos;s secure storage. It is only passed to WorkOnline&apos;s private serverless proxy to invoke Google Gemini.
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Vercel Permanent Environment Setup */}
            {activeTab === "vercel" && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-[#9E8E93] leading-relaxed">
                  To provide AI access to <strong>all users and visitors</strong> of your deployed Vercel site without requiring them to enter a key, add your environment variable in Vercel:
                </p>

                <div className="rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-4 space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-[#E2D4D6]">
                    <li>
                      Go to{" "}
                      <a
                        href="https://vercel.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#DC2626] dark:text-[#FB7185] hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        Vercel Dashboard <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>Select your <strong>workonline</strong> project.</li>
                    <li>
                      Navigate to <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.
                    </li>
                    <li>
                      Add the following key-value pairs:
                      <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                        <div className="p-2.5 rounded-lg bg-black/60 dark:bg-black/80 text-[#FB7185] border border-white/10 flex items-center justify-between">
                          <span>GEMINI_API_KEY = your_key_here</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/60 dark:bg-black/80 text-[#FB7185] border border-white/10 flex items-center justify-between">
                          <span>AI_MODEL = gemini-3.5-flash</span>
                        </div>
                      </div>
                    </li>
                    <li>Redeploy or promote the latest deployment.</li>
                  </ol>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={handleCopyEnvSnippet}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? "Copied!" : "Copy Env Snippet"}</span>
                  </button>

                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
